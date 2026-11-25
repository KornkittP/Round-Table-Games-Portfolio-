import type { Game } from "@repo/database"
import type { Lang } from "../../libs/lang.js"
import type { GameModel } from "../models.js"
import { IsPreorderOpen } from "./is-preorder-open.js"

const pick = (primary?: string | null, fallback?: string | null) =>
  primary?.trim() || fallback?.trim() || ""

type GameRow = Pick<
  Game,
  | "slug" | "status" | "titleEn" | "titleTh" | "taglineEn" | "taglineTh" | "descriptionEn"
  | "descriptionTh" | "year" | "priceThb" | "preorderOpen" | "preorderCloses" | "coverImage"
  | "bggUrl" | "shopUrl" | "rulebookUrl" | "pnpUrl" | "sortOrder"
>

export abstract class LocalizeGame {
  static execute(row: GameRow, lang: Lang, now = new Date()): GameModel.Response {
    const th = lang === "th"
    return {
      slug: row.slug,
      lang,
      status: row.status,
      title: th ? pick(row.titleTh, row.titleEn) : pick(row.titleEn, row.titleTh),
      tagline: th ? pick(row.taglineTh, row.taglineEn) : pick(row.taglineEn, row.taglineTh),
      description: th
        ? pick(row.descriptionTh, row.descriptionEn)
        : pick(row.descriptionEn, row.descriptionTh),
      year: row.year,
      priceThb: row.priceThb,
      preorderOpen: IsPreorderOpen.execute(row, now),
      preorderCloses: row.preorderCloses,
      coverImage: row.coverImage,
      bggUrl: row.bggUrl,
      shopUrl: row.shopUrl,
      rulebookUrl: row.rulebookUrl,
      pnpUrl: row.pnpUrl,
      sortOrder: row.sortOrder
    }
  }
}
