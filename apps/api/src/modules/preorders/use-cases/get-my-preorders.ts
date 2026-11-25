import { db, desc, eq, preorders } from "@repo/database"
import { PREORDER_COLUMNS } from "../constants.js"

export abstract class GetMyPreorders {
  static async execute(userId: string) {
    return await db
      .select(PREORDER_COLUMNS)
      .from(preorders)
      .where(eq(preorders.userId, userId))
      .orderBy(desc(preorders.createdAt), desc(preorders.id))
  }
}
