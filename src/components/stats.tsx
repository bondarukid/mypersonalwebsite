import { getLocale, getTranslations } from "next-intl/server"
import { getStatsForLandingDisplay } from "@/lib/stats"
import { formatActiveUsers } from "@/lib/stats-display"
import { getLandingCompany } from "@/lib/supabase/companies"
import { getLocalizedLandingStatsContent } from "@/lib/supabase/landing-stats-content-i18n"
import { getLandingStatsContent } from "@/lib/supabase/landing-stats-content"

export default async function StatsSection() {
  const locale = await getLocale()
  const t = await getTranslations("stats")
  const landing = await getLandingCompany()
  const content = landing
    ? await getLandingStatsContent(landing.id)
    : null
  const data = await getStatsForLandingDisplay(content)

  const text = content
    ? getLocalizedLandingStatsContent(content, locale)
    : {
        heading: t("heading"),
        description: t("description"),
        labelStars: t("starsOnGithub"),
        labelActive: t("activeUsers"),
        labelPowered: t("poweredApps"),
      }

  return (
    <section className="py-12 md:py-20">
      <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
        <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center">
          <h2 className="text-4xl font-medium lg:text-5xl">
            {text.heading}
          </h2>
          <p>{text.description}</p>
        </div>

        <div className="grid gap-12 divide-y *:text-center md:grid-cols-3 md:gap-2 md:divide-x md:divide-y-0">
          <div className="space-y-4">
            <div className="text-5xl font-bold">
              +{data.stars.toLocaleString()}
            </div>
            <p>{text.labelStars}</p>
          </div>
          <div className="space-y-4">
            <div className="text-5xl font-bold">
              {formatActiveUsers(data.activeUsers)}
            </div>
            <p>{text.labelActive}</p>
          </div>
          <div className="space-y-4">
            <div className="text-5xl font-bold">
              +{data.poweredApps.toLocaleString()}
            </div>
            <p>{text.labelPowered}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
