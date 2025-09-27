import { redis } from "../src/redis_client.ts";
import { config } from "../src/config_file.ts";
import { parse } from "https://deno.land/std@0.207.0/csv/mod.ts";

const dataDir = "./tests/resources/account_data";

async function loadCsvToRedis(filePath: string, redisKey: string) {
  const fileContent = await Deno.readTextFile(filePath);
  const rows = parse(fileContent, {
    skipFirstRow: false,
    strip: true,
  }) as string[][];

  if (rows.length < 2) {
    if (rows.length === 0) {
      console.warn(`CSV file is empty: ${filePath}`);
    }
    await redis.set(redisKey, JSON.stringify([]));
    console.log(
      `Loaded (as empty array) ${filePath} into Redis key ${redisKey}`,
    );
    return;
  }

  const headers = rows[0];
  const data = rows.slice(1);

  const jsonData = data.map((row) => {
    const obj: Record<string, any> = {};
    headers.forEach((header, index) => {
      const value = row[index];
      if (value === null || value === "") {
        obj[header] = null;
      } else {
        const numValue = Number(value);
        if (!isNaN(numValue)) {
          obj[header] = numValue;
        } else {
          obj[header] = value;
        }
      }
    });
    return obj;
  });

  await redis.set(redisKey, JSON.stringify(jsonData));
  console.log(
    `Loaded and transformed ${filePath} into Redis key ${redisKey}`,
  );
}

async function main() {
  await redis.connect();

  const csvMap = {
    [config.propagator.account_animal_bucket_key]: "account_animal_buckets.csv",
    [config.propagator.account_basic_stats_key]: "account_basic_stats.csv",
    [config.propagator.account_dormancy_key]: "account_dormancy.csv",
    [config.propagator.account_money_recency_key]: "account_money_recency.csv",
    [config.propagator.account_network_activity_ratio_key]:
      "account_network_activity_ratio.csv",
    [config.propagator.account_top_tiers_distribution_key]:
      "account_top_tiers_distribution.csv",
    [config.propagator.account_transaction_and_balance_distribution_key]:
      "account_transaction_and_balance_distribution.csv",
    [config.propagator.animal_tier_trends_key]: "animal_tier_trends.csv",
    [config.propagator.account_representative_analysis_key]:
      "account_representative_analysis.csv",
  };

  for (const [redisKey, fileName] of Object.entries(csvMap)) {
    const filePath = `${dataDir}/${fileName}`;
    try {
      await loadCsvToRedis(filePath, redisKey);
    } catch (error) {
      console.error(`Failed to load ${filePath}:`, error);
    }
  }

  await redis.quit();
}

if (import.meta.main) {
  main();
}
