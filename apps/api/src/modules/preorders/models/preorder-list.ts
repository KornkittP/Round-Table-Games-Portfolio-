import { preorderSelectSchema } from "@repo/database"
import z from "zod"
import type { ListResponseSchema } from "../../libs/types.js"
import { PreorderModel } from "./preorder.js"

export namespace PreorderListModel {
  /** Admin list. */
  export const querySchema = z.object({
    page: z.coerce.number().min(1).default(1).catch(1),
    pageSize: z.coerce.number().min(1).max(10000).default(20).catch(20),
    search: z.coerce.string().nullable().optional(),
    game: z.string().optional(),
    status: z
      .string()
      .transform((val) => val?.split("|"))
      .pipe(z.array(z.enum(preorderSelectSchema.shape.status.options)))
      .optional()
  })

  export const responseSchema = z.object({
    data: z.array(
      PreorderModel.responseSchema.extend({
        userEmail: z.string(),
        userName: z.string().nullable(),
        gameTitle: z.string()
      })
    ),
    meta: z.object({
      total: z.number().default(0),
      filtered: z.number().default(0)
    })
  }) satisfies z.ZodType<ListResponseSchema>

  export const mineResponseSchema = z.array(PreorderModel.responseSchema)

  export type Query = z.infer<typeof querySchema>
  export type Response = z.infer<typeof responseSchema>
}
