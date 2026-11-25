import { Elysia } from "elysia"
import { rateLimit } from "../../lib/rate-limit.js"
import { authPlugin } from "../auth/index.js"
import type { AuthUser } from "../auth/models.js"
import { requiredPermissions } from "../role/use-cases.js"
import { PreorderCreateModel, PreorderListModel, PreorderModel, PreorderUpdateStatusModel } from "./models.js"
import { CreatePreorder, GetMyPreorders, GetPreorderList, UpdatePreorderStatus } from "./use-cases.js"

export const preordersModule = new Elysia({ prefix: "/preorders" })
  .use(authPlugin)
  .post("/", async ({ body, user }) => await CreatePreorder.execute(user, body), {
    body: PreorderCreateModel.bodySchema,
    beforeHandle: [
      requiredPermissions(["preorders::create"]),
      rateLimit<{ user: AuthUser }>({ limit: 5, windowMs: 60_000, key: ({ user }) => user.id })
    ],
    response: { 200: PreorderModel.responseSchema },
    detail: {
      summary: "Create pre-order",
      description: "Signed in. The game must be open for pre-orders. Max 3 active per game.",
      tags: ["Preorder"]
    }
  })
  .get("/mine", async ({ user }) => await GetMyPreorders.execute(user.id), {
    beforeHandle: requiredPermissions(["preorders::read"]),
    response: { 200: PreorderListModel.mineResponseSchema },
    detail: { summary: "Get my pre-orders", tags: ["Preorder"] }
  })
  .get("/", async ({ query }) => await GetPreorderList.execute(query), {
    query: PreorderListModel.querySchema,
    beforeHandle: requiredPermissions(["preorders::manage"]),
    response: { 200: PreorderListModel.responseSchema },
    detail: {
      summary: "Get pre-order list",
      description: "Admin only. Filter by game, status, or search name, phone, email.",
      tags: ["Preorder"]
    }
  })
  .patch(
    "/:id/status",
    async ({ params, body, user }) => await UpdatePreorderStatus.execute(params.id, body, user),
    {
      params: PreorderModel.paramsSchema,
      body: PreorderUpdateStatusModel.bodySchema,
      beforeHandle: requiredPermissions(["preorders::manage"]),
      response: { 200: PreorderModel.responseSchema },
      detail: { summary: "Update pre-order status", description: "Admin only.", tags: ["Preorder"] }
    }
  )
