import { drizzle } from "drizzle-orm/postgres-js"
import type { PgDatabase } from "drizzle-orm/pg-core"
import postgres, { type Sql } from "postgres"
import * as schema from "./schema/index.js"

/** Driver-agnostic database type: postgres-js in production, PGlite in tests. */
export type Db = PgDatabase<any, typeof schema>

// Live binding: importers always see the database that was set last.
export let db: Db = undefined as unknown as Db

let client: Sql | undefined

/** Connect to Postgres. `prepare: false` keeps this working through Supabase's transaction pooler. */
export function initDb(url = process.env.DATABASE_URL): Db {
  if (!url) throw new Error("DATABASE_URL is not set (see .env.example)")
  client = postgres(url, { prepare: false, max: 10 })
  db = drizzle(client, { schema })
  return db
}

/** Use another database, for example a PGlite instance in tests. */
export function setDb(instance: Db) {
  db = instance
}

export async function closeDb() {
  await client?.end({ timeout: 5 })
  client = undefined
}

export { schema }
