import z from "zod"

const text = (min: number, max: number) => z.string().trim().min(min).max(max)

export namespace PreorderCreateModel {
  export const bodySchema = z.object({
    gameSlug: text(1, 100),
    name: text(1, 120),
    phone: z
      .string()
      .trim()
      .regex(/^[0-9+\-\s()]{8,20}$/, "phone must be 8 to 20 digits, spaces, + - ( )"),
    address: text(5, 500),
    quantity: z.number().int().min(1).max(10),
    notes: text(0, 500).optional()
  })

  export type Body = z.infer<typeof bodySchema>
}
