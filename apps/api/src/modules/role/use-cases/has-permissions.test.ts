import { describe, expect, it } from "bun:test"
import { HasPermissions } from "./has-permissions.js"
import { requiredPermissions } from "./required-permissions.js"

describe("HasPermissions", () => {
  it("lets a customer create and read their own pre-orders only", () => {
    expect(HasPermissions.execute("customer", ["preorders::create", "preorders::read"])).toBe(true)
    expect(HasPermissions.execute("customer", ["preorders::manage"])).toBe(false)
    expect(HasPermissions.execute("customer", ["games::write"])).toBe(false)
  })

  it("lets an admin do everything", () => {
    expect(
      HasPermissions.execute("admin", ["games::write", "preorders::manage", "preorders::create"])
    ).toBe(true)
  })

  it("requires every permission, not just one", () => {
    expect(HasPermissions.execute("customer", ["preorders::read", "games::write"])).toBe(false)
  })
})

describe("requiredPermissions", () => {
  const user = (role: "customer" | "admin") => ({ id: "1", email: "a@b.co", name: null, role })

  it("passes when the role has the permission", () => {
    expect(() => requiredPermissions(["games::write"])({ user: user("admin") })).not.toThrow()
  })

  it("answers 403 when it does not", () => {
    try {
      requiredPermissions(["games::write"])({ user: user("customer") })
      throw new Error("should have thrown")
    } catch (e: any) {
      expect(e.code).toBe(403)
    }
  })
})
