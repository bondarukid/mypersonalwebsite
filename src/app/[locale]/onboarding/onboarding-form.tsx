"use client"

import { useActionState } from "react"
import { useTranslations } from "next-intl"
import { completeOnboardingAction } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function OnboardingForm({
  initialDisplayName,
}: {
  initialDisplayName: string
}) {
  const t = useTranslations("onboarding")
  const [state, formAction, isPending] = useActionState(completeOnboardingAction, null)

  return (
    <form action={formAction} className="mt-6 space-y-6">
      {state?.error && (
        <div
          role="alert"
          className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {state.error}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="displayName">{t("displayName")}</Label>
        <Input
          type="text"
          name="displayName"
          id="displayName"
          defaultValue={initialDisplayName}
          placeholder={t("displayNamePlaceholder")}
          autoComplete="name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="companyName">{t("companyName")}</Label>
        <Input
          type="text"
          name="companyName"
          id="companyName"
          placeholder={t("companyNamePlaceholder")}
          autoComplete="organization"
        />
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? t("saving") : t("continue")}
      </Button>
    </form>
  )
}
