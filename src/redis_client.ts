import { createClient, RedisClientType } from "redis";

const ENVIRONMENT = Deno.env.get("ENVIRONMENT") || "development";
const currentDir = new URL(".", import.meta.url).pathname;
const configPath = `${currentDir}/../resources/ca.crt`;

// MAde this true by default
const redisTLS = (Deno.env.get("REDIS_TLS") === "true") && true;
export const redis: RedisClientType = createClient(
  ENVIRONMENT === "production"
    ? {
      url: Deno.env.get("REDIS_URL"),
      password: Deno.env.get("REDIS_PASSWORD"),
      socket: {
        tls: redisTLS,
        ca: redisTLS ? [await Deno.readTextFile(configPath)] : [],
      },
    }
    : {
      url: "redis://localhost:7379",
    },
);
