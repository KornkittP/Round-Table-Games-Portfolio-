import { sql } from "drizzle-orm"
import { pgEnum, pgPolicy, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { authenticatedRole, authUid } from "drizzle-orm/supabase"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"

export const userRole = pgEnum("user_role", ["customer", "admin"])

export type UserRole = (typeof userRole.enumValues)[number]

export const UserRoleValues = {
  CUSTOMER: "customer",
  ADMIN: "admin"
} as const satisfies Record<string, UserRole>

/** App users, keyed by the Supabase auth user id (the JWT `sub`). Created on first sign-in. */
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey(),
    email: text("email").notNull().unique(),
    name: text("name"),
    role: userRole("role").default(UserRoleValues.CUSTOMER).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
  },
  () => [
    // RLS policies. The API connects as the table owner (bypasses RLS) and enforces rules in code;
    // these protect the data from direct access with the public (publishable) key.
    pgPolicy("user can view own profile", {
      for: "select",
      to: authenticatedRole,
      using: sql`id = ${authUid}`
    }),

    pgPolicy("admin can view all users", {
      for: "select",
      to: authenticatedRole,
      using: sql`(select public.is_admin())`
    })
  ]
).enableRLS()

export const userInsertSchema = createInsertSchema(users)
export const userSelectSchema = createSelectSchema(users)

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
