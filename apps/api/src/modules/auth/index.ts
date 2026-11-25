import { Elysia, status } from "elysia"
import { UpsertUser } from "../user/use-cases.js"
import type { AuthUser } from "./models.js"
import { ExtractBearer, VerifyToken } from "./use-cases.js"

/**
 * Requires a valid Supabase access token and adds `user` to the context.
 * `derive` runs before body validation, so a missing token is a 401, not a 422.
 */
export const authPlugin = new Elysia({ name: "auth" }).derive(
  { as: "scoped" },
  async ({ headers }) => {
    const token = ExtractBearer.execute(headers.authorization)
    if (!token) throw status(401, "Missing bearer token")

    const claims = await VerifyToken.execute(token)
    const row = await UpsertUser.execute(claims)
    const user: AuthUser = { id: row.id, email: row.email, name: row.name, role: row.role }
    return { user }
  }
)
