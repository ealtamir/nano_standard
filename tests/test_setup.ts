import { config } from "../src/config_loader.ts";
import { sql } from "../src/db.ts";
import { logger } from "../src/logger.ts";

export async function setupTestDatabase() {
  try {
    // Ensure we're using dev database configuration
    if (
      !config.database.host.includes("localhost") &&
      !config.database.host.includes("127.0.0.1")
    ) {
      throw new Error("Tests must be run against a local development database");
    }

    // Test database connection
    await sql`SELECT 1`;
    await logger.log(
      "Successfully connected to development database for testing",
    );
  } catch (error) {
    await logger.log(
      `Failed to connect to development database: ${error}`,
      "ERROR",
    );
    throw error;
  }
}

export async function teardownTestDatabase() {
  try {
    // Close any open connections
    await sql.end();
    await logger.log("Successfully closed database connections");
  } catch (error) {
    await logger.log(`Error closing database connections: ${error}`, "ERROR");
    throw error;
  }
}
