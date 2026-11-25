import { Elysia, status } from "elysia"
import { authPlugin } from "../auth/index.js"
import { requiredPermissions } from "../role/use-cases.js"
import { GameListModel, GameModel, GameUpdateModel } from "./models.js"
import { FindGame, GetGameList, LocalizeGame, ResolveLang, UpdateGame } from "./use-cases.js"

export const gamesModule = new Elysia({ prefix: "/games" })
  .get(
    "/",
    async ({ query, headers }) =>
      await GetGameList.execute(query, ResolveLang.execute(query.lang, headers["accept-language"])),
    {
      query: GameListModel.querySchema,
      response: { 200: GameListModel.responseSchema },
      detail: {
        summary: "Get game list",
        description: "Public. Use ?lang=th|en, otherwise Accept-Language, otherwise Thai.",
        tags: ["Game"]
      }
    }
  )
  .get(
    "/:slug",
    async ({ params, query, headers }) => {
      const game = await FindGame.bySlug(params.slug)
      if (!game) throw status(404, "Game not found")
      return LocalizeGame.execute(game, ResolveLang.execute(query.lang, headers["accept-language"]))
    },
    {
      params: GameModel.paramsSchema,
      query: GameModel.detailQuerySchema,
      response: { 200: GameModel.responseSchema },
      detail: { summary: "Get game", description: "Public.", tags: ["Game"] }
    }
  )
  .use(authPlugin)
  .patch(
    "/:slug",
    async ({ params, body, user }) => {
      await UpdateGame.execute(params.slug, body, user)
      const game = await FindGame.bySlug(params.slug)
      return LocalizeGame.execute(game!, "en")
    },
    {
      params: GameModel.paramsSchema,
      body: GameUpdateModel.bodySchema,
      beforeHandle: requiredPermissions(["games::write"]),
      response: { 200: GameModel.responseSchema },
      detail: {
        summary: "Update game",
        description: "Admin only. Edit copy, links, price and open or close pre-orders.",
        tags: ["Game"]
      }
    }
  )
