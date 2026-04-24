"use client"

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

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import type { Project } from "@/lib/supabase/projects"
import { updateProjectAction } from "../actions"
import { PLATFORM_GROUPS, STORE_LINKS } from "@/config/platforms"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

/** Uniquely identifies a platform row (e.g. Apple macOS vs Steam macOS). */
function minOsKey(groupId: string, platformId: string) {
  return `${groupId}__${platformId}`
}

function minOsValue(
  map: Record<string, string>,
  groupId: string,
  platformId: string
) {
  const k = minOsKey(groupId, platformId)
  if (Object.hasOwn(map, k)) return map[k] ?? ""
  if (Object.hasOwn(map, platformId)) return map[platformId] ?? ""
  return ""
}

interface ProjectPlatformsEditorProps {
  project: Project
}

export function ProjectPlatformsEditor({ project }: ProjectPlatformsEditorProps) {
  const t = useTranslations("dashboard.projectPlatforms")
  const router = useRouter()
  const [storeLinks, setStoreLinks] = useState<Record<string, string>>(
    project.store_links ?? {}
  )
  const [platforms, setPlatforms] = useState<Record<string, string[]>>(
    project.platforms ?? {}
  )
  const [minOsVersions, setMinOsVersions] = useState<Record<string, string>>(
    project.min_os_versions ?? {}
  )

  const handleStoreLinkChange = (id: string, value: string) => {
    const next = { ...storeLinks, [id]: value }
    setStoreLinks(next)
    updateProjectAction(project.id, { store_links: next }).then((r) => {
      if (r.error) toast.error(r.error)
      else {
        toast.success(t("saved"))
        router.refresh()
      }
    })
  }

  const handlePlatformToggle = (groupId: string, platformId: string, checked: boolean) => {
    const current = platforms[groupId] ?? []
    const next = checked
      ? [...current, platformId]
      : current.filter((p) => p !== platformId)
    const nextPlatforms = { ...platforms, [groupId]: next }
    setPlatforms(nextPlatforms)
    updateProjectAction(project.id, { platforms: nextPlatforms }).then((r) => {
      if (r.error) toast.error(r.error)
      else {
        toast.success(t("saved"))
        router.refresh()
      }
    })
  }

  const handleMinOsChange = (key: string, value: string) => {
    const next = { ...minOsVersions, [key]: value }
    setMinOsVersions(next)
    updateProjectAction(project.id, { min_os_versions: next }).then((r) => {
      if (r.error) toast.error(r.error)
      else {
        toast.success(t("saved"))
        router.refresh()
      }
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("storeLinks")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {STORE_LINKS.map((store) => (
            <div key={store.id}>
              <Label>{store.label}</Label>
              <Input
                type="url"
                value={storeLinks[store.id] ?? ""}
                onChange={(e) => setStoreLinks((prev) => ({ ...prev, [store.id]: e.target.value }))}
                onBlur={(e) => handleStoreLinkChange(store.id, e.target.value)}
                placeholder={store.urlPlaceholder}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("platforms")}</CardTitle>
          <p className="text-sm text-muted-foreground">{t("platformsHint")}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {PLATFORM_GROUPS.map((group) => (
            <div key={group.id}>
              <Label className="text-base">{group.label}</Label>
              <div className="mt-2 flex flex-wrap gap-4">
                {group.platforms.map((platform) => (
                  <label
                    key={platform.id}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Checkbox
                      checked={(platforms[group.id] ?? []).includes(platform.id)}
                      onCheckedChange={(checked) =>
                        handlePlatformToggle(group.id, platform.id, !!checked)
                      }
                    />
                    <span>{platform.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("minOsVersions")}</CardTitle>
          <p className="text-sm text-muted-foreground">{t("minOsHint")}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {PLATFORM_GROUPS.flatMap((g) =>
            g.platforms.map((p) => {
              const k = minOsKey(g.id, p.id)
              return (
                <div key={k} className="flex items-center gap-4">
                  <Label className="w-32">{p.label}</Label>
                  <Input
                    value={minOsValue(minOsVersions, g.id, p.id)}
                    onChange={(e) =>
                      setMinOsVersions((prev) => ({ ...prev, [k]: e.target.value }))
                    }
                    onBlur={(e) => handleMinOsChange(k, e.target.value)}
                    placeholder="e.g. 14.0"
                  />
                </div>
              )
            })
          )}
        </CardContent>
      </Card>
    </div>
  )
}
