import { afterAll, beforeAll, describe, expect, it } from "bun:test"
import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { MIGRATIONS_FOLDER } from "@repo/database"
import { ADMIN, createTestDb, USER_A, USER_B } from "./helpers.js"

let t: Awaited<ReturnType<typeof createTestDb>>
beforeAll(async () => {
  t = await createTestDb({ seed: false, install: false })
})
afterAll(() => t.close())

const q = (sql: string, params: unknown[] = []) => t.client.query<any>(sql, params)

describe("migrations", () => {
  it("are numbered consecutively and listed in the journal in order", () => {
    const files = readdirSync(MIGRATIONS_FOLDER).filter((f) => f.endsWith(".sql")).sort()
    const journal = JSON.parse(readFileSync(join(MIGRATIONS_FOLDER, "meta/_journal.json"), "utf8"))
    expect(files.length).toBeGreaterThan(1)
    files.forEach((f, i) => expect(f.startsWith(String(i).padStart(4, "0") + "_")).toBe(true))
    expect(journal.entries.map((e: any) => `${e.tag}.sql`)).toEqual(files)
  })

  it("create the three tables with Row Level Security on", async () => {
    const { rows } = await q(
      `select relname, relrowsecurity from pg_class
       where relname in ('games','users','preorders') order by 1`
    )
    expect(rows).toEqual([
      { relname: "games", relrowsecurity: true },
      { relname: "preorders", relrowsecurity: true },
      { relname: "users", relrowsecurity: true }
    ])
  })

  it("create the expected policies", async () => {
    const { rows } = await q(
      `select tablename, count(*)::int as n from pg_policies
       where schemaname = 'public' group by 1 order by 1`
    )
    expect(rows).toEqual([
      { tablename: "games", n: 4 },
      { tablename: "preorders", n: 4 },
      { tablename: "users", n: 2 }
    ])
  })

  it("enforce the quantity range in the database", async () => {
    await q(`insert into games (slug, title_en) values ('g0', 'G0')`)
    await q(`insert into users (id, email) values ($1, 'a@example.com')`, [USER_A.sub])
    const insert = (qty: number) =>
      q(
        `insert into preorders (game_slug, user_id, name, phone, address, quantity)
         values ('g0', $1, 'n', '0812345678', 'addr', $2)`,
        [USER_A.sub, qty]
      )
    expect(insert(0)).rejects.toThrow()
    expect(insert(11)).rejects.toThrow()
    await insert(3)
  })
})

/** Acts as a Supabase caller using only the public key: the role and JWT subject are set per query. */
async function as<T>(role: "anon" | "authenticated", sub: string | null, fn: () => Promise<T>) {
  await t.client.exec(`set role ${role}`)
  await t.client.query(`select set_config('request.jwt.claim.sub', $1, false)`, [sub ?? ""])
  try {
    return await fn()
  } finally {
    await t.client.exec(`reset role`)
    await t.client.query(`select set_config('request.jwt.claim.sub', '', false)`)
  }
}

describe("Row Level Security (what the public key can do)", () => {
  beforeAll(async () => {
    // Fixtures, written as the owner (bypasses RLS).
    await q(`insert into users (id, email, role) values ($1,'b@example.com','customer'), ($2,'admin@example.com','admin')`, [USER_B.sub, ADMIN.sub])
    await q(`insert into games (slug, title_en, preorder_open) values ('open-game','Open', true)`)
    await q(`insert into games (slug, title_en, preorder_open) values ('closed-game','Closed', false)`)
    await q(
      `insert into games (slug, title_en, preorder_open, preorder_closes) values ('expired-game','Expired', true, now() - interval '1 day')`
    )
    await q(
      `insert into preorders (game_slug, user_id, name, phone, address, quantity)
       values ('open-game', $1, 'Bob order', '0812345678', 'addr', 1)`,
      [USER_B.sub]
    )
  })

  const order = (game: string, user: string) =>
    q(
      `insert into preorders (game_slug, user_id, name, phone, address, quantity)
       values ($1, $2, 'n', '0812345678', 'addr', 1)`,
      [game, user]
    )

  it("anyone can read games, but anon cannot write them", async () => {
    await as("anon", null, async () => {
      expect((await q(`select slug from games`)).rows.length).toBeGreaterThan(0)
      expect(q(`insert into games (slug, title_en) values ('evil','Evil')`)).rejects.toThrow()
    })
  })

  it("anon sees no users and no pre-orders", async () => {
    await as("anon", null, async () => {
      expect((await q(`select * from users`)).rows).toHaveLength(0)
      expect((await q(`select * from preorders`)).rows).toHaveLength(0)
    })
  })

  it("a signed-in user sees only their own profile and pre-orders", async () => {
    await as("authenticated", USER_A.sub, async () => {
      expect((await q(`select email from users`)).rows).toEqual([{ email: "a@example.com" }])
      expect((await q(`select * from preorders`)).rows.every((r) => r.user_id === USER_A.sub)).toBe(true)
    })
    await as("authenticated", USER_B.sub, async () => {
      expect((await q(`select name from preorders`)).rows).toEqual([{ name: "Bob order" }])
    })
  })

  it("an admin sees everyone", async () => {
    await as("authenticated", ADMIN.sub, async () => {
      expect((await q(`select id from users`)).rows.length).toBe(3)
      expect((await q(`select id from preorders`)).rows.length).toBeGreaterThan(1)
    })
  })

  it("a user can pre-order for themselves, only while the game is open", async () => {
    await as("authenticated", USER_A.sub, async () => {
      await order("open-game", USER_A.sub)
      expect(order("closed-game", USER_A.sub)).rejects.toThrow(/row-level security/)
      expect(order("expired-game", USER_A.sub)).rejects.toThrow(/row-level security/)
    })
  })

  it("a user cannot pre-order in someone else's name", async () => {
    await as("authenticated", USER_A.sub, async () => {
      expect(order("open-game", USER_B.sub)).rejects.toThrow(/row-level security/)
    })
  })

  it("only an admin can change a pre-order or a game", async () => {
    await as("authenticated", USER_A.sub, async () => {
      const res = await q(`update preorders set status = 'PAID' where user_id = $1 returning id`, [USER_A.sub])
      expect(res.rows).toHaveLength(0)
      expect(q(`update games set title_en = 'Hacked' where slug = 'open-game'`).then((r) => r.affectedRows)).resolves.toBe(0)
    })
    await as("authenticated", ADMIN.sub, async () => {
      const res = await q(`update preorders set status = 'PAID' where user_id = $1 returning id`, [USER_A.sub])
      expect(res.rows.length).toBeGreaterThan(0)
    })
  })

  it("nobody can delete a pre-order through the public key", async () => {
    await as("authenticated", ADMIN.sub, async () => {
      const res = await q(`delete from preorders returning id`)
      expect(res.rows).toHaveLength(0)
    })
  })

  it("is_admin() is true only for admin users", async () => {
    await as("authenticated", USER_A.sub, async () => {
      expect((await q(`select public.is_admin() as v`)).rows[0].v).toBe(false)
    })
    await as("authenticated", ADMIN.sub, async () => {
      expect((await q(`select public.is_admin() as v`)).rows[0].v).toBe(true)
    })
  })
})
