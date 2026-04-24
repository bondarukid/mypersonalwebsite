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
import { ArrowRight, FolderIcon } from "lucide-react"
import { Link } from "@/i18n/routing"
import { getProjectIconUrl } from "@/lib/project-icon-url"
import type { Project } from "@/lib/supabase/projects"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const DESCRIPTION_MAX = 200

function excerpt(text: string | null): string | null {
  if (!text) return null
  const t = text.trim()
  if (t.length <= DESCRIPTION_MAX) return t
  return `${t.slice(0, DESCRIPTION_MAX).trimEnd()}…`
}

export function ProjectListCard({
  project,
  viewLabel,
  priority = false,
}: {
  project: Project
  viewLabel: string
  /** First visible card: eager load for LCP when the icon is above the fold. */
  priority?: boolean
}) {
  const iconUrl = getProjectIconUrl(project.icon_path)
  const blurb = excerpt(project.description)
  return (
    <Card className="h-full">
      <CardHeader className="space-y-3">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-xl border bg-muted/40">
          {iconUrl ? (
            <Image
              src={iconUrl}
              alt={project.name}
              fill
              priority={priority}
              className="object-cover"
              sizes="80px"
              unoptimized
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <FolderIcon className="size-10 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <CardTitle className="line-clamp-2">{project.name}</CardTitle>
          {blurb && (
            <CardDescription className="mt-2 line-clamp-3">
              {blurb}
            </CardDescription>
          )}
        </div>
      </CardHeader>
      <CardFooter className="mt-auto">
        <Button
          variant="outline"
          className="w-full justify-between"
          size="default"
          nativeButton={false}
          render={
            <Link
              href={`/projects/${project.slug}`}
            />
          }
        >
          {viewLabel}
          <ArrowRight
            className="size-4 text-muted-foreground"
            aria-hidden
          />
        </Button>
      </CardFooter>
    </Card>
  )
}
