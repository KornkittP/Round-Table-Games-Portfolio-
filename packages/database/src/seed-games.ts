import type { Db } from "./client.js"
import { games, type NewGame } from "./schema/index.js"

const base = {
  status: "published",
  taglineEn: "A board game by Round Table Games",
  descriptionEn: "Details coming soon."
} as const

export const SEED_GAMES: NewGame[] = [
  { ...base, slug: "possessed", titleEn: "Possessed", sortOrder: 1 },
  {
    ...base,
    slug: "potato-tomato",
    titleEn: "Potato Tomato",
    bggUrl: "https://boardgamegeek.com/boardgame/420700/potato-tomato",
    sortOrder: 2
  },
  {
    ...base,
    slug: "cat-avenue",
    titleEn: "Cat Avenue",
    bggUrl: "https://boardgamegeek.com/boardgame/376568/cat-avenue",
    sortOrder: 3
  },
  {
    ...base,
    slug: "city-line",
    titleEn: "City Line",
    bggUrl: "https://boardgamegeek.com/boardgame/435092/city-line",
    sortOrder: 4
  },
  { slug: "tangmo-tangmo-tangmo", titleEn: "Tangmo Tangmo Tangmo", titleTh: "แตงโม แตงโม แตงโม", status: "in_development", sortOrder: 5 },
  { slug: "neko-knows", titleEn: "NEKO KNOWS", status: "print_and_play", sortOrder: 6 }
]

/** Insert the starter games. Existing slugs are left alone, so later edits are never overwritten. */
export async function seedGames(db: Db): Promise<number> {
  const inserted = await db
    .insert(games)
    .values(SEED_GAMES)
    .onConflictDoNothing({ target: games.slug })
    .returning({ slug: games.slug })
  return inserted.length
}
