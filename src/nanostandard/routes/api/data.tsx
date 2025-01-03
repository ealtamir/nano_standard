import { Handlers } from "$fresh/server.ts";
import { DataListener } from "../../data_listener.ts";
import { TimeSeriesData } from "../../../node_interface/handlers/propagator.ts";
import { Packr } from "npm:msgpackr";
import { config } from "../../../config_loader.ts";

export type SocketMessage = {
  type: "subscribe" | "unsubscribe" | "keepalive";
  topics: string[];
};

const TIMEOUT_DURATION = 60000; // 60 seconds
const INTERVALS = ["5m", "1h", "1d"] as const;
const TOPICS = [
  config.propagator.nano_volume_key,
  config.propagator.nano_prices_key,
  config.propagator.nano_confirmations_key,
  config.propagator.nano_unique_accounts_key,
  config.propagator.nano_bucket_distribution_key,
] as const;
const ALL_TOPICS: string[] = [
  ...TOPICS.flatMap((topic) =>
    INTERVALS.map((interval) => `${topic}:${interval}`)
  ),
  config.propagator.prices_latest_key,
];
const packr = new Packr();

export const handler: Handlers = {
  GET(req, ctx) {
    const { socket, response } = Deno.upgradeWebSocket(req);
    const dataListener = ctx.state.dataListener as DataListener;

    const unsubscribeMap: Map<string, () => void> = new Map();

    // Add timeout detection
    let timeoutId: number;

    function resetTimeout() {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        console.debug("Connection timed out - closing socket");
        socket.close();
      }, TIMEOUT_DURATION); // 60 seconds timeout
    }

    // Reset timeout on any activity
    socket.onmessage = (event) => {
      resetTimeout();
      try {
        const message = JSON.parse(event.data) as SocketMessage;
        const topics = message.topics.includes("*")
          ? ALL_TOPICS
          : message.topics;

        console.debug(`Received message: ${event.data}`);
        if (message.type === "subscribe") {
          console.debug(`Subscribing to topics: ${topics}`);
          topics.forEach((topic) => {
            const topicHandler = (
              data: any,
            ) => handleUpdate(topic, data);
            const unsubscribeFunc = dataListener.subscribe(topic, topicHandler);
            unsubscribeMap.set(topic, unsubscribeFunc);
          });
        } else if (message.type === "unsubscribe") {
          message.topics.forEach((topic) => {
            const unsubscribeFunc = unsubscribeMap.get(topic);
            if (unsubscribeFunc) {
              unsubscribeFunc();
              unsubscribeMap.delete(topic);
            }
          });
        }
      } catch (error) {
        console.error("Error processing message:", error);
      }
    };

    socket.onclose = () => {
      console.debug("WebSocket closed - cleaning up subscriptions");
      clearTimeout(timeoutId);
      unsubscribeMap.forEach((unsubscribe) => unsubscribe());
      unsubscribeMap.clear();
    };

    // Initialize timeout
    resetTimeout();

    // Update handleUpdate to check socket state before sending
    function handleUpdate(
      topic: string,
      data: any,
    ) {
      if (socket.readyState !== WebSocket.OPEN) {
        // If socket is not open, cleanup subscriptions
        unsubscribeMap.forEach((unsubscribe) => unsubscribe());
        unsubscribeMap.clear();
        return;
      }
      socket.send(packr.pack({ topic, data }));
    }

    return response;
  },
};
