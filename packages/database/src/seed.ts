import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { loadEnv } from "./env.js"
import { seedGames } from "./seed-games.js"
import * as schema from "./schema/index.js"

loadEnv()
const url = process.env.DATABASE_URL
if (!url) throw new Error("Set DATABASE_URL first")

const client = postgres(url, { max: 1, prepare: false })
try {
  const n = await seedGames(drizzle(client, { schema }))
  console.log(`Seeded ${n} new game(s).`)
} finally {
  await client.end({ timeout: 5 })
}
