import { preorderSelectSchema } from "@repo/database"
import z from "zod"

export namespace PreorderUpdateStatusModel {
  export const bodySchema = z.object({
    status: z.enum(preorderSelectSchema.shape.status.options)
  })

  export type Body = z.infer<typeof bodySchema>
}
