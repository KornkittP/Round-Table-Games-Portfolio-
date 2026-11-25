import { getRequestConfig } from "next-intl/server"
import { isLocale, messages } from "@/lib/locale"
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = requested && isLocale(requested) ? requested : "th"
  return { locale, messages: messages[locale], timeZone: "Asia/Bangkok" }
})
