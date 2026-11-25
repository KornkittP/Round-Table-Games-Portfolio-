import { db, eq, preorders } from "@repo/database"
import { status } from "elysia"
import type { AuthUser } from "../../auth/models.js"
import { PREORDER_COLUMNS } from "../constants.js"
import type { PreorderUpdateStatusModel } from "../models.js"

export abstract class UpdatePreorderStatus {
  static async execute(id: string, body: PreorderUpdateStatusModel.Body, user: AuthUser) {
    const [updated] = await db
      .update(preorders)
      .set({ status: body.status, updatedBy: user.email, updatedAt: new Date().toISOString() })
      .where(eq(preorders.id, id))
      .returning(PREORDER_COLUMNS)
    if (!updated) throw status(404, "Pre-order not found")
    return updated
  }
}
