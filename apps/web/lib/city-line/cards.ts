export type Terrain = "water" | "grass" | "sand"
type Character = "boy" | "girl" | "dog" | "cat" | "duck"
export type SymbolName = Terrain | Character | "flower"
export type View = {
  characters: Character[]
  terrain: [Terrain, Terrain]
  flowers: number
}
export type Condition = { points: number; symbols: [SymbolName] | [SymbolName, SymbolName] }
type Card = { views: [View, View]; conditions: [Condition, Condition] }

// Top and bottom as printed on the web assets, before the player rotates a card.
const view = (characters: View["characters"], terrain: [Terrain, Terrain], flowers: number): View =>
  ({ characters, terrain, flowers })
const per = (points: number, ...symbols: Condition["symbols"]): Condition => ({ points, symbols })
export const cards: Card[] = [
  {
    views: [view(["boy","cat","dog","boy"], ["sand","water"], 0), view(["duck","girl","girl","cat"], ["water","grass"], 2)],
    conditions: [per(2,"girl","boy"), per(2,"dog","duck")]
  },
  {
    views: [view(["boy","cat","duck","boy"], ["grass","water"], 2), view(["girl","duck","dog","girl"], ["sand","sand"], 0)],
    conditions: [per(2,"boy","boy"), per(2,"duck","cat")]
  },
  {
    views: [view(["boy","girl","duck"], ["water","sand"], 2), view(["cat","girl","boy","dog"], ["sand","grass"], 0)],
    conditions: [per(2,"girl","girl"), per(2,"cat","dog")]
  },
  {
    views: [view(["boy","dog","duck","boy"], ["sand","water"], 0), view(["duck","girl","boy","cat"], ["grass","sand"], 2)],
    conditions: [per(2,"water"), per(2,"cat")]
  },
  {
    views: [view(["girl","dog","duck","boy"], ["water","sand"], 2), view(["duck","girl","boy","cat"], ["grass","grass"], 0)],
    conditions: [per(2,"sand"), per(2,"dog")]
  },
  {
    views: [view(["dog","boy","boy","duck"], ["sand","grass"], 2), view(["cat","girl","girl","dog"], ["grass","water"], 0)],
    conditions: [per(2,"grass"), per(2,"duck")]
  },
  {
    views: [view(["girl","dog","duck","boy"], ["grass","sand"], 0), view(["girl","cat","dog","girl"], ["water","grass"], 2)],
    conditions: [per(1,"girl"), per(3,"dog","grass")]
  },
  {
    views: [view(["girl","cat","dog","boy"], ["sand","grass"], 2), view(["duck","girl","boy","cat"], ["water","water"], 0)],
    conditions: [per(1,"boy"), per(3,"cat","sand")]
  },
  {
    views: [view(["duck","boy","girl","cat"], ["grass","water"], 0), view(["boy","cat","dog","girl"], ["water","sand"], 2)],
    conditions: [per(1,"flower"), per(3,"duck","water")]
  }
]

