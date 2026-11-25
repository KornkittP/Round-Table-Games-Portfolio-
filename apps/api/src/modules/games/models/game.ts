import { gameSelectSchema } from "@repo/database"
import z from "zod"
import { LANGS } from "../../libs/lang.js"

export namespace GameModel {
  export const langSchema = z.enum(LANGS)

  export const paramsSchema = z.object({ slug: z.string().min(1).max(100) })

  /** A game in one language. Empty text falls back to the other language. */
  export const responseSchema = z.object({
    slug: z.string(),
    lang: langSchema,
    status: z.enum(gameSelectSchema.shape.status.options),
    title: z.string(),
    tagline: z.string(),
    description: z.string(),
    year: z.number().nullable(),
    priceThb: z.number().nullable(),
    preorderOpen: z.boolean(),
    preorderCloses: z.string().nullable(),
    coverImage: z.string().nullable(),
    bggUrl: z.string().nullable(),
    shopUrl: z.string().nullable(),
    rulebookUrl: z.string().nullable(),
    pnpUrl: z.string().nullable(),
    sortOrder: z.number()
  })

  export const detailQuerySchema = z.object({
    lang: langSchema.optional().catch(undefined)
  })

  export type Response = z.infer<typeof responseSchema>
  export type DetailQuery = z.infer<typeof detailQuerySchema>
}
