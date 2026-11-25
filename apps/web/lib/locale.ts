import en from "../messages/en.json"
import th from "../messages/th.json"
export const messages = { en, th }
export type Locale = keyof typeof messages
export function isLocale(value: string): value is Locale {
  return value === "th" || value === "en"
}
export function switchLocale(path: string, locale: Locale) {
  return path.replace(/^\/(en|th)(?=\/|$)/, "/" + locale)
}
export const repository =
  "https://github.com/KornkittP/Round-Table-Games-Portfolio-"
