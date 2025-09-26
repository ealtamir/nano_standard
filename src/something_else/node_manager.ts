import { SubscriptionManager } from "../subscription_manager.ts";
export class NodeManager extends SubscriptionManager {
  private ws!: WebSocket;
  private reconnectAttempts: number = 0;
  private readonly maxReconnectAttempts: number = 5;
  private readonly reconnectDelay: number = 1000;
  private pingInterval: number = 30000; // 30 seconds
  private pingTimeout: number = 5000; // 5 seconds
  private pingTimer?: number;
  private pongReceived: boolean = false;

  constructor(private readonly nodeAddress: string) {
    super();
    this.connect();
  }

  private connect() {
    this.ws = new WebSocket(this.nodeAddress);

    this.ws.addEventListener("open", () => {
      console.log("Connected to Nano node");
      this.reconnectAttempts = 0;
      this.resubscribeAll();
      this.startPingInterval();
    });

    this.ws.addEventListener("message", (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);

        if (message.ack && message.ack === "pong") {
          this.pongReceived = true;
          return;
        }

        const topic = message.topic;
        if (this.subscribers.has(topic)) {
          this.notifySubscribers(topic, message);
        }
      } catch (error) {
        console.error("Error processing message:", error);
      }
    });

    this.ws.addEventListener("close", () => {
      console.log("Connection closed");
      this.handleReconnect();
    });

    this.ws.addEventListener("error", (event: Event) => {
      console.error("WebSocket error:", event);
      this.handleReconnect();
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`,
      );
      setTimeout(
        () => this.connect(),
        this.reconnectDelay * this.reconnectAttempts,
      );
    } else {
      console.error("Max reconnection attempts reached");
    }
  }

  private resubscribeAll() {
    for (const topic of this.subscribers.keys()) {
      this.sendSubscription(topic);
    }
  }

  private sendSubscription(topic: string) {
    const subscription = {
      action: "subscribe",
      topic: topic,
    };
    this.ws.send(JSON.stringify(subscription));
  }

  protected onFirstSubscription(topic: string): void {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.sendSubscription(topic);
    }
  }

  protected onLastUnsubscription(topic: string): void {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        action: "unsubscribe",
        topic: topic,
      }));
    }
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
      this.ws.send(JSON.stringify({ action: "ping" }));

      // Set timeout for pong response
      setTimeout(() => {
        if (!this.pongReceived) {
          console.error("Ping timeout - no pong received");
          this.ws.close(); // This will trigger reconnection through the 'close' event
        }
      }, this.pingTimeout);
    }
  }

  /**
   * Check if the WebSocket connection is currently open
   * @returns boolean indicating if the connection is open
   */
  isConnected(): boolean {
    return this.ws.readyState === WebSocket.OPEN;
  }
}
