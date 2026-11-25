import { CatalogBrowser } from "./CatalogBrowser"
import Image from "next/image"
import catalog from "@/lib/translations.json"
import type { Locale } from "@/lib/locale"

export function Translations({ lang }: { lang: Locale }) {
  const thai = lang === "th"
  const groups = {community: thai ? "งานแปลแจกฟรี" : "Free translations", wdg: thai ? "งานแปลให้ Well Designed Games" : "Well Designed Games"}
  const items = catalog.map(game => ({
    id:String(game.id), title:thai && game.thai ? game.thai : game.title,
    subtitle:thai && game.thai ? game.title : game.thai,
    groups:[game.group], cover:game.cover, href:game.bgg, year:game.year,
    minPlayers:game.minPlayers, maxPlayers:game.maxPlayers,
    rating:game.rating,
    extraLink:game.resource ? {href:game.resource,label:thai ? "อ่านฉบับแปลไทย" : "Read Thai translation"} : undefined
  }))
  return (
    <section className="wrap inside translations">
      <div className="detail translationIntro">
        <div>
          <small className="label">{thai ? "กรกิตติ์ พูลทรัพย์ (ตอง)" : "Kornkitt Poolsup (Tong)"}</small>
          <h1>{thai ? "ผลงานแปล" : "Translations"}<i>.</i></h1>
          <p>{thai
            ? "ผมแปลบอร์ดเกมจากภาษาอังกฤษเป็นไทย ทั้งคู่มือที่ทำแจกให้เพื่อนนักเล่น และงานแปลเชิงพาณิชย์ให้ Well Designed Games (WDG)"
            : "I translate board games from English into Thai. This shelf brings together the translations I share freely with players and my commercial work for Well Designed Games (WDG)."}</p>
        </div>
        <Image className="translatorPhoto" src="/art/tong-bookshop.webp" width={900} height={900}
          alt={thai ? "ตองกับบอร์ดเกมที่แปลเป็นภาษาไทย" : "Tong with a selection of the games he translated into Thai"} />
      </div>
      <CatalogBrowser items={items} groups={groups} lang={lang}/>
    </section>
  )
}
