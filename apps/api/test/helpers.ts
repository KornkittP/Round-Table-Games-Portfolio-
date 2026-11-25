import { PGlite } from "@electric-sql/pglite"
import { drizzle } from "drizzle-orm/pglite"
import { migrate } from "drizzle-orm/pglite/migrator"
import { MIGRATIONS_FOLDER, schema, seedGames, setDb, type Db } from "@repo/database"
import type { AuthClaims } from "../src/lib/supabase-token-verifier.js"

/** What Supabase provides and plain Postgres does not: the two API roles and auth.uid(). */
const SUPABASE_STUBS = `
create role anon nologin;
create role authenticated nologin;
create schema auth;
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
grant usage on schema public, auth to anon, authenticated;
`

const SUPABASE_GRANTS = `
grant all on all tables in schema public to anon, authenticated;
grant execute on all functions in schema public to anon, authenticated;
`

/**
 * A real in-memory Postgres (PGlite) with this project's actual migrations applied.
 * No Docker, no network, no Supabase account. `install` makes it the app's `db`.
 */
export async function createTestDb({ seed = true, install = true } = {}) {
  const client = new PGlite()
  await client.exec(SUPABASE_STUBS)
  const db = drizzle(client, { schema }) as unknown as Db
  await migrate(db as any, { migrationsFolder: MIGRATIONS_FOLDER })
  await client.exec(SUPABASE_GRANTS)
  if (seed) await seedGames(db)
  if (install) setDb(db)
  return { db, client, close: () => client.close() }
}

export const USER_A: AuthClaims = {
  sub: "00000000-0000-4000-8000-00000000000a",
  email: "a@example.com",
  name: "Alice"
}
export const USER_B: AuthClaims = {
  sub: "00000000-0000-4000-8000-00000000000b",
  email: "b@example.com",
  name: "Bob"
}
export const ADMIN: AuthClaims = {
  sub: "00000000-0000-4000-8000-0000000000ad",
  email: "admin@example.com",
  name: "Admin"
}

/** Tokens are just keys into a map: "token-a", "token-b", "token-admin". */
export const FAKE_VERIFIER = {
  async verify(token: string): Promise<AuthClaims> {
    const claims = { "token-a": USER_A, "token-b": USER_B, "token-admin": ADMIN }[token]
    if (!claims) throw new Error("unknown token")
    return claims
  }
}

export const authUser = (c: AuthClaims, role: "customer" | "admin" = "customer") => ({
  id: c.sub,
  email: c.email,
  name: c.name ?? null,
  role
})
