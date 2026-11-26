"use client"

import { useEffect, useState } from "react"
import { cards, type SymbolName } from "@/lib/city-line/cards"
import { forcedScoring, legalFaces, place, scores, startGame, type Face, type Placement, type Game } from "@/lib/city-line/engine"
import { chooseBotMove, duelFaces, duelPlace, winner, type Player, type Difficulty } from "@/lib/city-line/duel"
import type { Locale } from "@/lib/locale"

const thaiNames: Record<SymbolName, string> = {
  boy: "เด็กชาย", girl: "เด็กหญิง", dog: "สุนัข", cat: "แมว", duck: "เป็ด",
  water: "น้ำ", sand: "ทราย", grass: "หญ้า", flower: "ดอกไม้"
}
function describe(p: Placement, lang: Locale) {
  const th = lang === "th"
  const name = (s: SymbolName) => th ? thaiNames[s] : s
  const card = cards[p.id - 1]
  return [0, 1].map(row => {
    const side = p.rotated ? 1 - row : row
    const label = row === 0 ? (th ? "ฝั่งบน" : "Top") : (th ? "ฝั่งล่าง" : "Bottom")
    if (p.face === "scoring") {
      const rule = card.conditions[side]
      return label + " · " + rule.points + (th ? " คะแนนต่อ " : " pts per ") + rule.symbols.map(name).join(" + ")
    }
    const view = card.views[side]
    return label + " · " + [...view.characters, ...view.terrain].map(name).join(", ") +
      " · " + view.flowers + (th ? " ดอก" : " flowers")
  })
}

function CardImage({ placement, lang }: { placement: Placement; lang: Locale }) {
  const { id, face, rotated } = placement
  return <img className={rotated ? "solo-rotated" : undefined}
    src={"/materials/city-line/cards/" + id + (face === "city" ? "f" : "b") + ".webp"}
    alt={describe(placement, lang).join(". ")} />
}

