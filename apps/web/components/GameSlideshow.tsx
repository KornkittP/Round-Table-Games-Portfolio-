"use client"

import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react"
import { useEffect, useState } from "react"
import type { Locale } from "@/lib/locale"

type Slide = { slug: string; title: string; src: string }

export function GameSlideshow({ slides, lang }: { slides: Slide[]; lang: Locale }) {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const th = lang === "th"
  const count = slides.length
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => setPlaying(!motion.matches)
    sync()
    motion.addEventListener("change", sync)
    return () => motion.removeEventListener("change", sync)
  }, [])
  useEffect(() => {
    if (!playing || count < 2) return
    const timer = window.setInterval(() => {
      if (!document.hidden) setIndex(i => (i + 1) % count)
    }, 6000)
    return () => window.clearInterval(timer)
  }, [playing, count])
  if (!count) return null
  const position = index % count
  const slide = slides[position]
  function step(direction: number) {
    setPlaying(false)
    setIndex((position + direction + count) % count)
  }
  return <section className="heroArt" aria-label={th ? "สไลด์โชว์เกมของสตูดิโอ" : "Studio game slideshow"}>
    <div className="heroSlideImage">
      <Image key={slide.src} src={slide.src} alt={slide.title} fill priority={position === 0}
        unoptimized={/^https?:/.test(slide.src)} sizes="(max-width:760px) 94vw,52vw" />
    </div>
    <div className="heroSlideBar">
      <Link href={"/" + lang + "/games/" + slide.slug} aria-live={playing ? "off" : "polite"}>
        <small>{position + 1} / {count}</small> {slide.title}
      </Link>
      {count > 1 && <div className="heroSlideControls">
        <button type="button" onClick={() => step(-1)} aria-label={th ? "เกมก่อนหน้า" : "Previous game"}><ChevronLeft /></button>
        <button type="button" onClick={() => setPlaying(!playing)}
          aria-label={playing ? (th ? "หยุดสไลด์ชั่วคราว" : "Pause slideshow") : (th ? "เล่นสไลด์ต่อ" : "Play slideshow")}>
          {playing ? <Pause /> : <Play />}
        </button>
        <button type="button" onClick={() => step(1)} aria-label={th ? "เกมถัดไป" : "Next game"}><ChevronRight /></button>
      </div>}
    </div>
  </section>
}
