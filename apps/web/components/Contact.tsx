"use client"
import { useState } from "react"
import { messages, type Locale } from "@/lib/locale"
export function Contact({ lang }: { lang: Locale }) {
  const t = messages[lang],
    [busy, setBusy] = useState(false),
    [result, setResult] = useState("")
  return (
    <form
      className="form panel"
      onSubmit={async (e) => {
        e.preventDefault()
        const form = e.currentTarget
        setBusy(true)
        setResult("")
        try {
          const r = await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(Object.fromEntries(new FormData(form)))
          })
          setResult(
            r.ok
              ? t.sent
              : r.status === 429
                ? t.limit
                : r.status === 422
                  ? t.failed
                  : t.unavailable
          )
          if (r.ok) form.reset()
        } catch {
          setResult(t.unavailable)
        } finally {
          setBusy(false)
        }
      }}
    >
      <label>
        {t.name}
        <input name="name" required maxLength={120} autoComplete="name" />
      </label>
      <label>
        {t.email}
        <input
          name="email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
        />
      </label>
      <label>
        {t.message}
        <textarea name="message" required maxLength={3000} rows={6} />
      </label>
      <input
        name="website"
        className="trap"
        tabIndex={-1}
        aria-hidden="true"
        autoComplete="off"
      />
      <button className="btn primary" disabled={busy}>
        {busy ? t.loading : t.send}
      </button>
      <span role="status">{result}</span>
    </form>
  )
}
