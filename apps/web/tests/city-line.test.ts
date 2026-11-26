import { expect, test } from "bun:test"
import { cards } from "../lib/city-line/cards"
import { forcedScoring, legalFaces, place, scores, sideScore, startGame, type Game } from "../lib/city-line/engine"

test("setup shuffles nine distinct cards and randomizes the initial scoring orientation", () => {
  const a = startGame(() => 0), b = startGame(() => .99)
  expect(new Set([a.board[0].id, ...a.deck]).size).toBe(9)
  expect(a.deck).not.toEqual(b.deck)
  expect(a.board[0].rotated).not.toBe(b.board[0].rotated)
  expect(a.board[0].face).toBe("scoring")
})

test("all legal face sequences finish with six views and three conditions", () => {
  function visit(game: Game) {
    const legal = legalFaces(game)
    if (!game.deck.length) {
      expect(game.board.filter(p => p.face === "city")).toHaveLength(6)
      expect(game.board).toHaveLength(9)
      expect(legal).toEqual([])
      expect(() => place(game, "city", false)).toThrow()
      return
    }
    expect(legal.length).toBeGreaterThan(0)
    if (forcedScoring(game)) {
      expect(legal).toEqual(["scoring"])
      expect(() => place(game, "city", false)).toThrow()
    }
    for (const face of legal) visit(place(game, face, true))
  }
  visit(startGame())
})

test("voluntary scoring can precede or follow the forced draw", () => {
  let early = place(startGame(), "scoring", false)
  expect(() => place(early, "scoring", true)).toThrow()
  let late = startGame()
  for (let i = 0; i < 3; i++) {
    early = place(early, "city", false)
    late = place(late, "city", true)
  }
  expect(legalFaces(early)).toEqual(["scoring"])
  expect(legalFaces(late)).toEqual(["scoring"])
  expect(legalFaces(place(early, "scoring", false))).toEqual(["city"])
  expect(legalFaces(place(late, "scoring", true))).toContain("scoring")
})

test("two dogs on sand and two grass spaces elsewhere earn six, independently of other conditions", () => {
  const views = [cards[1].views[1], cards[1].views[1], cards[4].views[1]]
  expect(sideScore(views, [cards[6].conditions[1]])).toBe(6)
  expect(sideScore(views, [cards[6].conditions[1], cards[4].conditions[1]])).toBe(10)
  expect(sideScore([cards[1].views[1]], [cards[4].conditions[0]])).toBe(4)
})

test("identical pairs, base flowers and bonus flowers use their printed values", () => {
  expect(sideScore([cards[0].views[0]], [cards[1].conditions[0]])).toBe(2)
  expect(sideScore([cards[2].views[0]], [cards[1].conditions[0]])).toBe(2)
  expect(sideScore([cards[0].views[1]], [cards[8].conditions[0]])).toBe(4)
})

test("rotating the card swaps sides and zero gap is possible", () => {
  const board = [{ id: 1, face: "city" as const, rotated: false }]
  expect(scores({ deck: [], board })).toEqual({ north: 0, south: 2, gap: 2 })
  expect(scores({ deck: [], board: [...board, {...board[0], rotated:true}] })).toEqual({north:2,south:2,gap:0})
})
