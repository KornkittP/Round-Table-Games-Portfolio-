"use client"
import { useLocale } from "next-intl"
import { messages, type Locale } from "@/lib/locale"
export default function ErrorPage({ reset }: { reset: () => void }) {
  const t = messages[useLocale() as Locale]
  return (
    <section className="wrap inside">
      <h1>{t.unavailable}</h1>
      <button className="btn" onClick={reset}>
        {t.retry}
      </button>
    </section>
  )
}
