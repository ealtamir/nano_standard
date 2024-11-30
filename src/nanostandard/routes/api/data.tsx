import { Handlers } from "$fresh/server.ts";
import { DataListener } from "../../data_listener.ts";
import { TimeSeriesData } from "../../../node_interface/handlers/propagator.ts";

type TopicName = 'timeseries-5m' | 'timeseries-1h' | 'timeseries-1d' | 'prices' | '*';

export type SocketMessage = {
  type: 'subscribe' | 'unsubscribe' | 'keepalive';
  topics: TopicName[];
};

const TIMEOUT_DURATION = 60000; // 60 seconds
const ALL_TOPICS: TopicName[] = ['timeseries-5m', 'timeseries-1h', 'timeseries-1d', 'prices'];


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
        console.debug('Connection timed out - closing socket');
        socket.close();
      }, TIMEOUT_DURATION); // 60 seconds timeout
    }

    // Reset timeout on any activity
    socket.onmessage = (event) => {
      resetTimeout();
      try {
        const message = JSON.parse(event.data) as SocketMessage;
        const topics = message.topics.includes("*") ? ALL_TOPICS : message.topics;
        
        console.debug(`Received message: ${event.data}`)
        if (message.type === 'subscribe') {
          console.debug(`Subscribing to topics: ${topics}`)
          topics.forEach(topic => {
            const topicHandler = (data: Record<string, number> | TimeSeriesData) => handleUpdate(topic, data);
            const unsubscribeFunc = dataListener.subscribe(topic, topicHandler);
            unsubscribeMap.set(topic, unsubscribeFunc);
          });
        }
        else if (message.type === 'unsubscribe') {
          message.topics.forEach(topic => {
            const unsubscribeFunc = unsubscribeMap.get(topic);
            if (unsubscribeFunc) {
              unsubscribeFunc();
              unsubscribeMap.delete(topic);
            }
          });
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    };

    socket.onclose = () => {
      console.debug('WebSocket closed - cleaning up subscriptions');
      clearTimeout(timeoutId);
      unsubscribeMap.forEach(unsubscribe => unsubscribe());
      unsubscribeMap.clear();
    };

    // Initialize timeout
    resetTimeout();

    // Update handleUpdate to check socket state before sending
    function handleUpdate(topic: TopicName, data: Record<string, number> | TimeSeriesData) {
      if (socket.readyState !== WebSocket.OPEN) {
        // If socket is not open, cleanup subscriptions
        unsubscribeMap.forEach(unsubscribe => unsubscribe());
        unsubscribeMap.clear();
        return;
      }
      socket.send(JSON.stringify({ topic, data }));
    }

    return response;
  },
};
