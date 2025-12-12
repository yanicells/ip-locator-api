import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  driver: "pg",
  schema: "./src/db/schema.js",
  out: "./drizzle",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL || "",
  },
  strict: true,
  verbose: true,
});
