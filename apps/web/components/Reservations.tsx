"use client"
import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { createClient, type Session } from "@supabase/supabase-js"
import { messages, type Locale } from "@/lib/locale"
import type { PreorderModel } from "../../api/src/modules/preorders/models/preorder"
const url = process.env.NEXT_PUBLIC_SUPABASE_URL,
  key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  api = process.env.NEXT_PUBLIC_API_URL
let client: ReturnType<typeof createClient> | undefined
function auth() {
  if (url && key && api && !client)
    client = createClient(url, key, { auth: { flowType: "pkce" } })
  return client
}
export function Reservations({
  lang,
  slug,
  titles = {}
}: {
  lang: Locale
  slug?: string
  titles?: Record<string, string>
}) {
  const t = messages[lang],
    [session, setSession] = useState<Session | null>(null),
    [ready, setReady] = useState(false)
  const [orders, setOrders] = useState<PreorderModel.Response[] | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [done, setDone] = useState(""),
    [retry, setRetry] = useState(0)
  const sending = useRef(false)
  useEffect(() => {
    const sub = auth()?.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      setReady(true)
    })
    if (!sub) setReady(true)
    return () => sub?.data.subscription.unsubscribe()
  }, [])
  useEffect(() => {
    if (!session || slug) return
    const controller = new AbortController()
    setOrders(null)
    setError("")
    fetch(api + "/preorders/mine", {
      headers: { Authorization: "Bearer " + session.access_token },
      signal: controller.signal,
      cache: "no-store"
    })
      .then(async (r) => {
        if (!r.ok) throw Error(r.status === 401 ? t.authError : t.unavailable)
        return r.json()
      })
      .then((data) => {
        if (!controller.signal.aborted) setOrders(data)
      })
      .catch((e) => {
        if (!controller.signal.aborted)
          setError(e.message === t.authError ? t.authError : t.unavailable)
      })
    return () => controller.abort()
  }, [session, slug, retry, t])
  if (!ready) return <p role="status">{t.loading}</p>
  if (!auth()) return <p className="notice">{t.unavailable}</p>
  if (!session)
    return (
      <div className="panel">
        <p>{t.authInfo}</p>
        <button
          className="btn primary"
          disabled={busy}
          onClick={async () => {
            setBusy(true)
            try {
              const result = await auth()!.auth.signInWithOAuth({
                provider: "google",
                options: { redirectTo: location.origin + location.pathname }
              })
              if (result.error) throw result.error
            } catch {
              setError(t.unavailable)
              setBusy(false)
            }
          }}
        >
          {t.signin}
        </button>
        <p role="alert">{error}</p>
      </div>
    )
  const logout = (
    <button
      className="textButton"
      onClick={async () => {
        const result = await auth()!.auth.signOut()
        if (result.error) setError(t.unavailable)
        else {
          setDone("")
          setOrders(null)
          setError("")
        }
      }}
    >
      {t.signout}
    </button>
  )
  if (!slug)
    return (
      <div className="panel">
        <div className="row">
          <h2>{t.orders}</h2>
          {logout}
        </div>
        {error ? (
          <p role="alert">
            {error}{" "}
            <button onClick={() => setRetry(retry + 1)}>{t.retry}</button>
          </p>
        ) : orders === null ? (
          <p>{t.loading}</p>
        ) : orders.length === 0 ? (
          <p>{t.noOrders}</p>
        ) : (
          orders.map((o) => (
            <article className="order" key={o.id}>
              <strong>{titles[o.gameSlug] ?? o.gameSlug}</strong>
              <p>
                {t.quantity} · {o.quantity}　
                {
                  t[
                    (
                      {
                        NEW: "new",
                        CONFIRMED: "confirmedStatus",
                        PAID: "paid",
                        SHIPPED: "shipped",
                        CANCELLED: "cancelled"
                      } as const
                    )[o.status]
                  ]
                }
              </p>
              <small>
                {new Intl.DateTimeFormat(lang, {
                  dateStyle: "long",
                  timeZone: "Asia/Bangkok"
                }).format(new Date(o.createdAt))}
              </small>
            </article>
          ))
        )}
      </div>
    )
  if (done)
    return (
      <div className="panel" role="status">
        <h2>{t.confirmed}</h2>
        <p>{done}</p>
        <Link href={"/" + lang + "/account"}>{t.orders}</Link>
      </div>
    )
  return (
    <form
      className="panel form"
      onSubmit={async (e) => {
        e.preventDefault()
        if (sending.current) return
        sending.current = true
        setBusy(true)
        setError("")
        const f = new FormData(e.currentTarget)
        try {
          const r = await fetch(api + "/preorders", {
            method: "POST",
            headers: {
              Authorization: "Bearer " + session.access_token,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              gameSlug: slug,
              name: f.get("name"),
              phone: f.get("phone"),
              address: f.get("address"),
              quantity: Number(f.get("quantity")),
              notes: f.get("notes")
            })
          })
          if (!r.ok) {
            setError(
              r.status === 401
                ? t.authError
                : r.status === 429
                  ? t.limit
                  : r.status === 400 || r.status === 409 || r.status === 403
                    ? t.conflict
                    : r.status === 422
                      ? t.failed
                      : t.unavailable
            )
            return
          }
          const data = await r.json()
          setDone(data.id)
        } catch {
          setError(t.unavailable)
        } finally {
          sending.current = false
          setBusy(false)
        }
      }}
    >
      <div className="row">
        <span>{session.user.email}</span>
        {
          <button
            type="button"
            onClick={async () => {
              if ((await auth()!.auth.signOut()).error) setError(t.unavailable)
            }}
          >
            {t.signout}
          </button>
        }
      </div>
      <label>
        {t.name}
        <input name="name" autoComplete="name" maxLength={120} required />
      </label>
      <label>
        {t.phone}
        <input
          name="phone"
          type="tel"
          autoComplete="tel"
          minLength={8}
          maxLength={20}
          required
        />
      </label>
      <label>
        {t.address}
        <textarea
          name="address"
          autoComplete="street-address"
          minLength={5}
          maxLength={500}
          required
        />
      </label>
      <label>
        {t.quantity}
        <input
          name="quantity"
          type="number"
          min={1}
          max={10}
          defaultValue={1}
          required
        />
      </label>
      <label>
        {t.notes}
        <textarea name="notes" maxLength={500} />
      </label>
      <label className="check">
        <input type="checkbox" required />
        {t.consent}
      </label>
      <button className="btn primary" disabled={busy}>
        {busy ? t.loading : t.submit}
      </button>
      {error && <p role="alert">{error}</p>}
    </form>
  )
}
