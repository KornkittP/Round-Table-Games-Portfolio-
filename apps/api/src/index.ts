import { cors } from "@elysiajs/cors"
import { openapi } from "@elysiajs/openapi"
import { closeDb, initDb } from "@repo/database"
import { Elysia } from "elysia"
import z from "zod"
import { Env } from "./lib/env.js"
import { gamesModule } from "./modules/games/index.js"
import { preordersModule } from "./modules/preorders/index.js"
import { userModule } from "./modules/user/index.js"

export const app = new Elysia()
  .use(cors({ origin: Env.corsOrigins() }))
  .use(
    openapi({
      path: "/docs",
      mapJsonSchema: { zod: z.toJSONSchema },
      documentation: {
        info: { title: "Round Table Games API", version: "0.1.0" },
        components: {
          securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } }
        },
        security: [{ bearerAuth: [] }]
      }
    })
  )
  .get("/health", () => ({ status: "ok" }), { detail: { tags: ["Health"] } })
  .use(gamesModule)
  .use(userModule)
  .use(preordersModule)

export type App = typeof app

if (import.meta.main) {
  initDb()
  app.listen(Env.port())
  console.log(`API on http://localhost:${Env.port()} (docs at /docs)`)
  process.on("SIGTERM", async () => {
    await app.stop()
    await closeDb()
    process.exit(0)
  })
}
