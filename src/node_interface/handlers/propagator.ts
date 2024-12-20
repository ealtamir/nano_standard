import { NanoPriceData } from "../prices_models.ts";
import { SubscriptionManager } from "../../subscription_manager.ts";
import { sql } from "../../db.ts";
import { redis } from "../../redis_client.ts";
import { logger } from "../../logger.ts";
import { config } from "../../config_loader.ts";
import { Packr } from "npm:msgpackr";

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

export class Propagator {
  private readonly CHANNEL_NAME = "nano:timeseries:updates";
  private lastPricesUpdateTime: string | null = null;
  private packr = new Packr();

  constructor(
    subscriptionManager: SubscriptionManager,
    private readonly redisClient: typeof redis,
  ) {
    subscriptionManager.subscribe<NanoPriceData>(
      "nano-price-update",
      async () => {
        await this.propagateTimeSeriesData();
        this.lastPricesUpdateTime = new Date().toISOString();
      },
    );
    this.redisClient = redisClient;
  }

  private async propagateTimeSeriesData(): Promise<void> {
    if (!this.redisClient.isOpen) {
      await this.redisClient.connect();
    }
    try {
      const timestamp = new Date().toISOString();

      // Refresh materialized view before fetching any data
      await sql`REFRESH MATERIALIZED VIEW nano_prices_5m_base;`;
      await sql`REFRESH MATERIALIZED VIEW nano_prices_5m;`;

      // Fetch data from all views with their respective intervals
      const [data5m, data1h, data1d, nano_prices] = await Promise.all([
        this.fetchTimeSeriesData("integrated_metrics_5m", "24 hours"),
        this.fetchTimeSeriesData("integrated_metrics_1h", "15 days"),
        this.fetchTimeSeriesData("integrated_metrics_1d", "365 days"),
        this.fetchLatestPrices(),
      ]);

      const pipeline = this.redisClient.multi();

      // Prepare update messages for each time series
      const updates: TimeSeriesUpdate[] = [
        { timestamp, viewType: "5m", data: data5m },
        { timestamp, viewType: "1h", data: data1h },
        { timestamp, viewType: "1d", data: data1d },
      ];

      // Store and publish time series updates
      for (const update of updates) {
        this.publishToRedis(
          pipeline,
          `${config.propagator.updates_key}:${update.viewType}`,
          JSON.stringify(update),
          {
            type: "update",
            viewType: update.viewType,
            timestamp: update.timestamp,
          },
          config.propagator.updates_channel_name,
        );
      }

      // Store and publish latest prices
      this.publishToRedis(
        pipeline,
        config.propagator.prices_latest_key,
        JSON.stringify(nano_prices),
        {
          type: "prices",
          timestamp: timestamp,
          data: nano_prices,
        },
        config.propagator.updates_channel_name,
      );

      await pipeline.exec();
      await logger.log("Successfully propagated time series data to Redis");
    } catch (error) {
      await logger.log(`Error propagating time series data: ${error}`, "ERROR");
      throw error;
    }
  }

  private publishToRedis(
    pipeline: any,
    key: string,
    data: any,
    publishData: any,
    channel_name: string,
  ): void {
    pipeline.set(key, data);
    pipeline.publish(channel_name, JSON.stringify(publishData));
  }

  private async fetchTimeSeriesData(
    viewName: string,
    interval: string,
  ): Promise<TimeSeriesData[]> {
    return await sql<TimeSeriesData[]>`
            SELECT 
                interval_time,
                currency,
                price,
                total_nano_transmitted,
                value_transmitted_in_currency,
                confirmation_count,
                gini_coefficient
            FROM ${sql(viewName)}
            WHERE interval_time >= NOW() - ${interval}::interval
            ORDER BY interval_time DESC, currency;
        `;
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
        "nano:timeseries:latest:5m",
        "nano:timeseries:latest:1h",
        "nano:timeseries:latest:1d",
        "nano:prices:latest",
      ];

      const results = await Promise.all(
        keys.map(async (key) => {
          const data = await this.redisClient.get(key);
          if (!data) return null;
          return JSON.parse(data).timestamp;
        }),
      );

      return {
        "5m": results[0],
        "1h": results[1],
        "1d": results[2],
        "prices": results[3],
        "lastUpdate": this.lastPricesUpdateTime,
      };
    } catch (error) {
      await logger.log(`Error fetching last update times: ${error}`, "ERROR");
      throw error;
    }
  }
}
