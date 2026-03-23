import type { Metadata } from "next"
import { getLocale, getTranslations } from "next-intl/server"
import { createMetadata } from "@/lib/seo/metadata"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = await getTranslations("metadata")
  return createMetadata({
    title: t("aboutTitle"),
    description: t("aboutDescription"),
    path: "about",
    locale,
  })
}

export default async function AboutPage() {
  const t = await getTranslations("common")

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        {t("about")}
      </h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        {t("contentComingSoon")}
      </p>
    </div>
  )
}
