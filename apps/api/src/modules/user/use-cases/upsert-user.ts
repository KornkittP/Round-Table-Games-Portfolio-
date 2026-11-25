import { db, users } from "@repo/database"
import type { AuthClaims } from "../../../lib/supabase-token-verifier.js"
import { ParseAdminEmails } from "./parse-admin-emails.js"

export abstract class UpsertUser {
  /**
   * Create the user on first sign-in; refresh email and name afterwards.
   * An email in ADMIN_EMAILS is promoted. A role granted in the database is never demoted here.
   */
  static async execute(claims: AuthClaims, adminEmails = ParseAdminEmails.execute()) {
    const isAdmin = adminEmails.has(claims.email.toLowerCase())
    const [user] = await db
      .insert(users)
      .values({
        id: claims.sub,
        email: claims.email,
        name: claims.name ?? null,
        role: isAdmin ? "admin" : "customer"
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: claims.email,
          ...(claims.name ? { name: claims.name } : {}),
          ...(isAdmin ? { role: "admin" as const } : {})
        }
      })
      .returning()
    return user
  }
}
