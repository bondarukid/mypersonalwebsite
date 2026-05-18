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

import type { Project } from "@/content/types"
import { CONTENT_TS } from "@/content/constants"

const projects: Project[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    name: "Portfolio website",
    slug: "portfolio-website",
    description:
      "Personal portfolio and project showcase built with Next.js, TypeScript, and shadcn/ui. Replace this entry in src/content/projects.ts with your own apps.",
    icon_path: null,
    itunes_bundle_id: null,
    store_links: {},
    platforms: { web: ["SSR"] },
    min_os_versions: {},
    sort_order: 0,
    created_at: CONTENT_TS,
    updated_at: CONTENT_TS,
  },
]

export function getProjects(): Project[] {
  return [...projects].sort((a, b) => a.sort_order - b.sort_order)
}

export function getProjectBySlug(slug: string): Project | null {
  return projects.find((p) => p.slug === slug) ?? null
}
