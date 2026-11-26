import { scores, type Face, type Game } from "./engine"

export type Difficulty = "easy" | "medium" | "hard"
export type Player = "human" | "bot"
type Move = { face: Face; rotated: boolean }

// Ignore the shared setup card. Each player places three cityscapes and one scoring card.
export function duelFaces(game: Game): Face[] {
  if (!game.deck.length) return []
  const mine = game.board.slice(1).filter((_, i) => i % 2 === (game.board.length - 1) % 2)
  if (mine.some(p => p.face === "scoring")) return ["city"]
  return mine.length === 3 ? ["scoring"] : ["city", "scoring"]
}

export function duelPlace(game: Game, move: Move): Game {
  if (!duelFaces(game).includes(move.face)) throw new Error("Illegal duel placement")
  return advance(game, move)
}

function advance(game: Game, move: Move): Game {
  return { deck: game.deck.slice(1), board: [...game.board, { id: game.deck[0], ...move }] }
}

export function winner(north: number, south: number, first: Player): Player {
  if (north === south) return first
  const botLeads = north > south
  return botLeads === (Math.abs(north - south) <= 5) ? "bot" : "human"
}

function moves(game: Game): Move[] {
  return duelFaces(game).flatMap(face => [{ face, rotated: false }, { face, rotated: true }])
}

function value(game: Game, first: Player) {
  const {north, south} = scores(game)
  const sign = winner(north, south, first) === "bot" ? 1 : -1
  if (!game.deck.length) return sign * 100
  const lead = north - south
  // Prefer a modest lead or a large deficit, away from a reversal at five points.
  const margin = Math.min(Math.abs(lead), Math.abs(Math.abs(lead) - 5.5))
  return sign * (1 + Math.min(5, margin))
}

function search(game: Game, first: Player, depth: number, botTurn: boolean, alpha: number, beta: number): number {
  if (!depth || !game.deck.length) return value(game, first)
  let best = botTurn ? -Infinity : Infinity
  for (const move of moves(game)) {
    const v = search(advance(game, move), first, depth - 1, !botTurn, alpha, beta)
    best = botTurn ? Math.max(best, v) : Math.min(best, v)
    if (botTurn) alpha = Math.max(alpha, best)
    else beta = Math.min(beta, best)
    if (alpha >= beta) break
  }
  return best
}

export function chooseBotMove(game: Game, first: Player, difficulty: Difficulty, random = Math.random): Move {
  const options = moves(game)
  if (!options.length) throw new Error("Game has ended")
  if (difficulty === "easy") return options[Math.floor(random() * options.length)]
  const totals = options.map(() => 0)
  const samples = difficulty === "hard" && game.deck.length > 2 ? 16 : 1
  for (let sample = 0; sample < samples; sample++) {
    // The drawn card is visible. Generate hypothetical orders from the remaining set.
    const unseen = game.deck.slice(1).sort((a,b) => a-b)
    for (let i = unseen.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1))
      ;[unseen[i], unseen[j]] = [unseen[j], unseen[i]]
    }
    const hypothetical = { board: game.board, deck: [game.deck[0], ...unseen] }
    options.forEach((move, i) => {
      const next = advance(hypothetical, move)
      totals[i] += difficulty === "medium" ? value(next, first) : search(next, first, 3, false, -Infinity, Infinity)
    })
  }
  const best = Math.max(...totals)
  const tied = options.filter((_, i) => totals[i] === best)
  return tied[Math.floor(random() * tied.length)]
}
