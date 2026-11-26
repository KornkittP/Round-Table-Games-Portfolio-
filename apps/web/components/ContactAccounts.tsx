"use client"

import { useState } from "react"
import Image from "next/image"
import { ExternalLink } from "lucide-react"
import type { Locale } from "@/lib/locale"

const platforms = {
  facebook: "Facebook", tiktok: "TikTok", instagram: "Instagram",
  youtube: "YouTube", readawrite: "readAwrite", github: "GitHub"
}

type Account = {
  title: string
  detail: string
  initials: string
  photo?: string
  links: Partial<Record<keyof typeof platforms, string>>
}

function Avatar({ account }: { account: Account }) {
  const [failed, setFailed] = useState(false)
  return <span className="accountAvatar" aria-hidden="true">
    {account.photo && !failed
      ? <Image src={account.photo} alt="" width={68} height={68} onError={() => setFailed(true)} />
      : account.initials}
  </span>
}

export function ContactAccounts({ lang }: { lang: Locale }) {
  const th = lang === "th"
  const accounts: Account[] = [
    { title: "ReadItMyself (อ่านเอง)", detail: th ? "รีวิวหนังสือ" : "Book reviews",
      photo: "/contact/readitmyself.webp", initials: "อ",
      links: { tiktok: "https://www.tiktok.com/@readitmyself", facebook: "https://www.facebook.com/ReadItMyself",
        instagram: "https://www.instagram.com/readitmyself/", youtube: "https://www.youtube.com/@อ่านเอง-ดิ" } },
    { title: "Round Table Games", detail: th ? "สตูดิโอบอร์ดเกม" : "Board game studio",
      photo: "/art/studio-logo.png", initials: "RT", links: { facebook: "https://www.facebook.com/roundtablegames" } },
    { title: th ? "กรกิตติ์ พูลทรัพย์ (ตอง)" : "Kornkitt Poolsup (Tong)", detail: th ? "ผลงานซอฟต์แวร์" : "Software projects",
      photo: "/art/tong-portrait.webp", initials: "KP", links: { github: "https://github.com/KornkittP" } },
    { title: th ? "งานเขียนของตอง" : "Tong’s writing", detail: "readAwrite", initials: "KP",
      links: { readawrite: "https://www.readawrite.com/?action=user_page&user_id_publisher=4268109" } },
    { title: th ? "อีกเพจของตอง" : "Tong’s second page", detail: "Facebook", initials: "T",
      links: { facebook: "https://www.facebook.com/profile.php?id=61578105683557" } }
  ]
  return <div className="accountGrid">{accounts.map(account =>
    <article className="accountCard" key={account.title}>
      <div className="accountHeading"><Avatar account={account} />
        <div><h2>{account.title}</h2><p>{account.detail}</p></div>
      </div>
      <div className="platformLinks">{(Object.keys(account.links) as (keyof typeof platforms)[]).map(platform =>
        <a key={platform} href={account.links[platform]} target="_blank" rel="noopener noreferrer"
          aria-label={account.title+" · "+platforms[platform]+(th?" (เปิดแท็บใหม่)":" (opens in a new tab)")}>
          <Image src={"/contact/"+platform+".png"} width={21} height={21} alt="" />
          {platforms[platform]}<ExternalLink size={14} aria-hidden="true" />
        </a>
      )}</div>
    </article>
  )}</div>
}