export function CityLineSolo({ lang }: { lang: Locale }) {
  const th = lang === "th"
  const [game, setGame] = useState<Game | null>(null)
  const [selection, setSelection] = useState<Face>("city")
  const [rotated, setRotated] = useState(false)
  const [duel, setDuel] = useState(false)
  const [difficulty, setDifficulty] = useState<Difficulty>("medium")
  const [first, setFirst] = useState<Player>("human")
  const botTurn = !!(duel && game?.deck.length && ((game.board.length % 2 === 1) === (first === "bot")))
  useEffect(() => {
    if (!botTurn || !game) return
    const timer = window.setTimeout(() => {
      setGame(duelPlace(game, chooseBotMove(game, first, difficulty)))
    }, 450)
    return () => window.clearTimeout(timer)
  }, [game, difficulty, first, botTurn])
  const legal = game ? (duel ? duelFaces(game) : legalFaces(game)) : []
  const face = legal.includes(selection) ? selection : legal[0]
  const current = !botTurn && game?.deck.length ? { id: game.deck[0], face, rotated } : null
  const score = game && scores(game)
  const finished = !!game && !game.deck.length

  function restart() {
    setFirst(Math.random() < .5 ? "human" : "bot")
    setGame(startGame())
    setSelection("city")
    setRotated(false)
  }
  function commit() {
    if (!game || !current) return
    setGame(duel ? duelPlace(game, current) : place(game, current.face, current.rotated))
    setSelection("city")
    setRotated(false)
  }

  return <section className="solo-game" id="solo" aria-labelledby="solo-heading">
    <h2 id="solo-heading">{th ? "เล่น City Line" : "Play City Line"}</h2>
    <div className="solo-controls" role="group" aria-label={th ? "โหมดเกม" : "Game mode"}>
      {[false,true].map(mode => <button key={String(mode)} className="btn" aria-pressed={duel === mode}
        onClick={() => { if (mode !== duel) { setGame(null); setDuel(mode) } }}>
        {mode ? (th ? "เล่นกับบอต" : "Play a bot") : (th ? "เล่นคนเดียว" : "Solo")}
      </button>)}
    </div>
    {duel ? <>
      <p>{th ? "คุณอยู่ฝั่งล่าง สลับกันวางวิวเมืองคนละสามใบและการ์ดคะแนนคนละหนึ่งใบ ถ้าคะแนนต่างกันไม่เกินห้า คนที่ได้มากกว่าชนะ ถ้าเกินห้า คนที่ได้น้อยกว่าชนะ ถ้าเสมอ คนเริ่มก่อนชนะ" :
        "You play the bottom side. Take turns placing three cityscapes and one scoring card each. Lead by up to five to win, or let the bot lead by six or more. The starting player wins ties."}</p>
      <label>{th ? "ความยาก" : "Difficulty"} <select value={difficulty} disabled={!!game && !finished}
        onChange={e => setDifficulty(e.target.value as Difficulty)}>
        <option value="easy">{th ? "ง่าย · สุ่มตาเดิน" : "Easy · random moves"}</option>
        <option value="medium">{th ? "ปานกลาง · คิดคะแนนตานี้" : "Medium · evaluates this turn"}</option>
        <option value="hard">{th ? "ยาก · วางแผนล่วงหน้า" : "Hard · plans ahead"}</option>
      </select></label>
    </> :
    <p>{th ? "วางการ์ดให้คะแนนสองฝั่งใกล้กันที่สุด ผลต่างคือคะแนนของคุณ ยิ่งน้อยยิ่งดี" :
      "Build both sides of the railway. Your score is the gap between them. Aim for zero."}</p>}
    {!game && <button className="btn primary" onClick={restart}>{th ? "เริ่มเกม" : "Start game"}</button>}
    {game && score && <>
      <div className="solo-score" role="status">
        <span>{duel ? (th ? "บอต · ฝั่งบน" : "Bot · Top") : (th ? "ฝั่งบน" : "Top")} <strong>{score.north}</strong></span>
        <span>{duel ? (th ? "คุณ · ฝั่งล่าง" : "You · Bottom") : (th ? "ฝั่งล่าง" : "Bottom")} <strong>{score.south}</strong></span>
        <span>{finished ? (th ? "ผลต่างสุดท้าย" : "Final gap") : (th ? "ผลต่าง" : "Gap")} <strong>{score.gap}</strong>
          {!duel && finished && score.gap === 0 && (th ? " · สมบูรณ์แบบ!" : " · Perfect!")}</span>
      </div>
      {duel && <p role="status">{finished
        ? (winner(score.north,score.south,first) === "human" ? (th ? "คุณชนะ!" : "You win!") : (th ? "บอตชนะ" : "Bot wins."))
        : (botTurn ? (th ? "บอตกำลังเลือกการ์ด…" : "Bot is choosing a move…") : (th ? "ตาของคุณ" : "Your turn."))}
        {" "}{first === "human" ? (th ? "คุณเริ่มก่อน" : "You went first.") : (th ? "บอตเริ่มก่อน" : "Bot went first.")}</p>}
      {current && <div className="solo-turn">
        <div className="solo-preview"><CardImage placement={current} lang={lang} /></div>
        <div>
          <h3>{th ? "การ์ดใบที่" : "Card"} {game.board.length + 1} / 9</h3>
          <p>{legal.length > 1 ? (th ? "เลือกหน้าการ์ดแล้วหมุนเพื่อจัดฝั่งก่อนวาง" : "Choose a face, then rotate to decide which side gets each half.") :
            !duel && forcedScoring(game) ? (th ? "หลังวิวเมืองใบที่สาม ต้องวางด้านคะแนน เลือกทิศได้" : "Third cityscape placed. This draw must score. Choose its orientation.") :
            (th ? "เหลือเพียงหน้าการ์ดที่เลือกได้ด้านเดียว" : "Only the enabled face fits the remaining slots.")}</p>
          <div className="solo-controls">
            {(["city","scoring"] as const).map(f => <button key={f} className="btn" disabled={!legal.includes(f)}
              aria-pressed={face === f} onClick={() => setSelection(f)}>
              {f === "city" ? (th ? "วิวเมือง" : "Cityscape") : (th ? "เงื่อนไขคะแนน" : "Scoring")}
            </button>)}
            <button className="btn" onClick={() => setRotated(!rotated)}>{th ? "หมุน 180°" : "Rotate 180°"}</button>
          </div>
          <div className="solo-description">{describe(current,lang).map(line => <p key={line}>{line}</p>)}</div>
          <button className="btn primary" onClick={commit}>{th ? "วางการ์ด" : "Place card"}</button>
        </div>
      </div>}
      <h3>{th ? "แนวรถไฟ" : "Your railway"}</h3>
      <ol className="solo-railway">{game.board.map(p => <li key={p.id}>
        <CardImage placement={p} lang={lang} />
      </li>)}</ol>
      <button className="btn" onClick={restart}>{finished ? (th ? "เล่นอีกครั้ง" : "Play again") : (th ? "เริ่มใหม่" : "Restart")}</button>
    </>}
  </section>
}
