import { describe, expect, it } from "bun:test"
import { GameListModel } from "./game-list.js"
import { GameUpdateModel } from "./game-update.js"

describe("GameListModel.querySchema", () => {
  it("applies defaults", () => {
    expect(GameListModel.querySchema.parse({})).toMatchObject({ page: 1, pageSize: 20 })
  })

  it("falls back to defaults for bad paging values", () => {
    expect(GameListModel.querySchema.parse({ page: "0", pageSize: "9999" })).toMatchObject({
      page: 1,
      pageSize: 20
    })
  })

  it("splits status on | and checks each value", () => {
    expect(GameListModel.querySchema.parse({ status: "published|in_development" }).status).toEqual([
      "published",
      "in_development"
    ])
    expect(GameListModel.querySchema.safeParse({ status: "nope" }).success).toBe(false)
  })

  it("reads preorderOpen as a real boolean, so 'false' is false", () => {
    expect(GameListModel.querySchema.parse({ preorderOpen: "false" }).preorderOpen).toBe(false)
    expect(GameListModel.querySchema.parse({ preorderOpen: "true" }).preorderOpen).toBe(true)
  })

  it("ignores an unknown lang instead of failing", () => {
    expect(GameListModel.querySchema.parse({ lang: "fr" }).lang).toBeUndefined()
  })
})

describe("GameUpdateModel.bodySchema", () => {
  it("accepts a partial update", () => {
    expect(GameUpdateModel.bodySchema.safeParse({ preorderOpen: true }).success).toBe(true)
  })

  it("rejects an empty body", () => {
    expect(GameUpdateModel.bodySchema.safeParse({}).success).toBe(false)
  })

  it("rejects bad urls, bad dates and negative prices", () => {
    expect(GameUpdateModel.bodySchema.safeParse({ shopUrl: "not a url" }).success).toBe(false)
    expect(GameUpdateModel.bodySchema.safeParse({ preorderCloses: "tomorrow" }).success).toBe(false)
    expect(GameUpdateModel.bodySchema.safeParse({ priceThb: -1 }).success).toBe(false)
  })

  it("lets null clear a field and accepts an offset date", () => {
    expect(
      GameUpdateModel.bodySchema.safeParse({ shopUrl: null, preorderCloses: "2026-12-31T23:59:00+07:00" })
        .success
    ).toBe(true)
  })

  it("does not accept fields an admin must not set here", () => {
    expect(GameUpdateModel.bodySchema.parse({ preorderOpen: true, slug: "hack", createdBy: "x" })).toEqual({
      preorderOpen: true
    })
  })
})
