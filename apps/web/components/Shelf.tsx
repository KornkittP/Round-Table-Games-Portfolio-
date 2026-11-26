import { materials } from "@/lib/game-materials"
import { artwork, safeLink, type Game } from "@/lib/catalog"
import { messages, type Locale } from "@/lib/locale"
import { editions } from "@/lib/editions"
import { bggGame } from "@/lib/bgg"
import { CatalogBrowser } from "./CatalogBrowser"

export function GameBrowser({games,lang,downloads=false}:{games:Game[];lang:Locale;downloads?:boolean}) {
  const t=messages[lang]
  const groups={published:t.published,in_development:t.in_development,print_and_play:t.print_and_play}
  const items=games.map(game=>{
    const edition=editions[game.slug]
    const [minPlayers,maxPlayers=minPlayers]=edition?.players.split(/[–-]/).map(Number) ?? []
    const download=downloads && safeLink(game.pnpUrl)
    return {id:game.slug,title:game.title,groups:(game.pnpUrl || materials[game.slug]?.printFiles?.length) && game.status!=="print_and_play" ? [game.status,"print_and_play"] : [game.status],
      year:game.year ?? edition?.year,minPlayers,maxPlayers,rating:bggGame(game.slug)?.rating,
      href:"/"+lang+"/games/"+encodeURIComponent(game.slug),cover:artwork(game),
      extraLink:download ? {href:download,label:t.downloads}:undefined}
  })
  return <CatalogBrowser items={items} groups={groups} lang={lang}/>
}

export function Shelf({games,lang,standalone=false}:{games:Game[];lang:Locale;standalone?:boolean}) {
  const t=messages[lang], Heading=standalone?"h1":"h2"
  return <section className="shelf wrap" id="shelf">
    <Heading>{t.collection}<i>.</i></Heading><p>{t.shelfSub}</p>
    <GameBrowser games={games} lang={lang}/>
  </section>
}
