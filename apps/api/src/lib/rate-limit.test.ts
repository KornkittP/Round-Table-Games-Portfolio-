import { describe, expect, it } from "bun:test"
import { rateLimit } from "./rate-limit.js"

describe("rateLimit", () => {
  const make = (now: () => number) =>
    rateLimit<{ id: string }>({ limit: 2, windowMs: 1000, key: (c) => c.id, now })

  it("allows up to the limit, then answers 429", () => {
    const hook = make(() => 0)
    hook({ id: "a" })
    hook({ id: "a" })
    expect(() => hook({ id: "a" })).toThrow()
    try {
      hook({ id: "a" })
    } catch (e: any) {
      expect(e.code).toBe(429)
    }
  })

  it("counts each key separately", () => {
    const hook = make(() => 0)
    hook({ id: "a" })
    hook({ id: "a" })
    expect(() => hook({ id: "b" })).not.toThrow()
  })

  it("starts a new window after windowMs", () => {
    let t = 0
    const hook = make(() => t)
    hook({ id: "a" })
    hook({ id: "a" })
    t = 1000
    expect(() => hook({ id: "a" })).not.toThrow()
  })
})
