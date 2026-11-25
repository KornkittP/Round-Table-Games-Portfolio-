import { status } from "elysia"
import { SupabaseTokenVerifier, type AuthClaims } from "../../../lib/supabase-token-verifier.js"

type Verifier = { verify(token: string): Promise<AuthClaims> }

export abstract class VerifyToken {
  private static verifier?: Verifier

  /** Replace the verifier, for example with a fake in tests. Call with no argument to reset. */
  static use(verifier?: Verifier) {
    this.verifier = verifier
  }

  static async execute(token: string): Promise<AuthClaims> {
    try {
      this.verifier ??= SupabaseTokenVerifier.fromEnv()
      return await this.verifier.verify(token)
    } catch {
      throw status(401, "Invalid or expired token")
    }
  }
}
