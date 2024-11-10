import { NodeManager } from "./node_manager.ts";
import { TopicMessage, NanoMessage } from "./models.ts";
import { DbStore } from "./handlers/db_store.ts";
import { logger } from "./logger.ts";

const wsUrl = `ws://192.168.1.70:7078`;
const nodeManager = new NodeManager(wsUrl);
const dbStore = new DbStore();

const unsubscribe = nodeManager.subscribe("confirmation", async (message: TopicMessage<NanoMessage>) => {
  await dbStore.storeConfirmation(message);
  await logger.log(`Received confirmation: ${message.message.hash}`);
});

// Update cleanup handler for Deno
async function cleanup() {
  console.log('Cleaning up...');
  unsubscribe();
  await nodeManager.close();
  Deno.exit(0);
}

// Handle different termination signals using Deno.addSignalListener
Deno.addSignalListener("SIGINT", cleanup);  // Handles Ctrl+C
Deno.addSignalListener("SIGTERM", cleanup); // Handles kill command

