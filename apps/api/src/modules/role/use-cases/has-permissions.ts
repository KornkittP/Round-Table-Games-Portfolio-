import type { UserRole } from "@repo/database"
import { ROLE_PERMISSIONS, type Permission } from "../constants.js"

export abstract class HasPermissions {
  /** True only when the role holds every required permission. */
  static execute(role: UserRole, required: readonly Permission[]): boolean {
    const granted = ROLE_PERMISSIONS[role] ?? []
    return required.every((p) => granted.includes(p))
  }
}
