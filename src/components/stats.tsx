/*
 * Copyright (C) 2026 Ivan Bondaruk (https://bondarukid.com)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { getLocale, getTranslations } from "next-intl/server"
import { getStatsForLandingDisplay } from "@/lib/stats"
import { formatActiveUsers } from "@/lib/stats-display"
import { getLocalizedLandingStatsContent } from "@/lib/landing-stats-content-i18n"
import { getLandingStatsContent } from "@/content/stats"

export default async function StatsSection() {
  const locale = await getLocale()
  const t = await getTranslations("stats")
  const landingStats = getLandingStatsContent()
  const data = await getStatsForLandingDisplay(landingStats)

  const text = landingStats
    ? getLocalizedLandingStatsContent(landingStats, locale)
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
