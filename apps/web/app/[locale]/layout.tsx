import "@fontsource-variable/dm-sans"
import "@fontsource-variable/noto-sans-thai"
import "../style.css"
import { notFound } from "next/navigation"
import Link from "next/link"
import { NextIntlClientProvider } from "next-intl"
import { Brand, Header } from "@/components/Header"
import { isLocale, messages } from "@/lib/locale"
export const metadata = { icons: { icon: "/studio-icon.png" } }

export default async function Layout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = messages[locale]
  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider
          locale={locale}
          messages={t}
          timeZone="Asia/Bangkok"
        >
          <a href="#main" className="skip">
            {t.skip}
          </a>
          <Header lang={locale} />
          <main id="main">{children}</main>
          <footer>
            <div className="wrap footer">
              <Link href={"/" + locale}>
                <Brand />
              </Link>
              <span>© {new Date().getFullYear()} {locale === "th" ? "กรกิตติ์ พูลทรัพย์" : "Kornkitt Poolsup"}</span>
              <Link href={"/" + locale + "/contact"}>{t.contact}</Link>
            </div>
          </footer>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
