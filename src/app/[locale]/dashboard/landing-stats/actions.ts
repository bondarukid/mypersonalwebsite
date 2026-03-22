"use server"

import { getTranslations } from "next-intl/server"
import { getAppsByCompanyId } from "@/lib/supabase/apps"
import { refreshLandingStatsForCompany } from "@/lib/stats"
import { createApp, updateApp } from "@/lib/supabase/apps"
import { createClient } from "@/lib/supabase/server"

export async function syncStatsAction(
  _prevState: { error?: string; success?: string } | null,
  formData: FormData
): Promise<{ error?: string; success?: string } | null> {
  const t = await getTranslations("dashboard.landingStatsPage")
  const companyId = formData.get("companyId") as string
  if (!companyId) return { error: "Missing company" }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: t("notAuthenticated") }

  const apps = await getAppsByCompanyId(companyId)
  const stats = await refreshLandingStatsForCompany(
    companyId,
    apps.map((a) => ({
      ga_property_id: a.ga_property_id,
      github_username: a.github_username,
      enabled_for_landing: a.enabled_for_landing,
    })),
    { persist: true }
  )

  return { success: t("synced") }
}

export async function addAppAction(
  _prevState: { error?: string; success?: string } | null,
  formData: FormData
): Promise<{ error?: string; success?: string } | null> {
  const t = await getTranslations("dashboard.landingStatsPage")
  const companyId = formData.get("companyId") as string
  const name = (formData.get("appName") as string)?.trim()
  if (!companyId || !name) return { error: t("appNameRequired") }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: t("notAuthenticated") }

  const { error } = await createApp(companyId, {
    name,
    ga_property_id: (formData.get("gaPropertyId") as string)?.trim() || null,
    github_username:
      (formData.get("githubUsername") as string)?.trim() || null,
    github_repo: (formData.get("githubRepo") as string)?.trim() || null,
    enabled_for_landing: false,
  })

  if (error) return { error }
  return { success: t("appAdded") }
}

export async function updateAppAction(
  _prevState: { error?: string; success?: string } | null,
  formData: FormData
): Promise<{ error?: string; success?: string } | null> {
  const appId = formData.get("appId") as string
  const name = (formData.get("appName") as string)?.trim()
  if (!appId || !name) return null

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { error } = await updateApp(appId, {
    name,
    ga_property_id: (formData.get("gaPropertyId") as string)?.trim() || null,
    github_username:
      (formData.get("githubUsername") as string)?.trim() || null,
    enabled_for_landing: formData.get("enabledForLanding") === "on",
  })

  if (error) return { error }
  return null
}
