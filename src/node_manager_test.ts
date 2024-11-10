import { assertEquals } from "@std/assert";
import { assertSpyCalls, spy } from "@std/testing/mock";
import { NodeManager } from "./node_manager.ts";

class MockWebSocketServer {
  private clients: Set<WebSocket> = new Set();
  private abortController = new AbortController();

  constructor(private port: number) {
    Deno.serve({
      port: this.port,
      signal: this.abortController.signal,
      handler: (request) => {
        if (request.headers.get("upgrade") === "websocket") {
          const { socket, response } = Deno.upgradeWebSocket(request);
          this.clients.add(socket);
          return response;
        }
        return new Response("Not a websocket request", { status: 400 });
      },
    });
  }

  broadcast(message: unknown) {
    const messageStr = JSON.stringify(message);
    for (const client of this.clients) {
      client.send(messageStr);
    }
  }

  close() {
    this.abortController.abort();
    for (const client of this.clients) {
      client.close();
    }
  }
}

Deno.test("NodeManager - Basic subscription and message handling", async (t) => {
  const port = 8080;
  const server = new MockWebSocketServer(port);
  const manager = new NodeManager(`ws://localhost:${port}`);

  // Wait for connection to establish
  await new Promise(resolve => setTimeout(resolve, 100));

  await t.step("handles messages for subscribed topics", async () => {
    const handler1 = spy();
    const handler2 = spy();

    // Subscribe to different topics
    manager.subscribe("topic1", handler1);
    manager.subscribe("topic2", handler2);

    // Send message for topic1
    server.broadcast({
      topic: "topic1",
      data: { value: "test" }
    });

    // Wait for message processing
    await new Promise(resolve => setTimeout(resolve, 100));

    // Assert handler1 was called and handler2 wasn't
    assertSpyCalls(handler1, 1);
    assertSpyCalls(handler2, 0);
    assertEquals(
      handler1.calls[0].args[0],
      { topic: "topic1", data: { value: "test" } }
    );
  });

  await t.step("handles unsubscribe correctly", () => {
    const handler = spy();
    const unsubscribe = manager.subscribe("topic3", handler);

    // Unsubscribe
    unsubscribe();

    server.broadcast({
      topic: "topic3",
      data: { value: "test" }
    });

    // Assert handler wasn't called
    assertSpyCalls(handler, 0);
  });

  // Cleanup
  manager.close();
  server.close();
});

Deno.test("NodeManager - Reconnection handling", async (t) => {
  const port = 8081;
  let server = new MockWebSocketServer(port);
  const manager = new NodeManager(`ws://localhost:${port}`);

  // Wait for initial connection
  await new Promise(resolve => setTimeout(resolve, 100));

  await t.step("reconnects and maintains subscriptions", async () => {
    const handler = spy();
    manager.subscribe("test-topic", handler);

    // Close server to trigger reconnection
    server.close();
    
    // Wait for reconnection attempt
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Create new server instance
    server = new MockWebSocketServer(port);

    // Wait for reconnection
    await new Promise(resolve => setTimeout(resolve, 100));

    // Send message to verify subscription was maintained
    server.broadcast({
      topic: "test-topic",
      data: { value: "after-reconnect" }
    });

    await new Promise(resolve => setTimeout(resolve, 100));

    assertSpyCalls(handler, 1);
    assertEquals(
      handler.calls[0].args[0],
      { topic: "test-topic", data: { value: "after-reconnect" } }
    );
  });

  // Cleanup
  manager.close();
  server.close();
});
