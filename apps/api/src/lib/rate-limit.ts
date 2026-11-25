import { status } from "elysia"

type Options<C> = {
  limit: number
  windowMs: number
  /** What to count requests by, for example the signed-in user id. */
  key: (context: C) => string
  now?: () => number
}

/**
 * Fixed-window rate limiter, used as a beforeHandle hook. In memory, so each API instance
 * counts separately; put a CDN or WAF rule in front of it for real abuse protection.
 */
export function rateLimit<C>({ limit, windowMs, key, now = Date.now }: Options<C>) {
  const hits = new Map<string, { count: number; resetAt: number }>()

  return (context: C) => {
    const t = now()
    if (hits.size > 10_000) {
      for (const [k, v] of hits) if (v.resetAt <= t) hits.delete(k)
    }
    const k = key(context)
    const hit = hits.get(k)
    if (!hit || hit.resetAt <= t) {
      hits.set(k, { count: 1, resetAt: t + windowMs })
      return
    }
    if (hit.count >= limit) throw status(429, "Too many requests, try again later")
    hit.count++
  }
}
