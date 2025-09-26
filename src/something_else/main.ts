import { NodeManager } from "./node_manager.ts";
import { NanoMessage, TopicMessage } from "./models.ts";
import { DbStore } from "./handlers/db_store.ts";
import { logger } from "../logger.ts";
import { NanoPriceCaller } from "./callers/nano_price_caller.ts";
import { GoldPriceCaller } from "./callers/gold_price_caller.ts";
import { UTCIntervalCaller } from "./callers/utc_interval_caller.ts";
import { HOUR, MINUTE } from "@std/datetime";
import { config } from "../config_loader.ts";
import { Propagator } from "./handlers/propagator.ts";
import { redis } from "../redis_client.ts";

const nodeManager = new NodeManager(config.node_ws_url);
const dbStore = new DbStore();

const coinGeckoApiKey = Deno.env.get("COIN_GECKO_API_KEY");
const goldApiKey = Deno.env.get("GOLD_API_KEY");

if (!coinGeckoApiKey) {
  throw new Error("COIN_GECKO_API_KEY environment variable not set");
}
if (!goldApiKey) {
  throw new Error("GOLD_API_KEY environment variable not set");
}

const nanoCaller = new NanoPriceCaller(coinGeckoApiKey, MINUTE * 5);
const utcCaller = new UTCIntervalCaller();
const propagator = new Propagator(
  nanoCaller.getSubscriptionManager(),
  utcCaller.getSubscriptionManager(),
  redis,
);

const callers = [
  nanoCaller,
  new GoldPriceCaller(goldApiKey, HOUR * 8),
  utcCaller,
];

// Add health status tracking
const _propagator = propagator;

// Modify the subscription to track last confirmation
let lastConfirmationTime: number | null = null;
const unsubscribe = nodeManager.subscribe(
  "confirmation",
  async (message: TopicMessage<NanoMessage>) => {
    await dbStore.storeConfirmation(message);
    await logger.log(`Received confirmation: ${message.message.hash}`);
    lastConfirmationTime = Date.now();
  },
);

for (const caller of callers) {
  caller.start();
}

// Add HTTP server for healthcheck
let isHealthy = true;
const healthcheckServer = Deno.serve(
  { port: config.healthcheck_port },
  async (req: Request) => {
    if (req.url.endsWith("/health")) {
      const now = Date.now();
      const healthStatus = {
        status: isHealthy ? "healthy" : "unhealthy",
        lastConfirmation: lastConfirmationTime
          ? new Date(lastConfirmationTime).toISOString()
          : null,
        confirmationAge: lastConfirmationTime
          ? now - lastConfirmationTime
          : null,
        nodeConnection: nodeManager.isConnected(),
        propagatorLastUpdateTimes: await _propagator.getLastUpdateTimes(),
        callers: callers.map((caller) => ({
          name: caller.constructor.name,
          isRunning: caller.isActive(),
        })),
      };

      return new Response(JSON.stringify(healthStatus, null, 2), {
        status: isHealthy ? 200 : 503,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    return new Response("Not Found", { status: 404 });
  },
);

// Update cleanup handler for Deno
async function cleanup() {
  console.log("Cleaning up...");
  unsubscribe();
  for (const caller of callers) {
    caller.stop();
  }
  await nodeManager.close();
  Deno.exit(0);
}

// Handle different termination signals using Deno.addSignalListener
Deno.addSignalListener("SIGINT", cleanup); // Handles Ctrl+C
Deno.addSignalListener("SIGTERM", cleanup); // Handles kill command
