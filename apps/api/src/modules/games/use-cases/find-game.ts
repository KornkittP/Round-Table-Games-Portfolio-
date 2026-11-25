import { and, db, eq, games } from "@repo/database"
import type { FindOptions } from "../../libs/types.js"
import { GAME_COLUMNS } from "../constants.js"

export abstract class FindGame {
  static async bySlug(slug: string, options?: FindOptions) {
    return await this.execute([eq(games.slug, slug)], options)
  }

  private static async execute(
    filter: ReturnType<typeof eq>[],
    { lock = false, tx = db }: FindOptions = {}
  ) {
    const baseQuery = tx
      .select(GAME_COLUMNS)
      .from(games)
      .where(and(...filter))
      .limit(1)
      .$dynamic()

    const query = lock ? baseQuery.for("update", { of: games }) : baseQuery

    const [game] = await query
    return game
  }
}
