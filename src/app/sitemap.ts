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

import type { MetadataRoute } from "next"
import { SITE_URL, LOCALES, DEFAULT_LOCALE, absoluteUrl } from "@/config/seo"
import { getLandingCompany } from "@/lib/supabase/companies"
import { getProjectsByCompanyId } from "@/lib/supabase/projects"

type Locale = (typeof LOCALES)[number]

const MARKETING_PATHS = [
  { path: "", changeFrequency: "weekly" as const, priority: 1 },
  { path: "about", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "contact", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "professional", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "projects", changeFrequency: "weekly" as const, priority: 0.9 },
  { path: "cookies", changeFrequency: "yearly" as const, priority: 0.3 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []

  for (const { path, changeFrequency, priority } of MARKETING_PATHS) {
    const languages: Record<string, string> = {}
    for (const loc of LOCALES) {
      languages[loc] = absoluteUrl(path, loc)
    }
    languages["x-default"] = absoluteUrl(path, DEFAULT_LOCALE)

    entries.push({
      url: absoluteUrl(path, DEFAULT_LOCALE),
      lastModified: new Date(),
      changeFrequency,
      priority,
      alternates: {
        languages,
      },
    })
  }

  const landing = await getLandingCompany()
  if (landing) {
    const projects = await getProjectsByCompanyId(landing.id)
    for (const project of projects) {
      const path = `projects/${project.slug}`
      const languages: Record<string, string> = {}
      for (const loc of LOCALES) {
        languages[loc] = absoluteUrl(path, loc)
      }
      languages["x-default"] = absoluteUrl(path, DEFAULT_LOCALE)

      entries.push({
        url: absoluteUrl(path, DEFAULT_LOCALE),
        lastModified: new Date(project.updated_at),
        changeFrequency: "weekly",
        priority: 0.8,
        alternates: {
          languages,
        },
      })
    }
  }

  return entries
}
