const requests = new Map<string, { count: number; until: number }>()
export async function POST(request: Request) {
  const { RESEND_API_KEY, CONTACT_FROM, CONTACT_TO, CONTACT_CLIENT_IP_HEADER } =
    process.env
  if (!RESEND_API_KEY || !CONTACT_FROM || !CONTACT_TO)
    return new Response(null, { status: 503 })
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return new Response(null, { status: 403 })
  const raw = await request.text()
  if (raw.length > 8000) return new Response(null, { status: 413 })
  let body
  try {
    body = JSON.parse(raw)
  } catch {
    return new Response(null, { status: 400 })
  }
  if (!body || typeof body !== "object")
    return new Response(null, { status: 422 })
  if (body.website) return new Response(null, { status: 204 })
  const { name, email, message } = body
  if (
    typeof name !== "string" ||
    !name.trim() ||
    name.length > 120 ||
    typeof email !== "string" ||
    email.length > 254 ||
    !/^\S+@\S+\.\S+$/.test(email) ||
    typeof message !== "string" ||
    !message.trim() ||
    message.length > 3000
  )
    return new Response(null, { status: 422 })
  const now = Date.now(),
    ip =
      (CONTACT_CLIENT_IP_HEADER &&
        request.headers.get(CONTACT_CLIENT_IP_HEADER)) ||
      "shared"
  for (const [key, entry] of requests)
    if (entry.until <= now) requests.delete(key)
  const entry = requests.get(ip) ?? { count: 0, until: now + 60000 }
  if (entry.count >= 3) return new Response(null, { status: 429 })
  entry.count++
  requests.set(ip, entry)
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + RESEND_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: CONTACT_FROM,
        to: [CONTACT_TO],
        reply_to: email,
        subject: "Round Table Games portfolio enquiry",
        text: name + "\n" + email + "\n\n" + message
      }),
      signal: AbortSignal.timeout(10000)
    })
    return new Response(null, { status: r.ok ? 204 : 502 })
  } catch {
    return new Response(null, { status: 502 })
  }
}
