import { defineConfig } from "drizzle-kit"

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema/index.ts",
  out: "./migrations",
  dbCredentials: {
    // Prefer a direct / session-pooler connection for schema changes.
    url: process.env.DATABASE_MIGRATION_URL ?? process.env.DATABASE_URL ?? ""
  }
})
