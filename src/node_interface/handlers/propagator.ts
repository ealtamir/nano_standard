import { NanoPriceData } from "../prices_models.ts";
import { SubscriptionManager } from "../../subscription_manager.ts";
import { sql } from "../../db.ts";
import { redis } from "../../redis_client.ts";
import { logger } from "../../logger.ts";
import { config } from "../../config_loader.ts";
import { Packr } from "npm:msgpackr";
import { QueryManager } from "./query_manager.ts";
import {
  NanoConfirmationData,
  NanoUniqueAccountsData,
  NanoVolumeData,
} from "../models.ts";

export interface TimeSeriesData {
  interval_time: string | Date;
  currency: string;
  price: number;
  total_nano_transmitted: number;
  value_transmitted_in_currency: number;
  confirmation_count?: number;
  gini_coefficient?: number;
}

export interface TimeSeriesUpdate {
  timestamp: string;
  viewType: "5m" | "1h" | "1d";
  data: TimeSeriesData[];
}

export interface QueryData {
  volume: {
    data: NanoVolumeData[];
    key: string;
  };
  price: {
    data: NanoPriceData[];
    key: string;
  };
  confirmations: {
    data: NanoConfirmationData[];
    key: string;
  };
  unique_accounts: {
    data: NanoUniqueAccountsData[];
    key: string;
  };
  bucket_distribution: {
    data: any[];
    key: string;
  };
}

export class Propagator {
  private readonly CHANNEL_NAME = "nano:timeseries:updates";
  private lastPricesUpdateTime: string | null = null;
  private packr = new Packr();

  constructor(
    nano_caller: SubscriptionManager,
    utc_caller: SubscriptionManager,
    private readonly redisClient: typeof redis,
  ) {
    nano_caller.subscribe<NanoPriceData>(
      "nano-price-update",
      async () => {
        await this.propagateData5m();
        this.lastPricesUpdateTime = new Date().toISOString();
      },
    );
    utc_caller.subscribe<{ interval: "1h" | "1d"; force?: boolean }>(
      "interval-update",
      async (data) => {
        if (data.force || !(await this.hasRecentData(data.interval))) {
          await this.propagateData(data.interval);
          await logger.log(
            `Successfully propagated ${data.interval} data to Redis`,
          );
        } else {
          await logger.log(
            `Skipping ${data.interval} propagation as recent data exists in Redis`,
          );
        }
      },
    );
    this.redisClient = redisClient;
  }

  private async hasRecentData(interval: "1h" | "1d"): Promise<boolean> {
    if (!this.redisClient.isOpen) {
      await this.redisClient.connect();
    }

    try {
      // We get the key for one of the data categories, as they all
      // get updated in transaction fashion.
      const latestUpdateKey =
        `${config.propagator.nano_volume_key}:${interval}:status`;
      const latestUpdateStr = await this.redisClient.get(latestUpdateKey);

      if (!latestUpdateStr) {
        return false;
      }

      const latestUpdate: { viewType: string; timestamp: string } = JSON.parse(
        latestUpdateStr,
      );
      const lastUpdateTime = new Date(latestUpdate.timestamp);
      const now = new Date();

      // Check if the data is fresh enough based on the interval
      const thresholdMs = interval === "1h"
        ? 60 * 60 * 1000
        : 24 * 60 * 60 * 1000;
      const ageMs = now.getTime() - lastUpdateTime.getTime();

      return ageMs < thresholdMs;
    } catch (error) {
      await logger.log(
        `Error checking Redis data freshness: ${error}`,
        "ERROR",
      );
      return false;
    }
  }

  private async propagateData5m(): Promise<void> {
    if (!this.redisClient.isOpen) {
      await this.redisClient.connect();
    }
    try {
      // Use QueryManager to refresh materialized views
      await QueryManager.refreshMaterializedViews();
      await this.propagateData("5m");
    } catch (error) {
      await logger.log(`Error propagating time series data: ${error}`, "ERROR");
      throw error;
    }
  }

  public async propagateData(interval: "5m" | "1h" | "1d") {
    const data = await this.callQueries(interval);
    await this.processQueryData(data);
    await logger.log(`Successfully propagated ${interval} data to Redis`);
  }

