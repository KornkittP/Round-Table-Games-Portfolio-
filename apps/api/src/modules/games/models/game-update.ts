import { gameSelectSchema } from "@repo/database"
import z from "zod"

const nullableText = (max: number) => z.string().trim().max(max).nullable()
const nullableUrl = z.url().max(500).nullable()

export namespace GameUpdateModel {
  /** Only the fields an admin edits. Send just what changes; null clears a field. */
  export const bodySchema = z
    .object({
      status: z.enum(gameSelectSchema.shape.status.options),
      titleEn: z.string().trim().min(1).max(200),
      titleTh: nullableText(200),
      taglineEn: nullableText(300),
      taglineTh: nullableText(300),
      descriptionEn: nullableText(5000),
      descriptionTh: nullableText(5000),
      year: z.number().int().min(1900).max(2100).nullable(),
      priceThb: z.number().int().min(0).max(1_000_000).nullable(),
      preorderOpen: z.boolean(),
      preorderCloses: z.iso.datetime({ offset: true }).nullable(),
      coverImage: nullableUrl,
      bggUrl: nullableUrl,
      shopUrl: nullableUrl,
      rulebookUrl: nullableUrl,
      pnpUrl: nullableUrl,
      sortOrder: z.number().int().min(0).max(10_000)
    })
    .partial()
    .refine((body) => Object.keys(body).length > 0, { message: "Send at least one field to update" })

  export type Body = z.infer<typeof bodySchema>
}
