import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from "jose"
import { Env } from "./env.js"

export type AuthClaims = {
  /** Supabase auth user id. */
  sub: string
  email: string
  name?: string
}

export type KeySource = JWTVerifyGetKey | Uint8Array

/** Verifies Supabase-issued access tokens: signature, issuer, audience and expiry. */
export class SupabaseTokenVerifier {
  constructor(
    private readonly key: KeySource,
    private readonly issuer: string
  ) {}

  /** Legacy shared secret if SUPABASE_JWT_SECRET is set, otherwise the project's public JWKS. */
  static fromEnv(): SupabaseTokenVerifier {
    const root = Env.supabaseUrl()
    const secret = process.env.SUPABASE_JWT_SECRET
    const key: KeySource = secret
      ? new TextEncoder().encode(secret)
      : createRemoteJWKSet(new URL(`${root}/auth/v1/.well-known/jwks.json`))
    return new SupabaseTokenVerifier(key, `${root}/auth/v1`)
  }

  async verify(token: string): Promise<AuthClaims> {
    const options = { issuer: this.issuer, audience: "authenticated" }
    const { payload } =
      typeof this.key === "function"
        ? await jwtVerify(token, this.key, options)
        : await jwtVerify(token, this.key, options)

    const email = typeof payload.email === "string" ? payload.email : undefined
    if (!payload.sub || !email) throw new Error("Token has no subject or email")

    const meta = (payload.user_metadata ?? {}) as Record<string, unknown>
    const name = [meta.full_name, meta.name].find((v) => typeof v === "string" && v) as
      | string
      | undefined
    return { sub: payload.sub, email, name }
  }
}
