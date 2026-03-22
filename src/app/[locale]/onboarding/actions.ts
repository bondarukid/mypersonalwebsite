"use server"

import { redirect } from "@/i18n/routing"
import { createClient } from "@/lib/supabase/server"
import { getTranslations } from "next-intl/server"
import { ensureUserInLanding } from "@/lib/supabase/companies"
import { upsertProfile } from "@/lib/supabase/profiles"
import { routing } from "@/i18n/routing"
import { headers } from "next/headers"

export async function completeOnboardingAction(
  _prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | null> {
  const displayName = (formData.get("displayName") as string)?.trim()
  const t = await getTranslations("onboarding")

  if (!displayName) {
    return { error: t("displayNameRequired") }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: t("notAuthenticated") }
  }

  const { error: profileError } = await upsertProfile(user.id, displayName)
  if (profileError) {
    return { error: profileError }
  }

  await ensureUserInLanding(user.id)

  const headersList = await headers()
  const locale =
    headersList.get("x-next-intl-locale") ?? routing.defaultLocale

  redirect({ href: "/dashboard", locale })
  return null
}
