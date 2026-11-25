import { drizzle } from "drizzle-orm/postgres-js"
import { migrate } from "drizzle-orm/postgres-js/migrator"
import postgres from "postgres"
import { loadEnv } from "./env.js"
import { MIGRATIONS_FOLDER } from "./paths.js"

/** Apply every pending migration in packages/database/migrations, in order. Safe to re-run. */
loadEnv()
const url = process.env.DATABASE_MIGRATION_URL ?? process.env.DATABASE_URL
if (!url) throw new Error("Set DATABASE_URL (or DATABASE_MIGRATION_URL) first")

const client = postgres(url, { max: 1, prepare: false })
try {
  await migrate(drizzle(client), { migrationsFolder: MIGRATIONS_FOLDER })
  console.log("Migrations applied.")
} finally {
  await client.end({ timeout: 5 })
}
