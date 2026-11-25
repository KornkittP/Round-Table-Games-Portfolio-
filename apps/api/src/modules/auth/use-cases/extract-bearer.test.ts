import { describe, expect, it } from "bun:test"
import { ExtractBearer } from "./extract-bearer.js"

describe("ExtractBearer", () => {
  it("parses a bearer header, case-insensitive scheme", () => {
    expect(ExtractBearer.execute("Bearer abc.def")).toBe("abc.def")
    expect(ExtractBearer.execute("bearer abc")).toBe("abc")
  })

  it("returns null for missing or malformed headers", () => {
    expect(ExtractBearer.execute(undefined)).toBeNull()
    expect(ExtractBearer.execute("Basic abc")).toBeNull()
    expect(ExtractBearer.execute("Bearer")).toBeNull()
  })
})
