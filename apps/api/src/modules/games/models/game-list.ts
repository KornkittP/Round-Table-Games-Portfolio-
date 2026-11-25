import { gameSelectSchema } from "@repo/database"
import z from "zod"
import type { ListResponseSchema } from "../../libs/types.js"
import { GameModel } from "./game.js"

export namespace GameListModel {
  export const querySchema = z.object({
    page: z.coerce.number().min(1).default(1).catch(1),
    pageSize: z.coerce.number().min(1).max(100).default(20).catch(20),
    search: z.coerce.string().nullable().optional(),
    status: z
      .string()
      .transform((val) => val?.split("|"))
      .pipe(z.array(z.enum(gameSelectSchema.shape.status.options)))
      .optional(),
    preorderOpen: z.enum(["true", "false"]).transform((v) => v === "true").optional(),
    lang: GameModel.langSchema.optional().catch(undefined)
  })

  export const responseSchema = z.object({
    data: z.array(GameModel.responseSchema),
    meta: z.object({
      total: z.number().default(0),
      filtered: z.number().default(0)
    })
  }) satisfies z.ZodType<ListResponseSchema>

  export type Query = z.infer<typeof querySchema>
  export type Response = z.infer<typeof responseSchema>
}
