import type { MetadataRoute } from "next"
import { listGames } from "@/lib/catalog"
export const dynamic = "force-dynamic"
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.SITE_URL || "http://localhost:3000",
    games = await listGames("en")
  return [
    "",
    "/games",
    "/translations",
    "/about",
    "/print-and-play",
    "/engineering",
    "/contact",
    ...games.map((g) => "/games/" + encodeURIComponent(g.slug))
  ].flatMap((path) =>
    ["en", "th"].map((lang) => ({
      url: base + "/" + lang + path,
      alternates: {
        languages: { en: base + "/en" + path, th: base + "/th" + path }
      }
    }))
  )
}
