import { describe, expect, it } from "bun:test"
import { PreorderCreateModel } from "./preorder-create.js"
import { PreorderListModel } from "./preorder-list.js"
import { PreorderUpdateStatusModel } from "./preorder-update-status.js"

const valid = {
  gameSlug: "cat-avenue",
  name: "  Somchai  ",
  phone: "+66 81 234 5678",
  address: "123 Sukhumvit Rd, Bangkok 10110",
  quantity: 2
}
const parse = (over: Record<string, unknown> = {}) =>
  PreorderCreateModel.bodySchema.safeParse({ ...valid, ...over })

describe("PreorderCreateModel.bodySchema", () => {
  it("accepts a valid body and trims strings", () => {
    const r = parse()
    expect(r.success).toBe(true)
    expect(r.data?.name).toBe("Somchai")
  })

  const bad: [string, Record<string, unknown>][] = [
    ["quantity 0", { quantity: 0 }],
    ["quantity 11", { quantity: 11 }],
    ["fractional quantity", { quantity: 1.5 }],
    ["quantity as string", { quantity: "2" }],
    ["letters in phone", { phone: "call me maybe" }],
    ["too-short phone", { phone: "123" }],
    ["blank name", { name: "   " }],
    ["short address", { address: "x" }],
    ["overlong notes", { notes: "x".repeat(501) }]
  ]
  for (const [label, over] of bad) {
    it(`rejects ${label}`, () => expect(parse(over).success).toBe(false))
  }

  it("treats notes as optional and drops unknown fields such as status", () => {
    const r = parse({ status: "PAID", userId: "x" })
    expect(r.success).toBe(true)
    expect(r.data).not.toHaveProperty("status")
    expect(r.data).not.toHaveProperty("userId")
  })
})

describe("other pre-order models", () => {
  it("status update accepts known statuses only", () => {
    expect(PreorderUpdateStatusModel.bodySchema.safeParse({ status: "PAID" }).success).toBe(true)
    expect(PreorderUpdateStatusModel.bodySchema.safeParse({ status: "lost" }).success).toBe(false)
  })

  it("admin list query has defaults and splits status", () => {
    const q = PreorderListModel.querySchema.parse({ status: "NEW|PAID" })
    expect(q).toMatchObject({ page: 1, pageSize: 20, status: ["NEW", "PAID"] })
  })
})
