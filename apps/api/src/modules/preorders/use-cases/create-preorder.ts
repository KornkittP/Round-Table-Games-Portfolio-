import { and, count, db, eq, ne, preorders } from "@repo/database"
import { status } from "elysia"
import type { AuthUser } from "../../auth/models.js"
import { FindGame, IsPreorderOpen } from "../../games/use-cases.js"
import { MAX_ACTIVE_PREORDERS_PER_GAME, PREORDER_COLUMNS } from "../constants.js"
import type { PreorderCreateModel } from "../models.js"

export abstract class CreatePreorder {
  static async execute(user: AuthUser, body: PreorderCreateModel.Body, now = new Date()) {
    return await db.transaction(async (tx) => {
      // Lock the game row so two requests for the same game cannot both pass the limit check.
      const game = await FindGame.bySlug(body.gameSlug, { lock: true, tx })
      if (!game) throw status(404, "Game not found")
      if (!IsPreorderOpen.execute(game, now)) {
        throw status(400, "Pre-orders for this game are not open")
      }

      const [{ active }] = await tx
        .select({ active: count() })
        .from(preorders)
        .where(
          and(
            eq(preorders.userId, user.id),
            eq(preorders.gameSlug, game.slug),
            ne(preorders.status, "CANCELLED")
          )
        )
      if (active >= MAX_ACTIVE_PREORDERS_PER_GAME) {
        throw status(409, "You have reached the pre-order limit for this game")
      }

      const [created] = await tx
        .insert(preorders)
        .values({
          gameSlug: game.slug,
          userId: user.id,
          name: body.name,
          phone: body.phone,
          address: body.address,
          quantity: body.quantity,
          notes: body.notes || null
        })
        .returning(PREORDER_COLUMNS)
      return created
    })
  }
}
