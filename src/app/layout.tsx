import type { Metadata } from "next"
import { headers } from "next/headers"
import { Geist, Geist_Mono } from "next/font/google"
import { NextIntlClientProvider } from "next-intl"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AnalyticsInit } from "@/features/analytics/components/analytics-init"
import { routing } from "@/i18n/routing"
import { SITE_URL } from "@/config/seo"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers()
  const locale =
    headersList.get("x-next-intl-locale") ?? routing.defaultLocale
  const messages = (await import(`../../messages/${locale}.json`)).default
  const metadata = (messages as { metadata?: { defaultTitle?: string; defaultDescription?: string } })
    .metadata
  return {
    metadataBase: new URL(SITE_URL),
    title: metadata?.defaultTitle ?? "Ivan Bondaruk",
    description: metadata?.defaultDescription ?? "Personal website",
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const headersList = await headers()
  const locale =
    headersList.get("x-next-intl-locale") ?? routing.defaultLocale
  const messages = (await import(`../../messages/${locale}.json`)).default

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AnalyticsInit>
              <TooltipProvider>
                <div className="flex flex-1 flex-col">{children}</div>
              </TooltipProvider>
            </AnalyticsInit>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
