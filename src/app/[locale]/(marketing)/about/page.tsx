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

import type { Metadata } from "next"
import { getLocale, getTranslations } from "next-intl/server"
import { AboutPageHero } from "@/components/about-page-hero"
import { AboutPageIntro } from "@/components/about-page-intro"
import { AboutPageTimeline } from "@/components/about-page-timeline"
import FooterSection from "@/components/footer"
import {
  getTimelineMilestonesWithDepth,
  mapMilestonesToPublicLocale,
} from "@/lib/supabase/about-timeline"
import { getLandingCompany } from "@/lib/supabase/companies"
import { getSocialLinks } from "@/lib/supabase/social-links"
import { createMetadata } from "@/lib/seo/metadata"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = await getTranslations("metadata")
  return createMetadata({
    title: t("aboutTitle"),
    description: t("aboutDescription"),
    path: "about",
    locale,
  })
}

export default async function AboutPage() {
  const locale = await getLocale()
  const socialLinks = await getSocialLinks()
  const landing = await getLandingCompany()
  const rows = landing?.id
    ? await getTimelineMilestonesWithDepth(landing.id)
    : []
  const milestones = mapMilestonesToPublicLocale(rows, locale)

  return (
    <div className="flex flex-1 flex-col">
      <div className="dark bg-black text-zinc-50">
        <AboutPageHero />
        <AboutPageIntro />
        <AboutPageTimeline milestones={milestones} />
      </div>
      <FooterSection socialLinks={socialLinks} />
    </div>
  )
}
