import { afterAll, beforeAll, describe, expect, it } from "bun:test"
import { users } from "@repo/database"
import { FindUser, UpsertUser } from "../src/modules/user/use-cases.js"
import { createTestDb, USER_A } from "./helpers.js"

let t: Awaited<ReturnType<typeof createTestDb>>
beforeAll(async () => {
  t = await createTestDb()
})
afterAll(() => t.close())

describe("UpsertUser", () => {
  it("creates a customer on first sign-in", async () => {
    const u = await UpsertUser.execute(USER_A, new Set())
    expect(u).toMatchObject({ id: USER_A.sub, email: USER_A.email, name: "Alice", role: "customer" })
  })

  it("updates name and email on later sign-ins without duplicating", async () => {
    await UpsertUser.execute({ ...USER_A, name: "Alice Smith" }, new Set())
    const all = await t.db.select().from(users)
    expect(all).toHaveLength(1)
    expect(all[0].name).toBe("Alice Smith")
  })

  it("keeps the stored name when the token has none", async () => {
    await UpsertUser.execute({ sub: USER_A.sub, email: USER_A.email }, new Set())
    expect((await FindUser.byId(USER_A.sub))?.name).toBe("Alice Smith")
  })

  it("promotes an email listed in ADMIN_EMAILS, case-insensitively", async () => {
    const u = await UpsertUser.execute(USER_A, new Set([USER_A.email.toLowerCase()]))
    expect(u.role).toBe("admin")
  })

  it("never demotes a role that was granted in the database", async () => {
    expect((await UpsertUser.execute(USER_A, new Set())).role).toBe("admin")
  })

  it("FindUser returns undefined for an unknown id", async () => {
    expect(await FindUser.byId("00000000-0000-4000-8000-0000000000ff")).toBeUndefined()
  })
})
