import type { Locale } from "./locale"

export type BrowseItem = {
  id: string
  title: string
  subtitle?: string
  groups: string[]
  cover: string
  href: string
  extraLink?: { href: string; label: string }
  year?: number | null
  rating?: number | null
  minPlayers?: number
  maxPlayers?: number
}
export type SortField = "original" | "title" | "year" | "rating" | "maxPlayers"

export function browseItems(items: BrowseItem[], locale: Locale, group: string, players: number, field: SortField, ascending: boolean) {
  const visible = items.filter(item =>
    (!group || item.groups.includes(group)) &&
    (!players || (item.minPlayers != null && item.maxPlayers != null && item.minPlayers <= players && players <= item.maxPlayers))
  )
  if (field === "original") return visible
  const collator = new Intl.Collator(locale, { numeric: true, sensitivity: "base" })
  const direction = ascending ? 1 : -1
  return visible.sort((a, b) => {
    const byName = collator.compare(a.title, b.title)
    if (field === "title") return byName * direction
    const first = a[field], second = b[field]
    if (first == null || second == null) return first == null && second == null ? byName : first == null ? 1 : -1
    return (first - second) * direction || byName
  })
}
