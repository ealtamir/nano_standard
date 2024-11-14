import { NodeManager } from "./node_manager.ts";
import { TopicMessage, NanoMessage } from "./models.ts";
import { DbStore } from "./handlers/db_store.ts";
import { logger } from "./logger.ts";
import { NanoPriceCaller } from "./callers/nano_price_caller.ts";
import { GoldPriceCaller } from "./callers/gold_price_caller.ts";

const wsUrl = `ws://192.168.1.70:7078`;
const nodeManager = new NodeManager(wsUrl);
const dbStore = new DbStore();

const coinGeckoApiKey = Deno.env.get("COIN_GECKO_API_KEY");
const goldApiKey = Deno.env.get("GOLD_API_KEY");

if (!coinGeckoApiKey) {
  throw new Error("COIN_GECKO_API_KEY environment variable not set");
}
if (!goldApiKey) {
  throw new Error("GOLD_API_KEY environment variable not set");
}

const callers = [
    new NanoPriceCaller(coinGeckoApiKey, 1000 * 60 * 5),
    new GoldPriceCaller(goldApiKey, 1000 * 60 * 60 * 8),
];

const unsubscribe = nodeManager.subscribe("confirmation", async (message: TopicMessage<NanoMessage>) => {
  await dbStore.storeConfirmation(message);
  await logger.log(`Received confirmation: ${message.message.hash}`);
});
for (const caller of callers) {
    caller.start();
}

// Update cleanup handler for Deno
async function cleanup() {
  console.log('Cleaning up...');
  unsubscribe();
  for (const caller of callers) {
    caller.stop();
  }
  await nodeManager.close();
  Deno.exit(0);
}

// Handle different termination signals using Deno.addSignalListener
Deno.addSignalListener("SIGINT", cleanup);  // Handles Ctrl+C
Deno.addSignalListener("SIGTERM", cleanup); // Handles kill command

