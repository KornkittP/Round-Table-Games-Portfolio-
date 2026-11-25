import { games, preorders, users } from "@repo/database"

/** Most active (not cancelled) pre-orders one person may hold for one game. */
export const MAX_ACTIVE_PREORDERS_PER_GAME = 3

export const PREORDER_COLUMNS = {
  id: preorders.id,
  gameSlug: preorders.gameSlug,
  name: preorders.name,
  phone: preorders.phone,
  address: preorders.address,
  quantity: preorders.quantity,
  notes: preorders.notes,
  status: preorders.status,
  createdAt: preorders.createdAt,
  updatedAt: preorders.updatedAt
}

export const PREORDER_LIST_COLUMNS = {
  ...PREORDER_COLUMNS,
  userEmail: users.email,
  userName: users.name,
  gameTitle: games.titleEn
}
