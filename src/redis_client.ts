import { createClient, RedisClientType } from 'redis'

const ENVIRONMENT = Deno.env.get("ENVIRONMENT") || "development";
const currentDir = new URL('.', import.meta.url).pathname;
const configPath = `${currentDir}/../resources/ca.crt`;

export const redis: RedisClientType = createClient(ENVIRONMENT === "production" 
    ? {
        url: Deno.env.get("REDIS_URL"),
        password: Deno.env.get("REDIS_PASSWORD"),
        socket: {
          tls: true,
          ca: [await Deno.readTextFile(configPath)]
        }
      }
    : {
        url: "redis://localhost:6379"
      }
  );
  
await redis.connect();