import { status } from "elysia"
import type { AuthUser } from "../../auth/models.js"
import type { Permission } from "../constants.js"
import { HasPermissions } from "./has-permissions.js"

/** beforeHandle hook. Use after authPlugin, which provides `user`. */
export const requiredPermissions =
  (required: readonly Permission[]) =>
  ({ user }: { user: AuthUser }) => {
    if (!HasPermissions.execute(user.role, required)) {
      throw status(403, "You do not have permission to do this")
    }
  }
