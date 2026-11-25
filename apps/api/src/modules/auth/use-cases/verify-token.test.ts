import { afterEach, describe, expect, it } from "bun:test"
import { VerifyToken } from "./verify-token.js"

afterEach(() => VerifyToken.use(undefined))

describe("VerifyToken", () => {
  it("returns the claims of a good token", async () => {
    VerifyToken.use({ verify: async () => ({ sub: "u", email: "a@b.co" }) })
    expect(await VerifyToken.execute("t")).toEqual({ sub: "u", email: "a@b.co" })
  })

  it("turns any verifier failure into a 401", async () => {
    VerifyToken.use({ verify: async () => { throw new Error("boom") } })
    expect(VerifyToken.execute("t")).rejects.toMatchObject({ code: 401 })
  })
})
