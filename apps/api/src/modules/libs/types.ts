import type { Db } from "@repo/database"

/** Options shared by the Find* use-cases: lock the row (FOR UPDATE) and/or run inside a transaction. */
export type FindOptions = {
  lock?: boolean
  tx?: Db
}

export type ListResponseSchema = {
  data: unknown[]
  meta: { total: number; filtered: number }
}
