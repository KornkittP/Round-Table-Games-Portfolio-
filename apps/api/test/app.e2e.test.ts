import { afterAll, beforeAll, describe, expect, it } from "bun:test"
import { eq, games } from "@repo/database"
import { app } from "../src/index.js"
import { VerifyToken } from "../src/modules/auth/use-cases.js"
import { createTestDb, FAKE_VERIFIER } from "./helpers.js"

let t: Awaited<ReturnType<typeof createTestDb>>

beforeAll(async () => {
  process.env.ADMIN_EMAILS = "admin@example.com"
  t = await createTestDb()
  VerifyToken.use(FAKE_VERIFIER)
})
afterAll(async () => {
  VerifyToken.use(undefined)
  await t.close()
})

const call = (path: string, init: { method?: string; token?: string; body?: unknown; headers?: Record<string, string> } = {}) =>
  app.handle(
    new Request(`http://localhost${path}`, {
      method: init.method ?? "GET",
      headers: {
        ...(init.body ? { "content-type": "application/json" } : {}),
        ...(init.token ? { authorization: `Bearer ${init.token}` } : {}),
        ...init.headers
      },
      body: init.body ? JSON.stringify(init.body) : undefined
    })
  )

const order = {
  gameSlug: "cat-avenue",
  name: "Alice",
  phone: "+66 81 234 5678",
  address: "1 Test Road, Bangkok 10110",
  quantity: 2
}

describe("public routes", () => {
  it("GET /health", async () => {
    const res = await call("/health")
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ status: "ok" })
  })

  it("GET /games returns the 6 games in the requested language", async () => {
    const res = await call("/games?lang=en")
    expect(res.status).toBe(200)
    const json: any = await res.json()
    expect(json.data.map((g: any) => g.slug)).toEqual(["possessed", "potato-tomato", "cat-avenue", "city-line", "tangmo-tangmo-tangmo", "neko-knows"])
    expect(json.data[0].lang).toBe("en")
    expect(json.meta).toEqual({ total: 6, filtered: 6 })
  })

  it("GET /games/:slug uses Accept-Language; 404 for unknown", async () => {
    const en: any = await (await call("/games/cat-avenue", { headers: { "accept-language": "en-US" } })).json()
    expect(en.lang).toBe("en")
    const th: any = await (await call("/games/cat-avenue")).json()
    expect(th.lang).toBe("th")
    expect((await call("/games/unknown")).status).toBe(404)
  })

  it("serves the API docs", async () => {
    expect((await call("/docs")).status).toBe(200)
  })
})

describe("authentication", () => {
  it("GET /users/me needs a valid token", async () => {
    expect((await call("/users/me")).status).toBe(401)
    expect((await call("/users/me", { token: "garbage" })).status).toBe(401)
  })

  it("creates the user and returns the role", async () => {
    const me: any = await (await call("/users/me", { token: "token-a" })).json()
    expect(me).toMatchObject({ email: "a@example.com", role: "customer" })
    const admin: any = await (await call("/users/me", { token: "token-admin" })).json()
    expect(admin.role).toBe("admin")
  })
})

describe("pre-orders", () => {
  it("require sign-in, and sign-in is checked before the body", async () => {
    expect((await call("/preorders", { method: "POST", body: order })).status).toBe(401)
    expect((await call("/preorders", { method: "POST", body: { nonsense: true } })).status).toBe(401)
    expect((await call("/preorders/mine")).status).toBe(401)
  })

  it("are refused while the game is not open", async () => {
    expect((await call("/preorders", { method: "POST", token: "token-a", body: order })).status).toBe(400)
  })

  it("reject invalid bodies with 422", async () => {
    await t.db.update(games).set({ preorderOpen: true }).where(eq(games.slug, "cat-avenue"))
    expect((await call("/preorders", { method: "POST", token: "token-a", body: { ...order, quantity: 99 } })).status).toBe(422)
    expect((await call("/preorders", { method: "POST", token: "token-a", body: { ...order, phone: "x" } })).status).toBe(422)
  })

  it("let a signed-in user create and list their own", async () => {
    const created = await call("/preorders", { method: "POST", token: "token-a", body: order })
    expect(created.status).toBe(200)
    expect(await created.json()).toMatchObject({ gameSlug: "cat-avenue", quantity: 2, status: "NEW" })
    const mine: any = await (await call("/preorders/mine", { token: "token-a" })).json()
    expect(mine).toHaveLength(1)
    const others: any = await (await call("/preorders/mine", { token: "token-b" })).json()
    expect(others).toHaveLength(0)
  })

  it("ignore a status or userId sent by the client", async () => {
    const res: any = await (
      await call("/preorders", { method: "POST", token: "token-b", body: { ...order, status: "PAID", userId: "x" } })
    ).json()
    expect(res.status).toBe("NEW")
  })

  it("rate-limit creation per user (5 a minute)", async () => {
    // token-b already made 1 above; the per-game limit (3) answers 409 before the rate limit hits 429.
    const codes: number[] = []
    for (let i = 0; i < 6; i++) {
      codes.push((await call("/preorders", { method: "POST", token: "token-b", body: order })).status)
    }
    expect(codes).toContain(409)
    expect(codes.at(-1)).toBe(429)
  })
})

describe("admin routes", () => {
  it("forbid customers and allow admins", async () => {
    expect((await call("/preorders", { token: "token-a" })).status).toBe(403)
    const list: any = await (await call("/preorders", { token: "token-admin" })).json()
    expect(list.data.length).toBeGreaterThan(0)
    expect(list.data[0]).toHaveProperty("userEmail")
  })

  it("update a pre-order status, validating the id and the value", async () => {
    const id = ((await (await call("/preorders?game=cat-avenue", { token: "token-admin" })).json()) as any).data[0].id
    const patch = (path: string, token: string, body: unknown) => call(path, { method: "PATCH", token, body })
    expect((await patch(`/preorders/${id}/status`, "token-a", { status: "PAID" })).status).toBe(403)
    expect((await patch("/preorders/not-a-uuid/status", "token-admin", { status: "PAID" })).status).toBe(422)
    expect((await patch(`/preorders/${id}/status`, "token-admin", { status: "LOST" })).status).toBe(422)
    const ok = await patch(`/preorders/${id}/status`, "token-admin", { status: "PAID" })
    expect(ok.status).toBe(200)
    expect(((await ok.json()) as any).status).toBe("PAID")
  })

  it("let an admin open and close pre-orders on a game; customers cannot", async () => {
    const patch = (token: string, body: unknown) => call("/games/city-line", { method: "PATCH", token, body })
    expect((await patch("token-a", { preorderOpen: true })).status).toBe(403)
    expect((await patch("token-admin", {})).status).toBe(422)
    const opened: any = await (await patch("token-admin", { preorderOpen: true, priceThb: 990 })).json()
    expect(opened).toMatchObject({ preorderOpen: true, priceThb: 990 })
    expect(((await (await patch("token-admin", { preorderOpen: false })).json()) as any).preorderOpen).toBe(false)
    expect((await call("/games/nope", { method: "PATCH", token: "token-admin", body: { preorderOpen: true } })).status).toBe(404)
  })
})
