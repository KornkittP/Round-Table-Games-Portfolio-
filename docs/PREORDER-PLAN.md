# Pre-order and info pages: implementation plan (Supabase)

Goal: when a new game is in development, publish an info page and a pre-order page quickly, in Thai and English, with sign-in. Data lives in Supabase (Postgres + Auth).

Change from the first draft: Google Sheets is no longer the database. Supabase gives real sign-in, transactions and Row Level Security. The sheet can stay as an optional export for you to read orders.

## 1. Approach

- Each game is one row in `games`. Setting `preorder_open = true` turns on its pre-order page, and `preorder_closes` ends it. No deploy needed.
- Sign-in uses Supabase Auth with Google. The API creates a `users` row on first sign-in (no database trigger).
- Tables have Row Level Security policies (anyone reads games, users see only their own rows, only admins write), so the public key cannot reach other people's data. The API connects with the database owner role and enforces the same rules in code.
- The API is the only way to read or write data. The browser uses Supabase only for sign-in and sends the access token to the API.

## 2. Data model

Defined in `packages/database/src/schema` (Drizzle); SQL in `packages/database/migrations`.

| Table | Purpose |
| --- | --- |
| `games` | Bilingual copy (`*_en`, `*_th`), status, price in THB, pre-order window, links, sort order |
| `users` | One per auth user: email, name, role (customer or admin). Emails in `ADMIN_EMAILS` become admins. |
| `preorders` | Game, user, name, phone, address, quantity (1 to 10), notes, status (new, confirmed, paid, shipped, cancelled) |

Personal data (names, phones, addresses) is stored, so add a privacy notice and consent checkbox (PDPA applies in Thailand).

## 3. API (Bun + Elysia, connex-style modules)

- `GET /games?lang=th|en` and `GET /games/:slug?lang=`: localized, falling back to the other language when a field is empty. Done in this repo.
- Data access uses Drizzle ORM against Supabase Postgres. Migrations are SQL files in `packages/database/migrations`, applied by `bun run db:migrate`.
- `GET /users/me`, `POST /preorders`, `GET /preorders/mine`, `GET /preorders` (admin), `PATCH /preorders/:id/status` (admin), `PATCH /games/:slug` (admin): done.

## 4. Frontend and i18n

- Next.js App Router with `next-intl`, locales `th` (default) and `en`, a language switcher, and `hreflang` alternates.
- UI strings in `messages/th.json` and `messages/en.json`. Game copy comes from the `*_en` and `*_th` columns.
- Thai-friendly font (Noto Sans Thai), THB prices, locale-formatted dates.
- Pages: `/[locale]/games/[slug]` (info), `/[locale]/games/[slug]/preorder` (form, behind sign-in), `/[locale]/account` (my pre-orders).

## 5. Phases

1. **Foundations (done):** monorepo, API, bilingual games endpoint, Drizzle migrations in code.
2. **Supabase setup (you, about 15 minutes):** `db:migrate`, `db:seed`, enable the Google provider, put your email in `ADMIN_EMAILS`.
3. **Auth and pre-order API (done):** token check, roles, pre-orders, admin, tests.
4. **Frontend (implemented):** Thai and English portfolio, game info, Google sign-in, pre-order form and account history in `apps/web`. Live provider verification uses the steps in `docs/TESTING.md`.
5. **Admin and notifications (2 to 3 days):** admin list and status update, email confirmation, optional LINE notice.
6. **Hardening (1 to 2 days):** rate limits, Turnstile spam protection, privacy notice, backups, e2e tests, deploy.

## 6. Decisions still open

- Payment: collect pre-orders only, then send payment instructions by email or LINE, or link out to a shop checkout?
- Sign-in: Google only to start, or also email magic link?
- Shipping: Thailand only, or international?
- Who can see orders: only you, or collaborators too?
