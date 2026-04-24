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

import { getTranslations } from "next-intl/server"
import { getProjectById } from "@/lib/supabase/projects"
import { ProjectPlatformsEditor } from "../project-platforms-editor"

export default async function ProjectPlatformsPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { id } = await params
  const t = await getTranslations("dashboard.projectPlatforms")
  const project = await getProjectById(id)
  if (!project) return null

  return (
    <div className="flex flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{t("description")}</p>
      </header>
      <ProjectPlatformsEditor project={project} />
    </div>
  )
}
