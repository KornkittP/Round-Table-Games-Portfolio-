import { describe, expect, it } from "bun:test"
import { ParseAdminEmails } from "./parse-admin-emails.js"

describe("ParseAdminEmails", () => {
  it("splits, trims and lowercases", () => {
    expect([...ParseAdminEmails.execute(" Me@Example.com, you@example.com ,,")]).toEqual([
      "me@example.com",
      "you@example.com"
    ])
  })

  it("is empty for an empty string", () => {
    expect(ParseAdminEmails.execute("").size).toBe(0)
  })
})
