import { bggGame } from "./bgg"
import type { GameModel } from "../../api/src/modules/games/models/game"
import type { Locale } from "./locale"
import { IsPreorderOpen } from "../../api/src/modules/games/use-cases/is-preorder-open"
export type Game = GameModel.Response
export const canReserve = IsPreorderOpen.execute
const titles = [
  ["possessed", "Possessed", ""],
  ["potato-tomato", "Potato Tomato", "420700"],
  ["cat-avenue", "Cat Avenue", "376568"],
  ["city-line", "City Line", "435092"],
  ["tangmo-tangmo-tangmo", "Tangmo Tangmo Tangmo", ""]
]
export function studioGames(lang: Locale): Game[] {
  return titles.map(([slug, title, id], sortOrder) => ({
    slug,
    title: slug === "tangmo-tangmo-tangmo" && lang === "th" ? "แตงโม แตงโม แตงโม" : title,
    lang,
    sortOrder,
    status: slug === "tangmo-tangmo-tangmo" ? "in_development" : "published",
    tagline: "",
    description: "",
    year: null,
    priceThb: null,
    preorderOpen: false,
    preorderCloses: null,
    coverImage: null,
    shopUrl: null,
    rulebookUrl: null,
    pnpUrl: null,
    bggUrl: id ? "https://boardgamegeek.com/boardgame/" + id + "/" + slug : null
  }))
}
export function safeLink(value: string | null) {
  if (!value) return null
  try {
    const url = new URL(value)
    return ["https:", "http:"].includes(url.protocol) ? url.href : null
  } catch {
    return null
  }
}
export function artwork(game: Game) {
  if (bggGame(game.slug)) return "/art/" + game.slug + "-bgg.webp"
  if (game.slug === "tangmo-tangmo-tangmo") return "/art/tangmo-tangmo-tangmo.png"
  return (
    safeLink(game.coverImage) ||
    (titles.some(([slug]) => slug === game.slug)
      ? "/art/" + game.slug + ".webp"
      : "/art/hero.webp")
  )
}
export async function listGames(lang: Locale): Promise<Game[]> {
  const api = process.env.NEXT_PUBLIC_API_URL
  if (!api) return studioGames(lang)
  let games: Game[] = []
  for (let page = 1; ; page++) {
    const response = await fetch(
      api + "/games?lang=" + lang + "&pageSize=100&page=" + page,
      { cache: "no-store", signal: AbortSignal.timeout(8000) }
    )
    if (!response.ok) throw new Error("Catalog unavailable")
    const { data, meta } = (await response.json()) as {
      data: Game[]
      meta: { filtered: number }
    }
    games = games.concat(data)
    if (!data.length || games.length >= meta.filtered) return games
  }
}
export async function findGame(
  lang: Locale,
  slug: string
): Promise<Game | undefined> {
  const api = process.env.NEXT_PUBLIC_API_URL
  if (!api) return studioGames(lang).find((game) => game.slug === slug)
  const response = await fetch(
    api + "/games/" + encodeURIComponent(slug) + "?lang=" + lang,
    { cache: "no-store", signal: AbortSignal.timeout(8000) }
  )
  if (response.status === 404) return undefined
  if (!response.ok) throw new Error("Catalog unavailable")
  return response.json()
}
