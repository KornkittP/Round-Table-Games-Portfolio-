import { sql } from "drizzle-orm"
import {
  check,
  index,
  integer,
  pgEnum,
  pgPolicy,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar
} from "drizzle-orm/pg-core"
import { authenticatedRole, authUid } from "drizzle-orm/supabase"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { games } from "#schema/games"
import { users } from "#schema/users"

export const preorderStatus = pgEnum("preorder_status", [
  "NEW",
  "CONFIRMED",
  "PAID",
  "SHIPPED",
  "CANCELLED"
])

export type PreorderStatus = (typeof preorderStatus.enumValues)[number]

export const PreorderStatusValues = {
  NEW: "NEW",
  CONFIRMED: "CONFIRMED",
  PAID: "PAID",
  SHIPPED: "SHIPPED",
  CANCELLED: "CANCELLED"
} as const satisfies Record<string, PreorderStatus>

export const preorders = pgTable(
  "preorders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    gameSlug: varchar("game_slug")
      .notNull()
      .references(() => games.slug),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    name: varchar("name").notNull(),
    phone: varchar("phone").notNull(),
    address: text("address").notNull(),
    quantity: integer("quantity").notNull(),
    notes: text("notes"),
    status: preorderStatus("status").default(PreorderStatusValues.NEW).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedBy: varchar("updated_by"),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
  },
  (table) => [
    index("preorders_user_idx").on(table.userId),
    index("preorders_game_idx").on(table.gameSlug),
    check("preorders_quantity_range", sql`${table.quantity} between 1 and 10`),

    // RLS policies
    pgPolicy("user can view own preorders", {
      for: "select",
      to: authenticatedRole,
      using: sql`user_id = ${authUid}`
    }),

    pgPolicy("admin can view all preorders", {
      for: "select",
      to: authenticatedRole,
      using: sql`(select public.is_admin())`
    }),

    pgPolicy("user can create own preorder for an open game", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`user_id = ${authUid} and exists (
        select 1 from public.games g
        where g.slug = game_slug
          and g.preorder_open
          and (g.preorder_closes is null or g.preorder_closes > now())
      )`
    }),

    pgPolicy("only admin can update preorders", {
      for: "update",
      to: authenticatedRole,
      using: sql`(select public.is_admin())`,
      withCheck: sql`(select public.is_admin())`
    })
  ]
).enableRLS()

export const preorderInsertSchema = createInsertSchema(preorders)
export const preorderSelectSchema = createSelectSchema(preorders)

export type Preorder = typeof preorders.$inferSelect
export type NewPreorder = typeof preorders.$inferInsert
