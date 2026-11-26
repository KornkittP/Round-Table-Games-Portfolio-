import { expect, test } from "bun:test"
import { startGame, scores } from "../lib/city-line/engine"
import { chooseBotMove, duelFaces, duelPlace, winner, type Difficulty } from "../lib/city-line/duel"

test("a close lead wins, an excessive lead loses, and the starting player wins a tie", () => {
  expect(winner(15,10,"human")).toBe("bot")
  expect(winner(16,10,"bot")).toBe("human")
  expect(winner(10,16,"human")).toBe("bot")
  expect(winner(10,15,"bot")).toBe("human")
  for (const first of ["bot","human"] as const) expect(winner(10,10,first)).toBe(first)
})

test("each player independently owes one scoring card", () => {
  let g = startGame()
  for (let i=0;i<6;i++) g=duelPlace(g,{face:"city",rotated:false})
  for (let i=0;i<2;i++) {
    expect(duelFaces(g)).toEqual(["scoring"])
    expect(()=>duelPlace(g,{face:"city",rotated:false})).toThrow()
    g=duelPlace(g,{face:"scoring",rotated:true})
  }
  expect(duelFaces(g)).toEqual([])
})

test("all three bots complete legal games and each player scores once", () => {
  for (const level of ["easy","medium","hard"] as Difficulty[]) {
    let g = startGame(() => .4)
    while (g.deck.length) g = duelPlace(g,chooseBotMove(g,"bot",level,()=>.3))
    for (const parity of [0,1]) {
      expect(g.board.slice(1).filter((p,i)=>i%2===parity && p.face==="scoring")).toHaveLength(1)
    }
  }
})

test("hard ignores the true order of unseen cards", () => {
  const g = startGame(() => .3)
  const other = {...g, deck:[g.deck[0], ...g.deck.slice(1).reverse()]}
  expect(chooseBotMove(g,"bot","hard",()=>.6)).toEqual(chooseBotMove(other,"bot","hard",()=>.6))
})

test("hard takes a winning last turn whenever one is available", () => {
  const wins = new Set<string>()
  for (let seed=1;seed<=150;seed++) {
    let x=seed
    const random=()=>((x=(Math.imul(x,1664525)+1013904223)>>>0)/4294967296)
    let g=startGame(random)
    while(g.deck.length>1) g=duelPlace(g,chooseBotMove(g,"human","easy",random))
    const results=[false,true].map(rotated=>scores(duelPlace(g,{face:duelFaces(g)[0],rotated})))
    if(results.some(s=>winner(s.north,s.south,"human")==="bot")){
      const s=scores(duelPlace(g,chooseBotMove(g,"human","hard",random)))
      expect(winner(s.north,s.south,"human")).toBe("bot")
      wins.add(s.north>s.south?"close lead":"opponent overshoots")
    }
  }
  expect(wins.size).toBe(2)
})
