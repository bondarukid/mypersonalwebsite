import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata")
  return {
    title: t("aboutTitle"),
    description: t("aboutDescription"),
  }
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
