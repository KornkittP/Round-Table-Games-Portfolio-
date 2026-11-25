import { existsSync } from "node:fs"
import { resolve } from "node:path"

/** Load the repo-root .env (existing variables win). No-op when the file is missing. */
export function loadEnv() {
  const file = resolve(import.meta.dir, "../../../.env")
  if (existsSync(file)) process.loadEnvFile(file)
}
