# Testing guide

Parts 1 to 3 run on your machine with no Supabase account, no Docker and no network after `bun install`. Part 4 tests against your real Supabase project.

## 0. Prerequisites

- Bun 1.2 or newer: `bun --version` (install: https://bun.sh)

## 1. Install and type-check

From the repo root:

```bash
bun install
bun run typecheck
```

Expected: both `tsc --noEmit` runs print nothing and exit 0.

## 2. Automated tests

```bash
bun run test                          # everything, about 10 seconds
bun run --cwd apps/api test:unit      # unit tests only, about 1 second
bun run --cwd apps/api test:e2e       # integration + end-to-end only
```

Expected: `107 pass, 0 fail`.

**Unit tests** (`apps/api/src/**/*.test.ts`, next to the code, no database): language fallback, pre-order window logic, `?lang` and `Accept-Language`, query and body validation (paging defaults, `status=a|b`, phone, quantity, unknown fields dropped), Supabase token verification (valid, expired, wrong issuer, wrong audience, wrong key, no email, legacy secret), bearer parsing, role permissions, the rate limiter, admin email parsing.

**Integration and end-to-end tests** (`apps/api/test/*.test.ts`): each file starts a real in-memory Postgres (PGlite), applies the actual migration files, and seeds the 4 games.

- `migrations.test.ts`: migrations are numbered in order, tables have RLS, the expected policies exist, quantity range is enforced. It then acts as the public key (roles `anon` and `authenticated`) and checks what RLS allows: anon reads games but not users or pre-orders, a user sees only their own rows, a user can pre-order only for themselves and only for an open game, only admins can update, nobody can delete.
- `games.test.ts`, `user.test.ts`, `preorders.test.ts`: the use-cases against the database, including search (with `%` and `_` treated literally), filters, pagination, the per-user limit, cancelled orders not counting, and simultaneous requests still respecting the limit.
- `app.e2e.test.ts`: the whole HTTP app (`app.handle`), with a fake token verifier: public routes, 401 without a token (checked before the body), 403 for customers on admin routes, 422 for bad bodies, admin status updates, opening and closing pre-orders, the 5 per minute limit.

Run one file or one test:

```bash
cd apps/api
bun test test/preorders.test.ts
bun test -t "limits active pre-orders"
```

## 3. Check that migrations match the schema

After any change in `packages/database/src/schema`:

```bash
bun run db:generate
```

- `No schema changes, nothing to migrate` means you are in sync.
- A new `packages/database/migrations/000N_*.sql` means you changed the schema: read it, commit it, run the tests again.
- Never edit or delete a migration that has been applied to a real database. Add a new one.
- Hand-written SQL: `cd packages/database && bunx drizzle-kit generate --custom --name=what_it_does`, then fill in the new file.

## 4. Test against your real Supabase project

### 4.1 Configure

```bash
cp .env.example .env
```

Fill in the Supabase URL, `DATABASE_URL` (Project Settings, Database, Connection string, Transaction pooler) and `ADMIN_EMAILS` with your own email. `git status` must not list `.env`.

### 4.2 Apply the migrations and seed

```bash
bun run db:migrate
bun run db:seed
```

Expected: `Migrations applied.` then `Seeded 4 new game(s).` Running either again is safe (the seed then reports 0). In the Supabase Table editor you should see `games`, `users`, `preorders` with RLS enabled, and migration history in the `drizzle` schema.

If `db:migrate` hangs or fails on the pooler, set `DATABASE_MIGRATION_URL` to the direct connection (port 5432) or the Session pooler.

### 4.3 Start the API

```bash
bun run dev
```

Open http://localhost:4000/docs for the API docs.

### 4.4 Public routes

```bash
curl -s localhost:4000/health
curl -s "localhost:4000/games?lang=en"
curl -s "localhost:4000/games/cat-avenue?lang=th"
curl -si localhost:4000/users/me      # expect HTTP 401
```

### 4.5 Get a test token

In Supabase: Authentication, Users, Add user, with an email and password. Use the email from `ADMIN_EMAILS` for an admin, any other email for a customer.

```bash
export SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
export KEY=YOUR_PUBLISHABLE_KEY
TOKEN=$(curl -s "$SUPABASE_URL/auth/v1/token?grant_type=password" \
  -H "apikey: $KEY" -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"THE-PASSWORD"}' | python3 -c "import sys,json;print(json.load(sys.stdin)['access_token'])")
curl -s localhost:4000/users/me -H "Authorization: Bearer $TOKEN"
```

Expected: your user with `"role":"admin"` (or `customer`).

### 4.6 Pre-order flow

Open a game as an admin:

```bash
curl -s -X PATCH localhost:4000/games/cat-avenue -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" -d '{"preorderOpen":true,"priceThb":890}'
```

Then place and read pre-orders:

```bash
curl -s -X POST localhost:4000/preorders -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"gameSlug":"cat-avenue","name":"Test","phone":"0812345678","address":"1 Test Road, Bangkok","quantity":1}'
curl -s localhost:4000/preorders/mine -H "Authorization: Bearer $TOKEN"
curl -s localhost:4000/preorders -H "Authorization: Bearer $TOKEN"        # admin token only
```

| Check | Expected |
| --- | --- |
| Game not open | 400 "Pre-orders for this game are not open" |
| Bad phone, quantity 0 or 11 | 422 with the reason |
| 4th active pre-order for one game | 409 |
| 6th POST within a minute | 429 |
| Customer token on `GET /preorders` | 403 |
| No token or an expired token | 401 |

Mark one as paid: `curl -X PATCH localhost:4000/preorders/ID/status -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"status":"PAID"}'`.

### 4.7 Confirm the public key is locked down

With only the publishable key, the database must hide other people's data:

```bash
curl -s "$SUPABASE_URL/rest/v1/preorders?select=*" -H "apikey: $KEY" -H "Authorization: Bearer $KEY"
curl -s "$SUPABASE_URL/rest/v1/users?select=*" -H "apikey: $KEY" -H "Authorization: Bearer $KEY"
curl -s "$SUPABASE_URL/rest/v1/games?select=slug" -H "apikey: $KEY" -H "Authorization: Bearer $KEY"
```

Expected: `[]` for pre-orders and users, and the game list for games. If you see real pre-orders or users, stop and check that the migrations ran.

### 4.8 Clean up

Delete test pre-orders in the Table editor, and the test user in Authentication if you made it only for this.

## 5. Production check

On your host set the variables from `.env.example`, run `bun run db:migrate` as a release step, then `bun run --cwd apps/api start`.

## Frontend

### Standalone portfolio

1. Install Node.js 22 or newer and Bun 1.2 or newer. From the repository root run `bun install --frozen-lockfile`.
2. Run `bun run dev:web`. Open http://localhost:3000 and confirm the redirect to /th. Open /en for English. Without NEXT_PUBLIC_API_URL, the studio catalog is local and reservations are closed.
3. Filter the shelf, open a game, switch languages and check that the same game stays open. Visit Print & Play, Studio, Engineering, Contact and Account from the navigation. At phone width open the menu. Tab from the address bar to check the skip link and keyboard focus.
4. Run `bun run test` for API and frontend suites, `bun run typecheck` for all workspaces, and `bun run build:web` for the production bundle. To run the web suite alone use `bun run --cwd apps/web test`. To serve a built bundle use `bun run --cwd apps/web start` after stopping the dev server.

### Live catalog and authenticated reservations

1. Complete the test database, migration, seed and API setup above against a development project. Start the Elysia API with `bun run dev`. Verify http://localhost:4000/health and /docs.
2. Copy apps/web/.env.example to apps/web/.env.local. Set NEXT_PUBLIC_API_URL to the browser-reachable API origin (locally http://localhost:4000) and both public Supabase settings to the same project used by the API. Set SITE_URL to the web origin. Set the API's CORS_ORIGIN to the web origin. Restart both processes after changes. Rebuild when changing public settings for production.
3. Enable Google in Supabase Auth, set Google's authorized redirect URI to the callback URL displayed by Supabase, and allow your site's localized account and pre-order return URLs in Supabase Auth URL Configuration. Use exact production URLs or appropriately scoped development patterns.
4. Use the admin game update described above to open a test game. Visit /en/games/GAME-SLUG/preorder. Sign in with Google, verify the return to the same page, enter delivery details and a quantity of 1 through 10, accept the consent notice and submit once. Confirm the receipt ID, then open Account and verify quantity and status. Switch to Thai and verify the same reservation. Sign out, then sign in with a second test account and check its history.
5. Close the test game in the API. Reload the game page and its pre-order URL. Check that the booking action disappears and the form is closed. Verify BGG, rulebook, shop and printable links using game rows with their respective URLs populated.
6. Set the server-only RESEND_API_KEY, CONTACT_FROM (verified sender) and CONTACT_TO to test contact delivery. Submit from the contact page and confirm receipt in your test inbox. With delivery settings empty, the page links to Tong's GitHub profile. The contact handler enforces a honeypot and three valid submissions per minute per server process. CONTACT_CLIENT_IP_HEADER optionally selects an IP header overwritten by a trusted ingress. Without one, the limit is shared.
7. Check /sitemap.xml and /robots.txt using the configured site origin. A configured but unavailable catalog displays a localized retry screen. Only an intentionally empty API URL selects the standalone catalog.

### Editing the site

UI translations live in apps/web/messages. Game copy, prices, shop links and booking windows come from the API in connected mode. apps/web/lib/editions.ts supplies published play specifications and descriptions for the three titles with BoardGameGeek records. BGG-listed titles use locally cached profile covers and a dated community snapshot in `apps/web/lib/bgg.json`. To refresh statistics, descriptions and classifications, set BGG_API_TOKEN in your shell to a registered BoardGameGeek application token and run `python scripts/refresh-bgg.py` at the repository root. Review the changed snapshot and Thai translations before rebuilding. To add Tangmo to an existing live catalog, run the existing idempotent `bun run db:seed` against the intended database.
