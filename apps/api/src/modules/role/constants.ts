import type { UserRole } from "@repo/database"

export const PERMISSIONS = [
  "games::write",
  "preorders::create",
  "preorders::read",
  "preorders::manage"
] as const

export type Permission = (typeof PERMISSIONS)[number]

const CUSTOMER_PERMISSIONS = ["preorders::create", "preorders::read"] as const satisfies Permission[]

export const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  customer: CUSTOMER_PERMISSIONS,
  admin: [...CUSTOMER_PERMISSIONS, "games::write", "preorders::manage"]
}
