import { getTranslations } from "next-intl/server"
import { getLandingCompany } from "@/lib/supabase/companies"
import { getAppsByCompanyId } from "@/lib/supabase/apps"
import { getLandingStatsSnapshot } from "@/lib/supabase/landing-stats-snapshot"
import { createClient } from "@/lib/supabase/server"
import { LandingStatsContent } from "./landing-stats-content"

export default async function LandingStatsPage() {
  const t = await getTranslations("dashboard.landingStatsPage")
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const landing = await getLandingCompany()
  if (!landing) return null

  const [apps, snapshot] = await Promise.all([
    getAppsByCompanyId(landing.id),
    getLandingStatsSnapshot(landing.id),
  ])

  return (
    <div className="flex flex-col gap-6 py-4 px-4 md:py-6 md:px-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-muted-foreground mt-1">{t("description")}</p>
      </div>
      <LandingStatsContent
        companyId={landing.id}
        apps={apps}
        snapshot={snapshot}
      />
    </div>
  )
}
