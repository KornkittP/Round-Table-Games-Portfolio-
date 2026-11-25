import { games } from "@repo/database"

export const GAME_COLUMNS = {
  slug: games.slug,
  status: games.status,
  titleEn: games.titleEn,
  titleTh: games.titleTh,
  taglineEn: games.taglineEn,
  taglineTh: games.taglineTh,
  descriptionEn: games.descriptionEn,
  descriptionTh: games.descriptionTh,
  year: games.year,
  priceThb: games.priceThb,
  preorderOpen: games.preorderOpen,
  preorderCloses: games.preorderCloses,
  coverImage: games.coverImage,
  bggUrl: games.bggUrl,
  shopUrl: games.shopUrl,
  rulebookUrl: games.rulebookUrl,
  pnpUrl: games.pnpUrl,
  sortOrder: games.sortOrder
}
