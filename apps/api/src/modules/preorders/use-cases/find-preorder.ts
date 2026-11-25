import { and, db, eq, preorders } from "@repo/database"
import type { FindOptions } from "../../libs/types.js"
import { PREORDER_COLUMNS } from "../constants.js"

export abstract class FindPreorder {
  static async byId(id: string, { lock = false, tx = db }: FindOptions = {}) {
    const baseQuery = tx
      .select(PREORDER_COLUMNS)
      .from(preorders)
      .where(and(eq(preorders.id, id)))
      .limit(1)
      .$dynamic()

    const query = lock ? baseQuery.for("update", { of: preorders }) : baseQuery

    const [preorder] = await query
    return preorder
  }
}
