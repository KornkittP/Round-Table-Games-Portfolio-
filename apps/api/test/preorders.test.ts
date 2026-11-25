import { afterAll, beforeAll, beforeEach, describe, expect, it } from "bun:test"
import { eq, games, preorders } from "@repo/database"
import { MAX_ACTIVE_PREORDERS_PER_GAME } from "../src/modules/preorders/constants.js"
import { PreorderListModel } from "../src/modules/preorders/models.js"
import {
  CreatePreorder,
  GetMyPreorders,
  GetPreorderList,
  UpdatePreorderStatus
} from "../src/modules/preorders/use-cases.js"
import { UpsertUser } from "../src/modules/user/use-cases.js"
import { ADMIN, authUser, createTestDb, USER_A, USER_B } from "./helpers.js"

let t: Awaited<ReturnType<typeof createTestDb>>
const a = authUser(USER_A)
const b = authUser(USER_B)

const body = (over: Record<string, unknown> = {}) => ({
  gameSlug: "cat-avenue",
  name: "Alice",
  phone: "0812345678",
  address: "1 Test Road, Bangkok",
  quantity: 1,
  ...over
})
const open = () => t.db.update(games).set({ preorderOpen: true, preorderCloses: null }).where(eq(games.slug, "cat-avenue"))

beforeAll(async () => {
  t = await createTestDb()
})
afterAll(() => t.close())

beforeEach(async () => {
  await t.db.delete(preorders)
  await t.db.update(games).set({ preorderOpen: false, preorderCloses: null })
  for (const c of [USER_A, USER_B, ADMIN]) await UpsertUser.execute(c, new Set())
})

describe("CreatePreorder", () => {
  it("answers 404 for an unknown game", () => {
    expect(CreatePreorder.execute(a, body({ gameSlug: "nope" }))).rejects.toMatchObject({ code: 404 })
  })

  it("answers 400 while pre-orders are not open", () => {
    expect(CreatePreorder.execute(a, body())).rejects.toMatchObject({ code: 400 })
  })

  it("answers 400 after the closing time, and works before it", async () => {
    await open()
    await t.db.update(games).set({ preorderCloses: "2026-01-01T00:00:00Z" }).where(eq(games.slug, "cat-avenue"))
    expect(CreatePreorder.execute(a, body(), new Date("2026-06-01"))).rejects.toMatchObject({ code: 400 })
    expect(await CreatePreorder.execute(a, body(), new Date("2025-12-01"))).toMatchObject({ status: "NEW" })
  })

  it("creates a NEW pre-order for the signed-in user", async () => {
    await open()
    const p = await CreatePreorder.execute(a, body({ quantity: 2, notes: "gift" }))
    expect(p).toMatchObject({ gameSlug: "cat-avenue", quantity: 2, status: "NEW", notes: "gift" })
    const [row] = await t.db.select().from(preorders).where(eq(preorders.id, p.id))
    expect(row.userId).toBe(USER_A.sub)
  })

  it("limits active pre-orders per user per game; cancelled ones do not count", async () => {
    await open()
    const made = []
    for (let i = 0; i < MAX_ACTIVE_PREORDERS_PER_GAME; i++) made.push(await CreatePreorder.execute(a, body()))
    expect(CreatePreorder.execute(a, body())).rejects.toMatchObject({ code: 409 })
    await UpdatePreorderStatus.execute(made[0].id, { status: "CANCELLED" }, authUser(ADMIN, "admin"))
    expect(await CreatePreorder.execute(a, body())).toBeDefined()
    expect(await CreatePreorder.execute(b, body())).toBeDefined()
  })

  it("holds the limit when requests arrive at the same time", async () => {
    await open()
    const results = await Promise.allSettled(Array.from({ length: 6 }, () => CreatePreorder.execute(a, body())))
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(MAX_ACTIVE_PREORDERS_PER_GAME)
    expect(await GetMyPreorders.execute(USER_A.sub)).toHaveLength(MAX_ACTIVE_PREORDERS_PER_GAME)
  })
})

describe("GetMyPreorders", () => {
  it("lists only my own, newest first", async () => {
    await open()
    await CreatePreorder.execute(a, body({ name: "first" }))
    await CreatePreorder.execute(a, body({ name: "second" }))
    await CreatePreorder.execute(b, body({ name: "bob" }))
    expect((await GetMyPreorders.execute(USER_A.sub)).map((p) => p.name)).toEqual(["second", "first"])
  })
})

describe("GetPreorderList (admin)", () => {
  const list = (q: Record<string, unknown> = {}) => GetPreorderList.execute(PreorderListModel.querySchema.parse(q))

  beforeEach(async () => {
    await open()
    await t.db.update(games).set({ preorderOpen: true }).where(eq(games.slug, "city-line"))
    await CreatePreorder.execute(a, body({ name: "Alice order", phone: "0811111111" }))
    await CreatePreorder.execute(b, body({ gameSlug: "city-line", name: "Bob order", phone: "0822222222" }))
  })

  it("returns rows with the buyer and game, plus total and filtered counts", async () => {
    const res = await list()
    expect(res.meta).toEqual({ total: 2, filtered: 2 })
    expect(res.data[0]).toMatchObject({ userEmail: "b@example.com", gameTitle: "City Line" })
  })

  it("filters by game, status and search (name, phone or email)", async () => {
    expect((await list({ game: "cat-avenue" })).data.map((p) => p.name)).toEqual(["Alice order"])
    expect((await list({ status: "PAID" })).data).toHaveLength(0)
    expect((await list({ search: "0822" })).data.map((p) => p.name)).toEqual(["Bob order"])
    expect((await list({ search: "a@example" })).data.map((p) => p.name)).toEqual(["Alice order"])
    expect((await list({ search: "%" })).data).toHaveLength(0)
  })

  it("paginates", async () => {
    const res = await list({ pageSize: "1", page: "2" })
    expect(res.data).toHaveLength(1)
    expect(res.meta.filtered).toBe(2)
  })
})

describe("UpdatePreorderStatus", () => {
  it("updates the status and records who did it", async () => {
    await open()
    const p = await CreatePreorder.execute(a, body())
    const updated = await UpdatePreorderStatus.execute(p.id, { status: "PAID" }, authUser(ADMIN, "admin"))
    expect(updated.status).toBe("PAID")
    const [row] = await t.db.select().from(preorders).where(eq(preorders.id, p.id))
    expect(row.updatedBy).toBe(ADMIN.email)
  })

  it("answers 404 for a missing pre-order", () => {
    expect(
      UpdatePreorderStatus.execute("00000000-0000-4000-8000-000000000000", { status: "PAID" }, authUser(ADMIN, "admin"))
    ).rejects.toMatchObject({ code: 404 })
  })
})
