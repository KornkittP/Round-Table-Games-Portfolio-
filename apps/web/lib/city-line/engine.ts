import { cards, type Condition, type SymbolName, type View } from "./cards"

export type Face = "city" | "scoring"
export type Placement = { id: number; face: Face; rotated: boolean }
export type Game = { deck: readonly number[]; board: readonly Placement[] }

export function startGame(random = Math.random): Game {
  const deck = cards.map((_, i) => i + 1)
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  const [first, ...rest] = deck
  return { deck: rest, board: [{ id: first, face: "scoring", rotated: random() < 0.5 }] }
}

export function forcedScoring(game: Game) {
  return game.board.at(-1)?.face === "city" && game.board.filter(p => p.face === "city").length === 3
}

export function legalFaces(game: Game): Face[] {
  if (!game.deck.length) return []
  const cities = game.board.filter(p => p.face === "city").length
  if (forcedScoring(game) || cities === 6) return ["scoring"]
  // Before the third city, reserve a scoring slot for the mandatory draw.
  const scoringLimit = cities < 3 ? 2 : 3
  return game.board.length - cities >= scoringLimit ? ["city"] : ["city", "scoring"]
}

export function place(game: Game, face: Face, rotated: boolean): Game {
  if (!legalFaces(game).includes(face)) throw new Error("Illegal placement")
  return { deck: game.deck.slice(1), board: [...game.board, { id: game.deck[0], face, rotated }] }
}

export function sideScore(views: View[], conditions: Condition[]) {
  const count = new Map<SymbolName, number>()
  for (const view of views) {
    for (const symbol of [...view.characters, ...view.terrain]) count.set(symbol, (count.get(symbol) ?? 0) + 1)
    count.set("flower", (count.get("flower") ?? 0) + view.flowers)
  }
  const tally = (s: SymbolName) => count.get(s) ?? 0
  let score = tally("flower")
  for (const {points, symbols: [first, second]} of conditions) {
    let matches = tally(first)
    if (second === first) matches = Math.floor(matches / 2)
    else if (second) matches = Math.min(matches, tally(second))
    score += points * matches
  }
  return score
}

export function scores(game: Game) {
  const totals = [0, 1].map(side => {
    const views: View[] = [], conditions: Condition[] = []
    for (const p of game.board) {
      const facing = p.rotated ? 1 - side : side
      const card = cards[p.id - 1]
      if (p.face === "city") views.push(card.views[facing])
      else conditions.push(card.conditions[facing])
    }
    return sideScore(views, conditions)
  })
  return { north: totals[0], south: totals[1], gap: Math.abs(totals[0] - totals[1]) }
}
