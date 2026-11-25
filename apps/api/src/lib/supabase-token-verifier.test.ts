import { describe, expect, it } from "bun:test"
import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT } from "jose"
import { SupabaseTokenVerifier } from "./supabase-token-verifier.js"

const ISSUER = "https://abc.supabase.co/auth/v1"
const SUB = "00000000-0000-4000-8000-000000000001"

async function setup() {
  const { publicKey, privateKey } = await generateKeyPair("ES256")
  const jwk = { ...(await exportJWK(publicKey)), kid: "k1", alg: "ES256", use: "sig" }
  const verifier = new SupabaseTokenVerifier(createLocalJWKSet({ keys: [jwk] }), ISSUER)
  const sign = (
    claims: Record<string, unknown> = {},
    opts: { iss?: string; aud?: string; exp?: string; key?: CryptoKey } = {}
  ) =>
    new SignJWT({ email: "a@b.co", ...claims })
      .setProtectedHeader({ alg: "ES256", kid: "k1" })
      .setSubject(SUB)
      .setIssuer(opts.iss ?? ISSUER)
      .setAudience(opts.aud ?? "authenticated")
      .setExpirationTime(opts.exp ?? "5m")
      .sign(opts.key ?? privateKey)
  return { verifier, sign }
}

describe("SupabaseTokenVerifier", () => {
  it("accepts a valid token and returns the claims", async () => {
    const { verifier, sign } = await setup()
    const token = await sign({ user_metadata: { full_name: "Tong" } })
    expect(await verifier.verify(token)).toEqual({ sub: SUB, email: "a@b.co", name: "Tong" })
  })

  it("rejects an expired token", async () => {
    const { verifier, sign } = await setup()
    expect(verifier.verify(await sign({}, { exp: "-1m" }))).rejects.toThrow()
  })

  it("rejects the wrong issuer and the wrong audience", async () => {
    const { verifier, sign } = await setup()
    expect(verifier.verify(await sign({}, { iss: "https://evil.example" }))).rejects.toThrow()
    expect(verifier.verify(await sign({}, { aud: "anon" }))).rejects.toThrow()
  })

  it("rejects a token signed by a different key", async () => {
    const { verifier, sign } = await setup()
    const other = await generateKeyPair("ES256")
    expect(verifier.verify(await sign({}, { key: other.privateKey }))).rejects.toThrow()
  })

  it("rejects a token with no email", async () => {
    const { verifier, sign } = await setup()
    expect(verifier.verify(await sign({ email: undefined }))).rejects.toThrow(/email/)
  })

  it("supports the legacy shared-secret (HS256) setup", async () => {
    const secret = new TextEncoder().encode("a-long-test-secret-of-at-least-32-bytes!!")
    const verifier = new SupabaseTokenVerifier(secret, ISSUER)
    const token = await new SignJWT({ email: "a@b.co" })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("u1")
      .setIssuer(ISSUER)
      .setAudience("authenticated")
      .setExpirationTime("5m")
      .sign(secret)
    expect((await verifier.verify(token)).sub).toBe("u1")
  })
})
