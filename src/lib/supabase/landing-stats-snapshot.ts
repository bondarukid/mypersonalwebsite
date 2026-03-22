import { createClient } from "./server"

export type LandingStatsSnapshot = {
  id: string
  company_id: string
  stars: number
  active_users: number
  powered_apps: number
  synced_at: string
}

export async function getLandingStatsSnapshot(
  companyId: string
): Promise<LandingStatsSnapshot | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("landing_stats_snapshot")
    .select("*")
    .eq("company_id", companyId)
    .single()

  if (error || !data) return null
  return data as LandingStatsSnapshot
}

export async function upsertLandingStatsSnapshot(
  companyId: string,
  stats: { stars: number; active_users: number; powered_apps: number },
  options?: { useAdmin?: boolean }
): Promise<{ error?: string }> {
  const supabase = options?.useAdmin
    ? (await import("./admin")).createAdminClient()
    : await createClient()
  const { error } = await supabase
    .from("landing_stats_snapshot")
    .upsert(
      {
        company_id: companyId,
        stars: stats.stars,
        active_users: stats.active_users,
        powered_apps: stats.powered_apps,
        synced_at: new Date().toISOString(),
      },
      { onConflict: "company_id" }
    )

  if (error) return { error: error.message }
  return {}
}
