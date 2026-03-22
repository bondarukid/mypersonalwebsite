"use client"

import { useRouter } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { useCookieConsent } from "@/features/cookie-consent"
import { Button } from "@/components/ui/button"

export function ChangePreferencesButton() {
  const router = useRouter()
  const { clearConsent } = useCookieConsent()
  const t = useTranslations("cookies.policy")

  const handleClick = () => {
    clearConsent()
    router.push("/")
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClick}>
      {t("changeButton")}
    </Button>
  )
}
