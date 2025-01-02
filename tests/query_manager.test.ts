import { assertEquals, assertExists } from "@std/assert";
import { QueryManager } from "../src/node_interface/handlers/query_manager.ts";
import { closeConnection } from "../src/db.ts";

Deno.test({
  name: "QueryManager - getNanoVolume",
  async fn() {
    // Test for each interval
    for (const interval of ["5m", "1h", "1d"] as const) {
      const result = await QueryManager.getNanoVolume(interval);

      // Check that we got results
      assertExists(result);

      // If there's data, verify the structure
      if (result.length > 0) {
        const firstRow = result[0];
        assertEquals(typeof firstRow.time_bucket, "object");
        assertEquals(typeof firstRow.amount_nano, "number");
        assertEquals(typeof firstRow.rolling_median, "number");
        assertEquals(typeof firstRow.gini_coefficient, "number");
      }
    }
    await closeConnection();
  },
});

Deno.test({
  name: "QueryManager - getNanoPrices",
  async fn() {
    // Test for each interval
    for (const interval of ["5m", "1h", "1d"] as const) {
      const result = await QueryManager.getNanoPrices(interval);

      assertExists(result);

      if (result.length > 0) {
        const firstRow = result[0];
        assertEquals(typeof firstRow.time_bucket, "object");
        assertEquals(typeof firstRow.currency, "string");
        assertEquals(typeof firstRow.price, "number");
        assertEquals(typeof firstRow.value_transmitted_in_currency, "number");
        assertEquals(typeof firstRow.rolling_median, "number");
      }
    }
    await closeConnection();
  },
});

Deno.test({
  name: "QueryManager - getNanoConfirmations",
  async fn() {
    // Test for each interval
    for (const interval of ["5m", "1h", "1d"] as const) {
      const result = await QueryManager.getNanoConfirmations(interval);

      assertExists(result);

      if (result.length > 0) {
        const firstRow = result[0];
        assertEquals(typeof firstRow.time_bucket, "object");
        assertEquals(typeof firstRow.current_confirmations, "number");
        assertEquals(typeof firstRow.rolling_median, "number");
        assertEquals(typeof firstRow.cumulative_sum_confirmations, "number");
      }
    }
    await closeConnection();
  },
});

Deno.test({
  name: "QueryManager - getNanoUniqueAccounts",
  async fn() {
    // Test for each interval
    for (const interval of ["5m", "1h", "1d"] as const) {
      const result = await QueryManager.getNanoUniqueAccounts(interval);

      assertExists(result);

      if (result.length > 0) {
        const firstRow = result[0];
        assertEquals(typeof firstRow.time_bucket, "object");
        assertEquals(typeof firstRow.new_accounts, "number");
        assertEquals(typeof firstRow.cumulative_new_accounts, "number");
        assertEquals(typeof firstRow.rolling_median_accounts, "number");
      }
    }
    await closeConnection();
  },
});

Deno.test({
  name: "QueryManager - getNanoBucketDistribution",
  async fn() {
    // Test for each interval
    for (const interval of ["5m", "1h", "1d"] as const) {
      const result = await QueryManager.getNanoBucketDistribution(interval);

      assertExists(result);

      if (result.length > 0) {
        const firstRow = result[0];
        assertEquals(typeof firstRow.time_bucket, "object");
        // Check that we have numeric bucket counts from 0 to 63
        for (let i = 0; i <= 63; i++) {
          assertEquals(typeof firstRow[i.toString()], "number");
        }
      }
    }
    await closeConnection();
  },
});

Deno.test({
  name: "QueryManager - refreshMaterializedViews",
  async fn() {
    try {
      await QueryManager.refreshMaterializedViews();
      // If we reach here, the refresh was successful
      assertEquals(true, true);
    } catch (error) {
      // If there's an error, the test should fail
      assertEquals(
        true,
        false,
        `Failed to refresh materialized views: ${error}`,
      );
    }
    await closeConnection();
  },
});
