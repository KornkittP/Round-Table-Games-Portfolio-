import {
  and, count, db, desc, eq, games, ilike, inArray, or, preorders, users, type SQL
} from "@repo/database"
import { escapeLike } from "../../libs/escape-like.js"
import { PREORDER_LIST_COLUMNS } from "../constants.js"
import type { PreorderListModel } from "../models.js"

export abstract class GetPreorderList {
  static async execute({
    page,
    pageSize,
    search,
    game,
    status
  }: PreorderListModel.Query): Promise<PreorderListModel.Response> {
    const filter: SQL[] = []

    if (search?.trim()) {
      const term = `%${escapeLike(search.trim())}%`
      const match = or(
        ilike(preorders.name, term),
        ilike(preorders.phone, term),
        ilike(users.email, term)
      )
      if (match) filter.push(match)
    }
    if (game) filter.push(eq(preorders.gameSlug, game))
    if (status?.length) filter.push(inArray(preorders.status, status))

    const where = and(...filter)

    const [rows, [{ total }], [{ filtered }]] = await Promise.all([
      db
        .select(PREORDER_LIST_COLUMNS)
        .from(preorders)
        .innerJoin(users, eq(users.id, preorders.userId))
        .innerJoin(games, eq(games.slug, preorders.gameSlug))
        .where(where)
        .orderBy(desc(preorders.createdAt), desc(preorders.id))
        .limit(pageSize)
        .offset((page - 1) * pageSize),
      db.select({ total: count() }).from(preorders),
      db
        .select({ filtered: count() })
        .from(preorders)
        .innerJoin(users, eq(users.id, preorders.userId))
        .where(where)
    ])

    return { data: rows, meta: { total, filtered } }
  }
}
