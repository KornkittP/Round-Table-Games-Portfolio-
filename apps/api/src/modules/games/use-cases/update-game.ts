import { db, eq, games } from "@repo/database"
import { status } from "elysia"
import type { AuthUser } from "../../auth/models.js"
import type { GameUpdateModel } from "../models.js"

export abstract class UpdateGame {
  static async execute(slug: string, body: GameUpdateModel.Body, user: AuthUser) {
    const [updated] = await db
      .update(games)
      .set({ ...body, updatedBy: user.email, updatedAt: new Date().toISOString() })
      .where(eq(games.slug, slug))
      .returning({ slug: games.slug })
    if (!updated) throw status(404, "Game not found")
    return updated.slug
  }
}
