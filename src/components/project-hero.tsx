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

import Image from "next/image"
import { FolderIcon } from "lucide-react"
import { getProjectIconUrl } from "@/lib/project-icon-url"
import type { Project } from "@/lib/supabase/projects"
import { STORE_LINKS } from "@/config/platforms"

interface ProjectHeroProps {
  project: Project
}

export function ProjectHero({ project }: ProjectHeroProps) {
  const iconUrl = getProjectIconUrl(project.icon_path)
  const storeLinks = project.store_links ?? {}
  const hasStoreLinks = Object.values(storeLinks).some((v) => v && v !== "#")

  return (
    <section className="relative overflow-hidden border-b bg-gradient-to-b from-zinc-50/80 to-background dark:from-zinc-950/50 dark:to-background">
      <div className="mx-auto max-w-4xl px-6 py-24 md:py-32">
        <div className="flex flex-col items-center text-center">
          <div className="relative size-32 overflow-hidden rounded-2xl border-2 border-zinc-200/80 bg-zinc-100 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
            {iconUrl ? (
              <Image
                src={iconUrl}
                alt={project.name}
                fill
                priority
                className="object-cover"
                sizes="128px"
                unoptimized
              />
            ) : null}
            {!iconUrl && (
              <div className="flex size-full items-center justify-center">
                <FolderIcon className="size-16 text-muted-foreground" />
              </div>
            )}
          </div>
          <h1 className="mt-8 text-4xl font-bold tracking-tight md:text-5xl">
            {project.name}
          </h1>
          {project.description && (
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              {project.description}
            </p>
          )}
          {hasStoreLinks && (
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              {STORE_LINKS.map((store) => {
                const url = storeLinks[store.id]
                if (!url || url === "#") return null
                return (
                  <a
                    key={store.id}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-lg border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
                  >
                    {store.label}
                  </a>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
