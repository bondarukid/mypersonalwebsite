"use client"

import { Link } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { useCookieConsent } from "../context/cookie-consent-context"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function CookieConsentBanner() {
  const { hasAnswered, acceptAll, declineAll } = useCookieConsent()
  const t = useTranslations("cookies.banner")

  if (hasAnswered) return null

  return (
    <div
      role="dialog"
      aria-label={t("ariaLabel")}
      className={cn(
        "fixed bottom-0 inset-x-0 z-50",
        "border-t border-slate-200 dark:border-zinc-800",
        "bg-white/95 dark:bg-zinc-950/95 backdrop-blur-sm"
      )}
    >
      <div className="mx-auto max-w-5xl px-6 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600 dark:text-zinc-400">
            {t("body")}{" "}
            <Link
              href="/cookies"
              className="text-slate-900 dark:text-zinc-100 underline underline-offset-2 hover:no-underline"
            >
              {t("policyLink")}
            </Link>
          </p>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={declineAll}
              className="border-slate-300 dark:border-zinc-600"
            >
              {t("essentialOnly")}
            </Button>
            <Button variant="default" size="sm" onClick={acceptAll}>
              {t("acceptAll")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
