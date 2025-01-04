import { SubscriptionManager } from "../subscription_manager.ts";
import { redis } from "../redis_client.ts";
import { config } from "../config_loader.ts";
import { Packr } from "npm:msgpackr";
import { TimeSeriesData } from "../node_interface/handlers/propagator.ts";

type ViewType = "5m" | "1h" | "1d";
type UpdateMessage = {
  type: "update" | "prices";
  viewType: string;
  timestamp: string;
  data?: any;
};

interface CachedData {
  timestamp: number; // Unix timestamp of when the data was last updated
  data: any;
}

interface DataUpdate {
  timestamp: number;
  data: any;
}

export class DataListener extends SubscriptionManager {
  private cachedData: Map<string, CachedData> = new Map();
  private subscriberClient!: typeof redis;
  private commandClient: typeof redis;
  private packr = new Packr();

  constructor(redisClient: typeof redis) {
    super();
    this.commandClient = redisClient;
    // Create a new connection for subscriptions
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      await this.commandClient.connect();
      this.subscriberClient = this.commandClient.duplicate();
      // Connect the subscriber client
      await this.subscriberClient.connect();

      // Subscribe to Redis channel for updates
      await this.subscriberClient.subscribe(
        config.propagator.updates_channel_name,
        this.handleRedisMessage.bind(this),
      );

      // Initialize data from Redis using the command client
      await Promise.all([
        this.fetchAndCacheData("5m"),
        this.fetchAndCacheData("1h"),
        this.fetchAndCacheData("1d"),
        this.fetchAndCachePrices(),
      ]);

      console.debug("DataListener initialized successfully");
    } catch (error) {
      console.error(`Error initializing DataListener: ${error}`, "ERROR");
      throw error;
    }
  }

  private async fetchAndCacheData(interval: "5m" | "1h" | "1d"): Promise<void> {
    const viewTypes = [
      config.propagator.nano_volume_key,
      config.propagator.nano_prices_key,
      config.propagator.nano_confirmations_key,
      config.propagator.nano_unique_accounts_key,
      config.propagator.nano_bucket_distribution_key,
    ];
    for (const viewType of viewTypes) {
      const key = `${viewType}:${interval}`;
      const rawData = await this.commandClient.get(key);
      if (rawData) {
        const cachedData = {
          timestamp: Date.now(),
          data: JSON.parse(rawData),
        };
        this.cachedData.set(key, cachedData);
        this.notifySubscribers(key, cachedData);
      }
    }
  }

  private async fetchAndCachePrices(): Promise<void> {
    const data = await this.commandClient.get(
      config.propagator.prices_latest_key,
    );
    if (data) {
      const cachedData = {
        timestamp: Date.now(),
        data: JSON.parse(data),
      };
      this.cachedData.set(config.propagator.prices_latest_key, cachedData);
      this.notifySubscribers(config.propagator.prices_latest_key, cachedData);
    }
  }

  private async handleRedisMessage(message: string): Promise<void> {
    try {
      const update = JSON.parse(message) as UpdateMessage;
      if (update.type === "update" && update.viewType) {
        const data = await this.commandClient.get(update.viewType);
        if (data) {
          const cachedData = {
            timestamp: Date.now(),
            data: JSON.parse(data),
          };
          this.cachedData.set(update.viewType, cachedData);
          this.notifySubscribers(update.viewType, cachedData);
        }
      }
    } catch (error) {
      console.error(`Error handling Redis message: ${error}`, "ERROR");
    }
  }

  override subscribe<T>(topic: string, handler: (data: T) => void): () => void {
    const unsubscribeFunc = super.subscribe(topic, handler);
    // Send initial data to new subscriber if available

    const cachedData = this.cachedData.get(topic);
    if (cachedData) {
      handler(cachedData as T);
    }
    console.debug(
      `Subscriber found sending cached data for ${topic}:`,
      cachedData?.timestamp,
    );

    return unsubscribeFunc;
  }

  // Updated get methods to return the timestamp
  protected onFirstSubscription(_topic: string): void {
    // No action needed
  }

  protected onLastUnsubscription(_topic: string): void {
    // Keep the cache as other subscribers might need it later
  }

  // Add cleanup method
  public async cleanup(): Promise<void> {
    await this.subscriberClient.quit();
  }
}