  private async callQueries(
    interval: "5m" | "1h" | "1d",
  ): Promise<QueryData> {
    const [
      volume_data,
      price_data,
      confirmation_data,
      unique_accounts_data,
      bucket_distribution_data,
    ] = await Promise.all([
      QueryManager.getNanoVolume(interval),
      QueryManager.getNanoPrices(interval),
      QueryManager.getNanoConfirmations(interval),
      QueryManager.getNanoUniqueAccounts(interval),
      QueryManager.getNanoBucketDistribution(interval),
    ]);

    return {
      volume: {
        data: volume_data as unknown as NanoVolumeData[],
        key: `${config.propagator.nano_volume_key}:${interval}`,
      },
      price: {
        data: price_data as unknown as NanoPriceData[],
        key: `${config.propagator.nano_prices_key}:${interval}`,
      },
      confirmations: {
        data: confirmation_data as unknown as NanoConfirmationData[],
        key: `${config.propagator.nano_confirmations_key}:${interval}`,
      },
      unique_accounts: {
        data: unique_accounts_data as unknown as NanoUniqueAccountsData[],
        key: `${config.propagator.nano_unique_accounts_key}:${interval}`,
      },
      bucket_distribution: {
        data: bucket_distribution_data as unknown as any[],
        key: `${config.propagator.nano_bucket_distribution_key}:${interval}`,
      },
    };
  }

  private async processQueryData(data: QueryData) {
    // Store and publish time series updates

    const pipeline = this.redisClient.multi();
    const latestPrices = await this.fetchLatestPrices();
    await logger.log(
      `Publishing prices to redis: ${JSON.stringify(latestPrices)}`,
    );
    this.publishToRedis(
      pipeline,
      config.propagator.prices_latest_key,
      JSON.stringify(latestPrices),
      {
        type: "update",
        viewType: config.propagator.prices_latest_key,
        timestamp: new Date().toISOString(),
      },
      config.propagator.updates_channel_name,
    );

    for (const [entry, value] of Object.entries(data)) {
      const key = value.key;
      await logger.log(
        `Publishing ${key} to redis: ${
          JSON.stringify(value.data).slice(0, 50)
        }`,
      );
      this.publishToRedis(
        pipeline,
        key,
        JSON.stringify(value.data),
        {
          type: "update",
          viewType: key,
          timestamp: new Date().toISOString(),
        },
        config.propagator.updates_channel_name,
      );
    }
    await pipeline.exec();
  }

  private publishToRedis(
    pipeline: any,
    key: string,
    data: any,
    publishData: any,
    channel_name: string,
  ): void {
    pipeline.set(key, data);
    pipeline.set(`${key}:status`, JSON.stringify(publishData));
    pipeline.publish(channel_name, JSON.stringify(publishData));
  }

  private async fetchLatestPrices(): Promise<Record<string, number>> {
    const lookbackMinutes = 1000; // Adjust based on your update frequency + buffer

    const latestPrices = await sql<Array<{ currency: string; price: number }>>`
            WITH LatestTimestamps AS (
                SELECT currency, MAX(last_updated_at) as max_timestamp
                FROM crypto_prices
                WHERE symbol = 'NANO'
                AND last_updated_at >= NOW() - (${lookbackMinutes} * interval '1 minute')
                GROUP BY currency
            )
            SELECT 
                cp.currency,
                cp.price
            FROM crypto_prices cp
            INNER JOIN LatestTimestamps lt 
                ON cp.currency = lt.currency 
                AND cp.last_updated_at = lt.max_timestamp
            WHERE cp.symbol = 'NANO'
            ORDER BY cp.currency;
        `;

    // Convert array of price objects to a simple currency->price mapping
    return latestPrices.reduce((acc, { currency, price }) => {
      acc[currency.toLowerCase()] = price;
      return acc;
    }, {} as Record<string, number>);
  }

  /**
   * Fetches the last update times for all time series and price channels
   * @returns Object containing timestamps for each channel
   */
  public async getLastUpdateTimes(): Promise<Record<string, string | null>> {
    try {
      const keys = [
        config.propagator.nano_volume_key + ":5m",
        config.propagator.nano_prices_key + ":5m",
        config.propagator.nano_confirmations_key + ":5m",
        config.propagator.nano_unique_accounts_key + ":5m",
        config.propagator.nano_bucket_distribution_key + ":5m",
        config.propagator.prices_latest_key,
      ];

      const results: [string, string | null][] = await Promise.all(
        keys.map(async (key) => {
          const data = await this.redisClient.get(key);
          if (!data) return [key, null];
          return [key, JSON.parse(data).timestamp];
        }),
      );

      return Object.fromEntries(results);
    } catch (error) {
      await logger.log(`Error fetching last update times: ${error}`, "ERROR");
      throw error;
    }
  }
}
