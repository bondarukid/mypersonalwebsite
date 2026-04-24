"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { getTranslations } from "next-intl/server"
import { getAppsByCompanyId } from "@/lib/supabase/apps"
import { refreshLandingStatsForCompany } from "@/lib/stats"
import { createApp, updateApp } from "@/lib/supabase/apps"
import { upsertStatsCredentials } from "@/lib/supabase/stats-credentials"
import { createClient } from "@/lib/supabase/server"
import { getLandingCompany } from "@/lib/supabase/companies"
import { upsertLandingStatsContent } from "@/lib/supabase/landing-stats-content"
import { routing } from "@/i18n/routing"

const landingStatsContentSchema = z.object({
  heading_en: z.string(),
  heading_uk: z.string(),
  heading_ja: z.string(),
  description_en: z.string(),
  description_uk: z.string(),
  description_ja: z.string(),
  label_stars_en: z.string(),
  label_stars_uk: z.string(),
  label_stars_ja: z.string(),
  label_active_en: z.string(),
  label_active_uk: z.string(),
  label_active_ja: z.string(),
  label_powered_en: z.string(),
  label_powered_uk: z.string(),
  label_powered_ja: z.string(),
  use_manual_totals: z.boolean(),
  manual_stars: z.coerce.number().int().min(0),
  manual_active_users: z.coerce.number().int().min(0),
  manual_powered_apps: z.coerce.number().int().min(0),
})

async function requireLandingEditor(): Promise<{
  companyId: string | null
  error?: string
}> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { companyId: null, error: "Not authenticated" }

  const landing = await getLandingCompany()
  if (!landing) return { companyId: null, error: "No landing company" }

  const { data: m } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("company_id", landing.id)
    .eq("user_id", user.id)
    .maybeSingle()

  if (!m) return { companyId: null, error: "Not a member of landing company" }
  return { companyId: landing.id }
}

function revalidateStatsLanding() {
  revalidatePath("/", "page")
  revalidatePath("/dashboard/landing-stats", "page")
  for (const locale of routing.locales) {
    const prefix = locale === routing.defaultLocale ? "" : `/${locale}`
    revalidatePath(`${prefix || ""}/`, "page")
    revalidatePath(
      `${prefix || ""}/dashboard/landing-stats`,
      "page"
    )
  }
}

export async function saveLandingStatsContentAction(
  raw: z.infer<typeof landingStatsContentSchema>
): Promise<{ error?: string }> {
  const t = await getTranslations("dashboard.landingStatsPage")
  const { companyId, error } = await requireLandingEditor()
  if (!companyId) return { error: error ?? t("notAuthenticated") }
  const p = landingStatsContentSchema.safeParse(raw)
  if (!p.success) {
    return { error: p.error.issues[0]?.message ?? "Invalid" }
  }
  const e = await upsertLandingStatsContent(companyId, p.data)
  if (e.error) return { error: e.error }
  revalidateStatsLanding()
  return {}
}

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

export async function saveCredentialsAction(
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

  const hasExisting = formData.get("hasCredentials") === "1"
  const gaClientEmail = (formData.get("gaClientEmail") as string)?.trim()
  const gaPrivateKey = (formData.get("gaPrivateKey") as string)?.trim()
  const githubToken = (formData.get("githubToken") as string)?.trim()

  const creds: {
    gaClientEmail?: string
    gaPrivateKey?: string
    githubToken?: string
  } = {}
  if (gaClientEmail !== undefined && gaClientEmail !== "")
    creds.gaClientEmail = gaClientEmail
  else if (!hasExisting) creds.gaClientEmail = ""
  if (gaPrivateKey !== undefined && gaPrivateKey !== "")
    creds.gaPrivateKey = gaPrivateKey
  else if (!hasExisting) creds.gaPrivateKey = ""
  if (githubToken !== undefined && githubToken !== "")
    creds.githubToken = githubToken
  else if (!hasExisting) creds.githubToken = ""

  const { error } = await upsertStatsCredentials(companyId, creds)

  if (error) return { error }
  return { success: t("credentialsSaved") }
}
