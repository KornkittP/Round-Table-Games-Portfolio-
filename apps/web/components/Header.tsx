"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import Image from "next/image"
import { Globe2, UserRound, Menu, X } from "lucide-react"
import { messages, switchLocale, type Locale } from "@/lib/locale"
export function Brand() {
  return (
    <span className="brand">
      <Image src="/art/studio-logo.png" width={46} height={52} alt="" />
      <b>
        Round Table
        <br />
        Games<span>.</span>
      </b>
    </span>
  )
}
export function Header({ lang }: { lang: Locale }) {
  const t = messages[lang],
    path = usePathname(),
    base = "/" + lang
  const [open, setOpen] = useState(false)
  const links = [
    ["", t.home],
    ["/games", t.games],
    ["/translations", t.translations],
    ["/print-and-play", t.pnp],
    ["/about", t.about],
    ["/engineering", t.engineering],
    ["/contact", t.contact]
  ]
  return (
    <header>
      <div className="wrap bar">
        <Link href={base} aria-label="Round Table Games">
          <Brand />
        </Link>
        <nav className={open ? "visible" : ""} aria-label={t.menu}>
          {links.map(([href, title]) => (
            <Link
              key={href}
              aria-current={
                (href ? path.startsWith(base + href) : path === base)
                  ? "page"
                  : undefined
              }
              href={base + href}
              onClick={() => setOpen(false)}
            >
              {title}
            </Link>
          ))}
        </nav>
        <div className="tools">
          <Link
            className="lang"
            href={switchLocale(path, lang === "th" ? "en" : "th")}
            hrefLang={lang === "th" ? "en" : "th"}
          >
            <Globe2 size={16} />
            {lang === "th" ? "EN" : "ไทย"}
          </Link>
          <Link
            className="icon"
            href={base + "/account"}
            aria-label={t.account}
          >
            <UserRound size={18} />
          </Link>
          <button
            className="icon mobile"
            aria-label={t.menu}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  )
}
