import { and, db, eq, users } from "@repo/database"
import type { FindOptions } from "../../libs/types.js"

export abstract class FindUser {
  static async byId(id: string, { lock = false, tx = db }: FindOptions = {}) {
    const base = tx.select().from(users).where(and(eq(users.id, id))).limit(1).$dynamic()
    const [user] = await (lock ? base.for("update", { of: users }) : base)
    return user
  }
}
