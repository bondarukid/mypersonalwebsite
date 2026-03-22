import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { refreshLandingStatsForCompany } from "@/lib/stats"

export const dynamic = "force-dynamic"
export const maxDuration = 60

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createAdminClient()
  const { data: landing, error: landingError } = await supabase
    .from("companies")
    .select("id")
    .eq("slug", "landing")
    .single()

  if (landingError || !landing) {
    return NextResponse.json(
      { error: "Landing company not found" },
      { status: 404 }
    )
  }

  const { data: apps = [] } = await supabase
    .from("apps")
    .select("ga_property_id, github_username, enabled_for_landing")
    .eq("company_id", landing.id)

  await refreshLandingStatsForCompany(
    landing.id,
    (apps ?? []).map((a: { ga_property_id: string | null; github_username: string | null; enabled_for_landing: boolean }) => ({
      ga_property_id: a.ga_property_id,
      github_username: a.github_username,
      enabled_for_landing: a.enabled_for_landing,
    })),
    { persist: true, useAdmin: true }
  )

  return NextResponse.json({ success: true })
}
