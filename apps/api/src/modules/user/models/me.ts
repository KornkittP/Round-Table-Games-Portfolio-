import { userSelectSchema } from "@repo/database"
import type z from "zod"

export namespace MeModel {
  export const responseSchema = userSelectSchema.pick({
    id: true,
    email: true,
    name: true,
    role: true
  })

  export type Response = z.infer<typeof responseSchema>
}
