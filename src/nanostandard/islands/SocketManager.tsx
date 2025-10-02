import { createContext } from "preact";
import { useContext, useEffect, useState } from "preact/hooks";
import type { ComponentChildren } from "preact";
import type { SocketMessage } from "../routes/api/data.tsx";
import { Packr } from "msgpackr";

interface SocketManagerProps {
  children: ComponentChildren;
  endpoint?: string;
  protocol?: "ws" | "wss";
  autoCloseTimeout?: number;
}

interface SocketContext {
  socketContext: Record<string, any>;
  connected: boolean;
  reconnect: () => void;
}

export function SocketManager({
  children,
  endpoint = "/api/data",
  protocol = "wss",
  autoCloseTimeout = 40000,
}: SocketManagerProps) {
  const packr = new Packr();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [socketData, setSocketData] = useState<SocketContext>({
    socketContext: {},
    connected: false,
    reconnect: () => {},
  });
  const [reconnectTrigger, setReconnectTrigger] = useState(0);

  const reconnect = () => {
    if (socket) {
      socket.close();
      setSocket(null);
      setSocketData((prev) => ({ ...prev, connected: false }));
    }
    setReconnectTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    // Create WebSocket connection
    const url = `${protocol}://${window.location.host}${endpoint}`;
    console.debug(`Connecting to ${url}`);
    const ws = new WebSocket(url);

    // Connection opened
    ws.addEventListener("open", () => {
      console.debug("Connected to WebSocket");
      setSocketData((prev) => ({ ...prev, connected: true }));

      // Subscribe to all available topics
      console.debug("Subscribing to all topics");
      ws.send(JSON.stringify({
        type: "subscribe",
        topics: ["*"], // Use '*' to subscribe to all topics
      } as SocketMessage));
    });

    // Set up keepalive interval
    const keepaliveInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: "keepalive",
          topics: [],
        } as SocketMessage));
      }
    }, autoCloseTimeout);

    // Listen for messages
    ws.addEventListener("message", async (event) => {
      try {
        const arrayBuffer = await event.data.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const message: { topic: string; data: any } = packr.unpack(uint8Array);
        console.debug("SocketManager: Received message:", message);

        setSocketData((prev) => ({
          ...prev,
          socketContext: {
            ...prev.socketContext,
            [message.topic]: message.data,
          },
        }));
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    });

    // Handle connection close
    ws.addEventListener("close", () => {
      console.debug("Disconnected from WebSocket");
      setSocketData((prev) => ({ ...prev, connected: false }));
    });

    // Handle errors
    ws.addEventListener("error", (error) => {
      console.error("WebSocket error:", error);
    });

    setSocket(ws);

    // Cleanup on unmount
    return () => {
      clearInterval(keepaliveInterval);
      ws.close();
    };
  }, [endpoint, protocol, reconnectTrigger]);

  return (
    <div className="container mx-auto max-w-[2000px] px-4">
      <SocketContext.Provider value={{ ...socketData, reconnect }}>
        {children}
      </SocketContext.Provider>
    </div>
  );
}

// Update context creation to include reconnect function
export const SocketContext = createContext<SocketContext>({
  socketContext: {},
  connected: false,
  reconnect: () => {},
});

// Rename hook to better reflect its purpose
export function useSocketData() {
  return useContext(SocketContext);
}
