export const LANGS = ["th", "en"] as const
export type Lang = (typeof LANGS)[number]
