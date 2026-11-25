import type { Lang } from "../../libs/lang.js"

export abstract class ResolveLang {
  /** ?lang wins, then Accept-Language, then Thai (the site default). */
  static execute(query?: string | null, acceptLanguage?: string | null): Lang {
    if (query === "th" || query === "en") return query
    const first = acceptLanguage?.split(",")[0]?.trim().toLowerCase() ?? ""
    return first.startsWith("en") ? "en" : "th"
  }
}
