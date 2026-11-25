import { describe, expect, it } from "bun:test"
import { IsPreorderOpen } from "./is-preorder-open.js"
import { LocalizeGame } from "./localize-game.js"
import { ResolveLang } from "./resolve-lang.js"

const row = (over: Record<string, unknown> = {}) =>
  ({
    slug: "x",
    status: "in_development",
    titleEn: "Title",
    titleTh: null,
    taglineEn: null,
    taglineTh: null,
    descriptionEn: null,
    descriptionTh: null,
    year: null,
    priceThb: null,
    preorderOpen: false,
    preorderCloses: null,
    coverImage: null,
    bggUrl: null,
    shopUrl: null,
    rulebookUrl: null,
    pnpUrl: null,
    sortOrder: 1,
    ...over
  }) as any

describe("LocalizeGame", () => {
  it("uses Thai when present and falls back to English when empty", () => {
    const r = row({ titleTh: "เกม", taglineEn: "Tag", taglineTh: "  " })
    expect(LocalizeGame.execute(r, "th").title).toBe("เกม")
    expect(LocalizeGame.execute(r, "th").tagline).toBe("Tag")
    expect(LocalizeGame.execute(r, "en").title).toBe("Title")
  })

  it("falls back to Thai when English text is missing", () => {
    expect(LocalizeGame.execute(row({ titleEn: "", titleTh: "เกม" }), "en").title).toBe("เกม")
  })

  it("never returns undefined text, so the response always validates", () => {
    const g = LocalizeGame.execute(row(), "th")
    expect(g.tagline).toBe("")
    expect(g.description).toBe("")
  })

  it("reports pre-orders as closed after the closing time", () => {
    const r = row({ preorderOpen: true, preorderCloses: "2026-01-01T00:00:00Z" })
    expect(LocalizeGame.execute(r, "en", new Date("2025-12-01")).preorderOpen).toBe(true)
    expect(LocalizeGame.execute(r, "en", new Date("2026-06-01")).preorderOpen).toBe(false)
  })
})

describe("IsPreorderOpen", () => {
  const now = new Date("2026-12-01T00:00:00Z")
  it("is closed when the flag is off", () => {
    expect(IsPreorderOpen.execute({ preorderOpen: false }, now)).toBe(false)
  })
  it("is open with no closing time", () => {
    expect(IsPreorderOpen.execute({ preorderOpen: true }, now)).toBe(true)
  })
  it("closes after the closing time", () => {
    expect(IsPreorderOpen.execute({ preorderOpen: true, preorderCloses: "2026-12-31T00:00:00Z" }, now)).toBe(true)
    expect(IsPreorderOpen.execute({ preorderOpen: true, preorderCloses: "2026-11-30T00:00:00Z" }, now)).toBe(false)
  })
})

describe("ResolveLang", () => {
  it("prefers the query, then Accept-Language, then Thai", () => {
    expect(ResolveLang.execute("en", "th")).toBe("en")
    expect(ResolveLang.execute(undefined, "en-US,en;q=0.9")).toBe("en")
    expect(ResolveLang.execute(undefined, undefined)).toBe("th")
    expect(ResolveLang.execute("fr", "fr")).toBe("th")
  })
})
