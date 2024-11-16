
type MessageHandler<T> = (data: T) => void;

export abstract class SubscriptionManager {
    protected subscribers: Map<string, Set<MessageHandler<any>>>;

    constructor() {
        this.subscribers = new Map();
    }

    /**
     * Subscribe to a specific topic with type safety
     */
    subscribe<T>(
        topic: string,
        handler: MessageHandler<T>
    ): () => void {
        if (!this.subscribers.has(topic)) {
            this.subscribers.set(topic, new Set());
            this.onFirstSubscription(topic);
        }

        const handlers = this.subscribers.get(topic)!;
        handlers.add(handler);

        // Return unsubscribe function
        return () => {
            const handlers = this.subscribers.get(topic);
            if (handlers) {
                handlers.delete(handler);
                if (handlers.size === 0) {
                    this.subscribers.delete(topic);
                    this.onLastUnsubscription(topic);
                }
            }
        };
    }

    /**
     * Notify all subscribers of a specific topic
     */
    notifySubscribers<T>(topic: string, data: T): void {
        if (this.subscribers.has(topic)) {
            const handlers = this.subscribers.get(topic)!;
            handlers.forEach(handler => handler(data));
        }
    }

    /**
     * Called when the first subscriber is added to a topic
     */
    protected abstract onFirstSubscription(topic: string): void;

    /**
     * Called when the last subscriber is removed from a topic
     */
    protected abstract onLastUnsubscription(topic: string): void;
} 