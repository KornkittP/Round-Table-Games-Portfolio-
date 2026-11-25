import { and, asc, count, db, games, ilike, inArray, or, eq, type SQL } from "@repo/database"
import type { Lang } from "../../libs/lang.js"
import { escapeLike } from "../../libs/escape-like.js"
import { GAME_COLUMNS } from "../constants.js"
import type { GameListModel } from "../models.js"
import { LocalizeGame } from "./localize-game.js"

export abstract class GetGameList {
  static async execute(
    { page, pageSize, search, status, preorderOpen }: GameListModel.Query,
    lang: Lang
  ): Promise<GameListModel.Response> {
    const filter: SQL[] = []

    if (search?.trim()) {
      const term = `%${escapeLike(search.trim())}%`
      const match = or(
        ilike(games.slug, term),
        ilike(games.titleEn, term),
        ilike(games.titleTh, term)
      )
      if (match) filter.push(match)
    }
    if (status?.length) filter.push(inArray(games.status, status))
    if (preorderOpen !== undefined) filter.push(eq(games.preorderOpen, preorderOpen))

    const where = and(...filter)

    const [rows, [{ total }], [{ filtered }]] = await Promise.all([
      db
        .select(GAME_COLUMNS)
        .from(games)
        .where(where)
        .orderBy(asc(games.sortOrder), asc(games.slug))
        .limit(pageSize)
        .offset((page - 1) * pageSize),
      db.select({ total: count() }).from(games),
      db.select({ filtered: count() }).from(games).where(where)
    ])

    return {
      data: rows.map((row) => LocalizeGame.execute(row, lang)),
      meta: { total, filtered }
    }
  }
}
