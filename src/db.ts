import postgres from "postgres";

const ENVIRONMENT = Deno.env.get("ENVIRONMENT") || "development";

const config = ENVIRONMENT === "production"
  ? {
    // Production database configuration
    host: Deno.env.get("POSTGRES_HOST"),
    database: Deno.env.get("POSTGRES_DATABASE"),
    username: Deno.env.get("POSTGRES_USER"),
    password: Deno.env.get("DB_USER_PASSWORD"),
  }
  : {
    // Development database configuration
    host: "localhost",
    database: "postgres",
    username: "postgres",
    password: "your_password",
  };

// Create the SQL instance
export const sql = postgres(config);

// Add cleanup function
export async function closeConnection() {
  await sql.end();
}
