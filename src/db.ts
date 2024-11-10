import postgres from 'postgres'

const ENVIRONMENT = Deno.env.get("ENVIRONMENT") || "development";

const config = ENVIRONMENT === "production" 
  ? {
      // Production database configuration
      host: "localhost",
      database: "nano_xperiments",
      username: "nano_xperiments",
      password: Deno.env.get("POSTGRES_PASSWORD"),
    }
  : {
      // Development database configuration
      host: "localhost",
      database: "postgres",
      username: "postgres",
      password: "password",
    };

const sql = postgres(config) // will use psql environment variables

export default sql