import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/routing"
import { ChangePreferencesButton } from "./change-preferences-button"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("cookies.policy")
  return {
    title: t("title"),
    description: t("description"),
  }
}

export default async function CookiesPage() {
  const t = await getTranslations("cookies.policy")
  const tCommon = await getTranslations("common")

  return (
    <div className="flex flex-1 flex-col px-6 py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          {t("pageTitle")}
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          {t("pageIntro")}
        </p>

        <section className="mt-8 space-y-6">
          <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
            {t("essentialTitle")}
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {t("essentialDesc")}
          </p>
          <ul className="list-inside list-disc space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li>{t("essentialAuth")}</li>
            <li>{t("essentialConsent")}</li>
          </ul>
        </section>

        <section className="mt-8 space-y-6">
          <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
            {t("analyticsTitle")}
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {t("analyticsDesc")}
          </p>
          <ul className="list-inside list-disc space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li>{t("analyticsList")}</li>
          </ul>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
            {t("changeTitle")}
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {t("changeDesc")}
          </p>
          <ChangePreferencesButton />
        </section>

        <div className="mt-12">
          <Link
            href="/"
            className="text-sm text-zinc-600 underline underline-offset-2 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            {tCommon("backToHome")}
          </Link>
        </div>
      </div>
    </div>
  )
}
