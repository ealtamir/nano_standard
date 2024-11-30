import { SubscriptionManager } from "../subscription_manager.ts";
import { redis } from "../redis_client.ts";
import { config } from "../config_loader.ts";

interface TimeSeriesData {
    interval_time: Date;
    currency: string;
    price: number;
    total_nano_transmitted: number;
    value_transmitted_in_currency: number;
}

type ViewType = '5m' | '1h' | '1d';
type UpdateMessage = {
    type: 'update' | 'prices';
    viewType?: ViewType;
    timestamp: string;
    data?: any;
};

interface CachedData {
    timestamp: number;  // Unix timestamp of when the data was last updated
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
                this.handleRedisMessage.bind(this)
            );

            // Initialize data from Redis using the command client
            await Promise.all([
                this.fetchAndCacheData('5m'),
                this.fetchAndCacheData('1h'),
                this.fetchAndCacheData('1d'),
                this.fetchAndCachePrices()
            ]);

            console.debug("DataListener initialized successfully");
        } catch (error) {
            console.error(`Error initializing DataListener: ${error}`, "ERROR");
            throw error;
        }
    }

    private async fetchAndCacheData(viewType: ViewType): Promise<void> {
        const key = `${config.propagator.updates_key}:${viewType}`;
        const data = await this.commandClient.get(key);
        if (data) {
            const cachedData = {
                timestamp: Date.now(),
                data: JSON.parse(data)
            };
            this.cachedData.set(viewType, cachedData);
            this.notifySubscribers(`timeseries-${viewType}`, cachedData);
        }
    }

    private async fetchAndCachePrices(): Promise<void> {
        const data = await this.commandClient.get(config.propagator.prices_latest_key);
        if (data) {
            const cachedData = {
                timestamp: Date.now(),
                data: JSON.parse(data)
            };
            this.cachedData.set('prices', cachedData);
            this.notifySubscribers('prices', cachedData);
        }
    }

    private async handleRedisMessage(message: string): Promise<void> {
        try {
            const update = JSON.parse(message) as UpdateMessage;
            
            if (update.type === 'update' && update.viewType) {
                const data = await this.commandClient.get(
                    `${config.propagator.updates_key}:${update.viewType}`
                );
                if (data) {
                    const cachedData = {
                        timestamp: Date.now(),
                        data: JSON.parse(data)
                    };
                    cachedData.data.data.map((d: TimeSeriesData) => {
                        d.interval_time = new Date(d.interval_time);
                    });
                    this.cachedData.set(update.viewType, cachedData);
                    this.notifySubscribers(`timeseries-${update.viewType}`, cachedData);
                }
            } else if (update.type === 'prices') {
                const data = await this.commandClient.get(
                    config.propagator.prices_latest_key
                );
                if (data) {
                    const cachedData = {
                        timestamp: Date.now(),
                        data: JSON.parse(data)
                    };
                    this.cachedData.set('prices', cachedData);
                    this.notifySubscribers('prices', cachedData);
                }
            }
        } catch (error) {
            console.error(`Error handling Redis message: ${error}`, "ERROR");
        }
    }

    override subscribe<T>(topic: string, handler: (data: T) => void): () => void {
        const unsubscribeFunc = super.subscribe(topic, handler);
        // Send initial data to new subscriber if available
        const topicType = topic.startsWith('timeseries-')
            ? topic.split('-')[1] as ViewType
            : topic;

        const cachedData = this.cachedData.get(topicType);
        console.debug(`Subscriber found sending cached data for ${topicType}:`, cachedData?.timestamp);
        if (cachedData) {
            handler(cachedData as T);
        }

        return unsubscribeFunc;
    }

    // Updated get methods to return the timestamp
    public getTimeSeriesData(viewType: ViewType): DataUpdate | null {
        return this.cachedData.get(viewType) || null;
    }

    public getPrices(): DataUpdate | null {
        return this.cachedData.get('prices') || null;
    }

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
