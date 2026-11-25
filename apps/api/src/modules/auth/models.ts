import type { User } from "@repo/database"

export type AuthUser = Pick<User, "id" | "email" | "name" | "role">
