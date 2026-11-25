/** Environment helpers. Read lazily so tests can set variables first. */
export abstract class Env {
  static supabaseUrl(): string {
    const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!url) throw new Error("SUPABASE_URL is not set (see .env.example)")
    return url.replace(/\/+$/, "")
  }

  static corsOrigins(): string[] {
    return (process.env.CORS_ORIGIN ?? "http://localhost:3000").split(",").map((o) => o.trim())
  }

  static port(): number {
    return Number(process.env.PORT ?? 4000)
  }
}
