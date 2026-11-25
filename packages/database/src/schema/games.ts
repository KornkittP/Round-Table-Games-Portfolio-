import { sql } from "drizzle-orm"
import {
  boolean,
  integer,
  pgEnum,
  pgPolicy,
  pgTable,
  text,
  timestamp,
  varchar
} from "drizzle-orm/pg-core"
import { anonRole, authenticatedRole } from "drizzle-orm/supabase"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"

export const gameStatus = pgEnum("game_status", ["published", "in_development", "print_and_play"])

export type GameStatus = (typeof gameStatus.enumValues)[number]

export const GameStatusValues = {
  PUBLISHED: "published",
  IN_DEVELOPMENT: "in_development",
  PRINT_AND_PLAY: "print_and_play"
} as const satisfies Record<string, GameStatus>

export const games = pgTable(
  "games",
  {
    slug: varchar("slug").primaryKey(),
    status: gameStatus("status").default(GameStatusValues.IN_DEVELOPMENT).notNull(),
    titleEn: varchar("title_en").notNull(),
    titleTh: varchar("title_th"),
    taglineEn: varchar("tagline_en"),
    taglineTh: varchar("tagline_th"),
    descriptionEn: text("description_en"),
    descriptionTh: text("description_th"),
    year: integer("year"),
    /** Whole Thai baht. */
    priceThb: integer("price_thb"),
    preorderOpen: boolean("preorder_open").default(false).notNull(),
    preorderCloses: timestamp("preorder_closes", { withTimezone: true, mode: "string" }),
    coverImage: varchar("cover_image"),
    bggUrl: varchar("bgg_url"),
    shopUrl: varchar("shop_url"),
    rulebookUrl: varchar("rulebook_url"),
    pnpUrl: varchar("pnp_url"),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdBy: varchar("created_by"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedBy: varchar("updated_by"),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
  },
  () => [
    // RLS policies
    pgPolicy("anyone can view games", {
      for: "select",
      to: [anonRole, authenticatedRole],
      using: sql`true`
    }),

    pgPolicy("only admin can create games", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`(select public.is_admin())`
    }),

    pgPolicy("only admin can update games", {
      for: "update",
      to: authenticatedRole,
      using: sql`(select public.is_admin())`,
      withCheck: sql`(select public.is_admin())`
    }),

    pgPolicy("only admin can delete games", {
      for: "delete",
      to: authenticatedRole,
      using: sql`(select public.is_admin())`
    })
  ]
).enableRLS()

export const gameInsertSchema = createInsertSchema(games)
export const gameSelectSchema = createSelectSchema(games)

export type Game = typeof games.$inferSelect
export type NewGame = typeof games.$inferInsert
