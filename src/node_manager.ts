import { TopicMessage } from './models.ts';

type MessageHandler<T> = (data: T) => void;

export class NodeManager {
    private ws: WebSocket; 
    private subscribers: Map<string, Set<MessageHandler<any>>>;
    private reconnectAttempts: number = 0;
    private readonly maxReconnectAttempts: number = 5;
    private readonly reconnectDelay: number = 1000;
    private pingInterval: number = 30000; // 30 seconds
    private pingTimeout: number = 5000;   // 5 seconds
    private pingTimer?: number;
    private pongReceived: boolean = false;

    constructor(private readonly nodeAddress: string) {
        this.subscribers = new Map();
        this.connect();
    }

    private connect() {
        this.ws = new WebSocket(this.nodeAddress);
        
        this.ws.addEventListener('open', () => {
            console.log('Connected to Nano node');
            this.reconnectAttempts = 0;
            this.resubscribeAll();
            this.startPingInterval(); // Start ping mechanism after connection
        });

        this.ws.addEventListener('message', (event: MessageEvent) => {
            try {
                const message = JSON.parse(event.data);
                
                // Handle pong response
                if (message.ack && message.ack === 'pong') {
                    this.pongReceived = true;
                    return;
                }

                const topic = message.topic;
                if (this.subscribers.has(topic)) {
                    const handlers = this.subscribers.get(topic)!;
                    handlers.forEach(handler => handler(message));
                }
            } catch (error) {
                console.error('Error processing message:', error);
            }
        });

        this.ws.addEventListener('close', () => {
            console.log('Connection closed');
            this.handleReconnect();
        });

        this.ws.addEventListener('error', (event: Event) => {
            console.error('WebSocket error:', event);
            this.handleReconnect();
        });
    }

    private handleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            setTimeout(() => this.connect(), this.reconnectDelay * this.reconnectAttempts);
        } else {
            console.error('Max reconnection attempts reached');
        }
    }

    private resubscribeAll() {
        for (const topic of this.subscribers.keys()) {
            this.sendSubscription(topic);
        }
    }

    private sendSubscription(topic: string) {
        const subscription = {
            action: 'subscribe',
            topic: topic
        };
        this.ws.send(JSON.stringify(subscription));
    }

    /**
     * Subscribe to a specific topic with type safety
     */
    subscribe<T extends TopicMessage<any>>(
        topic: string,
        handler: MessageHandler<T>
    ): () => void {
        if (!this.subscribers.has(topic)) {
            this.subscribers.set(topic, new Set());
            if (this.ws.readyState === WebSocket.OPEN) {
                this.sendSubscription(topic);
            }
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
                    if (this.ws.readyState === WebSocket.OPEN) {
                        this.ws.send(JSON.stringify({
                            action: 'unsubscribe',
                            topic: topic
                        }));
                    }
                }
            }
        };
    }

    /**
     * Close the WebSocket connection
     */
    close() {
        this.stopPingInterval();
        this.ws.close();
        this.subscribers.clear();
    }

    private startPingInterval() {
        this.stopPingInterval(); // Clear any existing interval
        this.pingTimer = setInterval(() => this.ping(), this.pingInterval);
    }

    private stopPingInterval() {
        if (this.pingTimer) {
            clearInterval(this.pingTimer);
            this.pingTimer = undefined;
        }
    }

    private ping() {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.pongReceived = false;
            this.ws.send(JSON.stringify({ action: 'ping' }));

            // Set timeout for pong response
            setTimeout(() => {
                if (!this.pongReceived) {
                    console.error('Ping timeout - no pong received');
                    this.ws.close(); // This will trigger reconnection through the 'close' event
                }
            }, this.pingTimeout);
        }
    }
}
