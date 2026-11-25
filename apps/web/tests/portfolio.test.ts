import { describe, expect, test, afterEach } from "bun:test"
import {
  studioGames,
  canReserve,
  findGame,
  listGames,
  safeLink
} from "../lib/catalog"
import { messages, switchLocale } from "../lib/locale"
import { POST } from "../app/api/contact/route"
const oldApi = process.env.NEXT_PUBLIC_API_URL,
  originalFetch = globalThis.fetch
afterEach(() => {
  if (oldApi === undefined) delete process.env.NEXT_PUBLIC_API_URL
  else process.env.NEXT_PUBLIC_API_URL = oldApi
  globalThis.fetch = originalFetch
})
describe("portfolio", () => {
  test("language switch preserves game and reservation path", () => {
    expect(switchLocale("/en/games/city-line/preorder", "th")).toBe(
      "/th/games/city-line/preorder"
    )
    expect(Object.keys(messages.en).sort()).toEqual(
      Object.keys(messages.th).sort()
    )
  })
  test("studio mode lists five closed games and the three supplied BGG links", async () => {
    delete process.env.NEXT_PUBLIC_API_URL
    const games = await listGames("th")
    expect(games).toHaveLength(5)
    expect(games.filter((g) => g.bggUrl)).toHaveLength(3)
    expect(games.every((g) => !canReserve(g))).toBe(true)
    expect(await findGame("th", "missing")).toBeUndefined()
  })
  test("closing instant is exclusive", () => {
    expect(
      canReserve(
        { preorderOpen: true, preorderCloses: "2026-01-01T00:00:00Z" },
        new Date("2026-01-01T00:00:00Z")
      )
    ).toBe(false)
  })
  test("only HTTP resource links pass", () => {
    expect(safeLink("javascript:void(0)")).toBeNull()
    expect(safeLink("https://example.com/game.pdf")).toBe(
      "https://example.com/game.pdf"
    )
  })
  test("live catalog follows pagination and sends locale", async () => {
    process.env.NEXT_PUBLIC_API_URL = "https://api.example"
    const games = studioGames("en")
    let requests = 0
    globalThis.fetch = (async (input: RequestInfo | URL) => {
      const url = new URL(String(input))
      expect(url.searchParams.get("lang")).toBe("en")
      expect(url.searchParams.get("page")).toBe(String(++requests))
      return Response.json({
        data: games.slice((requests - 1) * 2, requests * 2),
        meta: { filtered: games.length }
      })
    }) as unknown as typeof fetch
    expect(await listGames("en")).toEqual(games)
    expect(requests).toBe(3)
  })
  test("a failed live catalog stays distinguishable from a missing game", async () => {
    process.env.NEXT_PUBLIC_API_URL = "https://api.example"
    globalThis.fetch = (async () =>
      new Response(null, { status: 404 })) as unknown as typeof fetch
    expect(await findGame("en", "missing")).toBeUndefined()
    globalThis.fetch = (async () =>
      new Response(null, { status: 503 })) as unknown as typeof fetch
    await expect(findGame("en", "city-line")).rejects.toThrow()
  })
  test("contact rejects missing delivery configuration", async () => {
    const key = process.env.RESEND_API_KEY
    delete process.env.RESEND_API_KEY
    try {
      expect(
        (
          await POST(
            new Request("https://example.test/api/contact", { method: "POST" })
          )
        ).status
      ).toBe(503)
    } finally {
      if (key !== undefined) process.env.RESEND_API_KEY = key
    }
  })
})
