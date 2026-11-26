import { Translations } from "@/components/Translations"
import { ContactAccounts } from "@/components/ContactAccounts"
import { Resume } from "@/components/Profile"
import { bggGame } from "@/lib/bgg"
import { editions } from "@/lib/editions"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Database, PanelsTopLeft, Workflow, Printer } from "lucide-react"
import { CityLineSolo } from "@/components/CityLineSolo"
import { GameResources } from "@/components/GameResources"
import { materials } from "@/lib/game-materials"
import { Home } from "@/components/Home"
import { GameBrowser, Shelf } from "@/components/Shelf"
import { Contact } from "@/components/Contact"
import { Reservations } from "@/components/Reservations"
import {
  artwork,
  canReserve,
  findGame,
  listGames,
  safeLink
} from "@/lib/catalog"
import { isLocale, messages, repository } from "@/lib/locale"
type Props = { params: Promise<{ locale: string; path?: string[] }> }
export const dynamic = "force-dynamic"
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, path = [] } = await params
  if (!isLocale(locale)) return {}
  const t = messages[locale],
    key = path[0],
    suffix = path.length ? "/" + path.map(encodeURIComponent).join("/") : ""
  const game =
    key === "games" && path[1] ? await findGame(locale, path[1]) : undefined
  const title =
    (game
      ? (path[2] === "preorder" ? t.order + " · " : "") + game.title
      : (
          {
            games: t.games,
            translations: t.translations,
            about: t.about,
            contact: t.contact,
            "print-and-play": t.pnp,
            engineering: t.engineering,
            account: t.account
          } as Record<string, string>
        )[key] || t.studioLabel) + " | Round Table Games"
  return {
    metadataBase: new URL(process.env.SITE_URL || "http://localhost:3000"),
    title,
    description: game?.tagline || t.intro,
    alternates: {
      canonical: "/" + locale + suffix,
      languages: { en: "/en" + suffix, th: "/th" + suffix }
    },
    openGraph: { title, images: [game ? artwork(game) : "/art/hero.webp"] },
    robots:
      key === "account" || path[2] === "preorder" ? { index: false } : undefined
  }
}
export default async function Page({ params }: Props) {
  const { locale: lang, path = [] } = await params
  if (!isLocale(lang)) notFound()
  const t = messages[lang],
    base = "/" + lang,
    thai = lang === "th",
    route = path.join("/")
  if (!route) return <Home lang={lang} games={await listGames(lang)} />
  if (route === "translations") return <Translations lang={lang} />
  if (route === "games")
    return <Shelf lang={lang} games={await listGames(lang)} standalone />
  if (
    path[0] === "games" &&
    path[1] &&
    (path.length === 2 || (path.length === 3 && path[2] === "preorder"))
  ) {
    const g = await findGame(lang, path[1])
    if (!g) notFound()
    const open = canReserve(g),
      href = base + "/games/" + encodeURIComponent(g.slug)
    if (path.length === 3)
      return (
        <section className="wrap inside narrow">
          <Link href={href}>{g.title}</Link>
          <h1>{t.order}</h1>
          <h2>{g.title}</h2>
          {g.priceThb !== null && (
            <p>
              {new Intl.NumberFormat(lang, {
                style: "currency",
                currency: "THB"
              }).format(g.priceThb)}
            </p>
          )}
          {open ? (
            <Reservations lang={lang} slug={g.slug} />
          ) : (
            <p>{t.closed}</p>
          )}
        </section>
      )
    const edition = editions[g.slug]
    const bgg = bggGame(g.slug)
    const description = bgg ? (thai ? edition.th : bgg.description) :
      g.description && g.description !== "Details coming soon."
        ? g.description
        : edition?.[lang]
    const links = [
      [g.shopUrl, t.shop],
      [g.rulebookUrl, t.rulebook],
      [g.pnpUrl, t.downloads],
      [g.bggUrl, "BoardGameGeek"]
    ]
    return (
      <section className="wrap inside">
        <Link href={base + "/games"}>{t.collection}</Link>
        <div className="detail">
          <div className="cover">
            <Image
              src={artwork(g)}
              alt={g.title}
              width={1000}
              height={667}
              unoptimized={!!g.coverImage}
            />
            {bgg && <small><a target="_blank" rel="noopener noreferrer" href={g.bggUrl || "https://boardgamegeek.com/boardgame/" + bgg.id}>{thai ? "ภาพปกและข้อมูลจาก BoardGameGeek" : "Cover and game data from BoardGameGeek"}</a></small>}
            {!bgg && !g.coverImage && g.slug === "possessed" && <small>{t.art}</small>}
          </div>
          <div>
            <small className="label">{t[g.status]}</small>
            <h1>
              {g.title}
              <i>.</i>
            </h1>
            <p>{t.by}</p>
            {g.tagline && <p>{g.tagline}</p>}
            {description?.split(/\n+/).filter(Boolean).map((paragraph,i)=><p key={i}>{paragraph}</p>)}
            {bgg && <section className="bggFacts"><h2>BoardGameGeek</h2><dl>
              <dt>{thai ? "คะแนนผู้เล่น" : "Community rating"}</dt><dd>{bgg.votes ? bgg.rating.toFixed(1)+" / 10" : "—"} ({bgg.votes} {thai?"คะแนนโหวต":"ratings"})</dd>
              <dt>{thai?"ความซับซ้อน":"Complexity weight"}</dt><dd>{bgg.weight ? bgg.weight.toFixed(2)+" / 5" : "—"}</dd>
              <dt>{thai?"กลไกเกม":"Mechanisms"}</dt><dd>{bgg.mechanics.join(" · ")}</dd>
              <dt>{thai?"หมวดหมู่":"Categories"}</dt><dd>{bgg.categories.join(" · ")}</dd></dl>
              <small>{thai?"ตรวจสอบข้อมูลเมื่อ":"Snapshot checked"} {new Intl.DateTimeFormat(lang,{dateStyle:"long",timeZone:"UTC"}).format(new Date(bgg.checked))}</small>
            </section>}
            {edition && (
              <p>
                {edition.players} {thai ? "คน" : "players"} · {edition.minutes}{" "}
                {thai ? "นาที" : "min"} · {thai ? "อายุ" : "Ages"} {edition.age}
              </p>
            )}
            {(g.year || edition) && (
              <p>
                {t.year} · {g.year ?? edition.year}
              </p>
            )}
            {g.priceThb !== null && (
              <p>
                {t.price} ·{" "}
                {new Intl.NumberFormat(lang, {
                  style: "currency",
                  currency: "THB"
                }).format(g.priceThb)}
              </p>
            )}
            {g.preorderCloses && (
              <p>
                {t.ends} ·{" "}
                {new Intl.DateTimeFormat(lang, {
                  dateStyle: "long",
                  timeZone: "Asia/Bangkok"
                }).format(new Date(g.preorderCloses))}
              </p>
            )}
            <div className="actions">
              {open && (
                <Link className="btn primary" href={href + "/preorder"}>
                  {t.order}
                </Link>
              )}
              {links.map(
                ([u, label]) =>
                  safeLink(u) && (
                    <a target="_blank" rel="noopener noreferrer" className="btn" key={label} href={safeLink(u)!}>
                      {label}
                    </a>
                  )
              )}
            </div>
          </div>
        </div>
        {g.slug === "city-line" && <CityLineSolo lang={lang} />}
        <GameResources slug={g.slug} lang={lang} printAndPlay={g.status === "print_and_play"} externalPack={!!safeLink(g.pnpUrl)} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Game",
              name: g.title,
              author: { "@type": "Person", name: "Kornkitt Poolsup" },
              inLanguage: lang,
              ...(g.bggUrl ? { sameAs: g.bggUrl } : {})
            }).replace(/</g, "\\u003c")
          }}
        />
      </section>
    )
  }
  if (route === "account") {
    const games = await listGames(lang)
    return (
      <section className="wrap inside narrow">
        <h1>
          {t.account}
          <i>.</i>
        </h1>
        <Reservations
          lang={lang}
          titles={Object.fromEntries(games.map((g) => [g.slug, g.title]))}
        />
      </section>
    )
  }
  if (route === "print-and-play") {
    const games = (await listGames(lang)).filter(
      (g) => materials[g.slug]?.printFiles?.length || g.pnpUrl || g.status === "print_and_play"
    )
    return (
      <section className="wrap inside">
        <Printer size={38} />
        <h1>
          {t.pnp}
          <i>.</i>
        </h1>
        <p>{t.pnpIntro}</p>
        {games.length ? (
          <GameBrowser games={games} lang={lang} downloads />
        ) : (
          <div className="panel">
            <p>{t.noDownloads}</p>
            <Link href={base + "/games"}>{t.explore}</Link>
          </div>
        )}
      </section>
    )
  }
  if (route === "about")
    return (
      <section className="wrap inside">
        <div className="detail">
          <div>
            <small className="label">{t.designer}</small>
            <h1>
              {thai ? "กรกิตติ์ พูลทรัพย์ (ตอง)" : "Kornkitt Poolsup (Tong)"}<i>.</i>
            </h1>
            <p>{t.bio}</p><p>{thai ? "ผมแปลบอร์ดเกมจากภาษาอังกฤษเป็นไทย เช่น The Quest for El Dorado, Dracula vs Van Helsing, Unstable Unicorns และ Here to Slay นอกโต๊ะเกมผมเล่าเรื่องหนังสือผ่านเพจอ่านเอง และเผยแพร่งานเขียนบน readAwrite" : "I also translate board games from English into Thai, including The Quest for El Dorado, Dracula vs Van Helsing, Unstable Unicorns and Here to Slay. Away from the game table, I talk about books as อ่านเอง (@readitmyself) and publish writing on readAwrite."}</p>
            <div className="actions">
              <Link className="btn primary" href={base + "/games"}>
                {t.explore}
              </Link>
              <Link className="btn" href={base + "/translations"}>{t.translations}</Link>
              <Link className="btn" href={base + "/engineering"}>
                {t.engineering}
              </Link>
            </div>
          </div>
          <Image
            className="portraitArt"
            src="/art/tong-portrait.webp"
            width={900}
            height={900}
            alt={thai ? "กรกิตติ์ พูลทรัพย์ (ตอง)" : "Kornkitt Poolsup (Tong)"}
          />
        </div>
      </section>
    )
  if (route === "engineering")
    return (
      <section className="wrap inside">
        <small className="label">{thai ? "กรกิตติ์ พูลทรัพย์ (ตอง)" : "Kornkitt Poolsup"}</small>
        <h1>
          {t.engineering}
          <i>.</i>
        </h1>
        <Resume lang={lang} /><h2>{thai?"การทำงานของเว็บไซต์":"How the portfolio works"}</h2><p>{t.engineeringIntro}</p>
        <div className="architecture">
          {[
            [
              PanelsTopLeft,
              "Next.js",
              thai
                ? "หน้าเกมสร้างบนเซิร์ฟเวอร์ตามภาษา ผู้เล่นลงชื่อเข้าใช้ด้วย Google ผ่าน Supabase Auth"
                : "Game pages render on the server in Thai or English. Players sign in with Google through Supabase Auth."
            ],
            [
              Workflow,
              "Bun + Elysia",
              thai
                ? "API ตรวจสอบโทเคนและข้อมูลการจอง รวมถึงช่วงเวลาเปิดรับจอง"
                : "The API verifies the bearer token, validates the reservation and checks the booking window."
            ],
            [
              Database,
              "Drizzle + PostgreSQL",
              thai
                ? "ธุรกรรมล็อกแถวเกมก่อนบันทึกการจอง ส่วน migration จะทำงานตามลำดับ"
                : "A transaction locks the game row before recording the reservation. Versioned migrations apply schema changes in order."
            ]
          ].map(([IconOrText, name, body]) => {
            const Icon = IconOrText as typeof Database
            return (
              <article className="panel" key={String(name)}>
                <Icon size={32} />
                <h2>{String(name)}</h2>
                <p>{String(body)}</p>
              </article>
            )
          })}
        </div>
        <div className="actions">
          <a target="_blank" rel="noopener noreferrer" className="btn primary" href={repository}>
            {t.source}
          </a>
          {safeLink(process.env.NEXT_PUBLIC_API_URL || null) && (
            <a target="_blank" rel="noopener noreferrer" className="btn" href={process.env.NEXT_PUBLIC_API_URL + "/docs"}>
              {t.apiDocs}
            </a>
          )}
        </div>
      </section>
    )
  if (route === "contact")
    return (
      <section className="wrap inside contactPage">
        <h1>
          {t.contact}
          <i>.</i>
        </h1>
        <p>{t.contactIntro}</p><ContactAccounts lang={lang}/>
        {process.env.RESEND_API_KEY &&
        process.env.CONTACT_FROM &&
        process.env.CONTACT_TO && (
          <Contact lang={lang} />
        )}
      </section>
    )
  notFound()
}
