import { preorderSelectSchema } from "@repo/database"
import z from "zod"

export namespace PreorderModel {
  export const paramsSchema = z.object({ id: z.uuid() })

  export const responseSchema = z.object(preorderSelectSchema.shape).pick({
    id: true,
    gameSlug: true,
    name: true,
    phone: true,
    address: true,
    quantity: true,
    notes: true,
    status: true,
    createdAt: true,
    updatedAt: true
  })

  export type Response = z.infer<typeof responseSchema>
}
