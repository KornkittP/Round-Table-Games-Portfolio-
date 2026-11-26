import { GameSlideshow } from "./GameSlideshow"
import Link from "next/link"
import { Dices, Sparkles } from "lucide-react"
import { Shelf } from "./Shelf"
import { messages, type Locale } from "@/lib/locale"
import { artwork, type Game } from "@/lib/catalog"
export function Home({ lang, games }: { lang: Locale; games: Game[] }) {
  const t = messages[lang],
    base = "/" + lang
  const featured = games.find((g) => g.slug === "tangmo-tangmo-tangmo") ?? games[0]
  return (
    <>
      <section className="hero wrap">
        <div>
          <div className="eyebrow">
            <span />
            {t.studioLabel}
          </div>
          <h1>
            Round Table
            <br />
            <em>Games.</em>
          </h1>
          <p>{t.intro}</p>
          <div className="actions">
            <Link className="btn primary" href="#shelf">
              <Dices size={20} />
              {t.explore}
            </Link>
            <Link className="btn" href={base + "/about"}>
              {t.meet}
            </Link>
          </div>
        </div>
        <GameSlideshow lang={lang} slides={games.flatMap(game => {
          const src = artwork(game)
          return src === "/art/hero.webp" ? [] : [{ slug: game.slug, title: game.title, src }]
        })} />
      </section>
      <div className="shelfBand">
        <Shelf lang={lang} games={games} />
      </div>
      <section className="wrap news">
        <Sparkles size={30} />
        <div>
          <h2>{t.studioNote}</h2>
          <p>{lang === "th" ? "แตงโม แตงโม แตงโม เตรียมเปิดตัวเดือนธันวาคม 2569 ที่งาน Thailand Indy Board Game Market บิ๊กซี ราชดำริ ตรงข้ามเซ็นทรัลเวิลด์" : "Tangmo Tangmo Tangmo is planned for the Thailand Indy Board Game Market in December 2026 at Big C Ratchadamri, opposite CentralWorld."}</p>
          
        </div>
        {featured && (
          <Link className="feature" href={base + "/games/" + featured.slug}>
            <small>{t.feature}</small>
            <strong>{featured.title}</strong>
          </Link>
        )}
      </section>
    </>
  )
}
