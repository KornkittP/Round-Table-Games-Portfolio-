import { afterAll, beforeAll, describe, expect, it } from "bun:test"
import { db, eq, games, seedGames } from "@repo/database"
import { FindGame, GetGameList, UpdateGame } from "../src/modules/games/use-cases.js"
import { GameListModel } from "../src/modules/games/models.js"
import { authUser, ADMIN, createTestDb } from "./helpers.js"

let t: Awaited<ReturnType<typeof createTestDb>>
beforeAll(async () => {
  t = await createTestDb()
})
afterAll(() => t.close())

const list = (q: Record<string, unknown> = {}, lang: "th" | "en" = "en") =>
  GetGameList.execute(GameListModel.querySchema.parse(q), lang)

describe("seed", () => {
  it("inserted the 6 games, and seeding again adds nothing and keeps edits", async () => {
    expect((await list()).data.map((g) => g.slug)).toEqual([
      "possessed",
      "potato-tomato",
      "cat-avenue",
      "city-line",
      "tangmo-tangmo-tangmo", "neko-knows"
    ])
    await t.db.update(games).set({ titleTh: "แมว" }).where(eq(games.slug, "cat-avenue"))
    expect(await seedGames(t.db)).toBe(0)
    expect((await FindGame.bySlug("cat-avenue"))?.titleTh).toBe("แมว")
  })
})

describe("FindGame", () => {
  it("finds by slug, or returns undefined", async () => {
    expect((await FindGame.bySlug("city-line"))?.titleEn).toBe("City Line")
    expect(await FindGame.bySlug("nope")).toBeUndefined()
  })

  it("can lock the row inside a transaction", async () => {
    const game = await db.transaction((tx) => FindGame.bySlug("city-line", { lock: true, tx }))
    expect(game?.slug).toBe("city-line")
  })
})

describe("GetGameList", () => {
  it("serves Thai and English from the same rows", async () => {
    expect((await list({}, "th")).data.find((g) => g.slug === "cat-avenue")?.title).toBe("แมว")
    expect((await list({}, "en")).data.find((g) => g.slug === "cat-avenue")?.title).toBe("Cat Avenue")
  })

  it("paginates and reports total and filtered counts", async () => {
    const page = await list({ page: "2", pageSize: "3" })
    expect(page.data.map((g) => g.slug)).toEqual(["city-line", "tangmo-tangmo-tangmo", "neko-knows"])
    expect(page.meta).toEqual({ total: 6, filtered: 6 })
  })

  it("searches title and slug, case-insensitively", async () => {
    const res = await list({ search: "CAT" })
    expect(res.data.map((g) => g.slug)).toEqual(["cat-avenue"])
    expect(res.meta).toEqual({ total: 6, filtered: 1 })
  })

  it("treats % and _ in search literally", async () => {
    expect((await list({ search: "%" })).data).toHaveLength(0)
    expect((await list({ search: "_" })).data).toHaveLength(0)
  })

  it("filters by status and by preorderOpen", async () => {
    expect((await list({ status: "in_development" })).data).toHaveLength(1)
    expect((await list({ status: "published|in_development" })).data).toHaveLength(5)
    expect((await list({ preorderOpen: "true" })).data).toHaveLength(0)
    expect((await list({ preorderOpen: "false" })).data).toHaveLength(6)
  })
})

describe("UpdateGame", () => {
  it("updates only the given fields and records who changed it", async () => {
    await UpdateGame.execute("possessed", { preorderOpen: true, priceThb: 890 }, authUser(ADMIN, "admin"))
    const g = await FindGame.bySlug("possessed")
    expect(g).toMatchObject({ preorderOpen: true, priceThb: 890, titleEn: "Possessed" })
    const [row] = await t.db.select().from(games).where(eq(games.slug, "possessed"))
    expect(row.updatedBy).toBe(ADMIN.email)
    expect(row.updatedAt).not.toBeNull()
  })

  it("answers 404 for an unknown game", async () => {
    expect(UpdateGame.execute("nope", { preorderOpen: true }, authUser(ADMIN, "admin"))).rejects.toMatchObject({ code: 404 })
  })
})
