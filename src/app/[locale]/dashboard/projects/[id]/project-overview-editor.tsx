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
import Image from "next/image"
import { toast } from "sonner"
import type { Project } from "@/lib/supabase/projects"
import { updateProjectAction } from "../actions"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FolderIcon } from "lucide-react"

function getProjectIconUrl(iconPath: string | null): string | null {
  if (!iconPath) return null
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!base) return null
  return `${base}/storage/v1/object/public/project-icons/${iconPath}`
}

interface ProjectOverviewEditorProps {
  project: Project
}

export function ProjectOverviewEditor({ project }: ProjectOverviewEditorProps) {
  const t = useTranslations("dashboard.projectOverview")
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState(project.name)
  const [slug, setSlug] = useState(project.slug)
  const [description, setDescription] = useState(project.description ?? "")
  const [itunesBundleId, setItunesBundleId] = useState(project.itunes_bundle_id ?? "")

  const iconUrl = getProjectIconUrl(project.icon_path)

  const handleSave = async () => {
    setSaving(true)
    const result = await updateProjectAction(project.id, {
      name: name.trim(),
      slug: slug.trim().toLowerCase().replace(/\s+/g, "-"),
      description: description.trim() || null,
      itunes_bundle_id: itunesBundleId.trim() || null,
    })
    setSaving(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(t("saved"))
      router.refresh()
    }
  }

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSaving(true)
    const formData = new FormData()
    formData.set("icon", file)
    const res = await fetch(`/api/projects/${project.id}/icon`, {
      method: "POST",
      body: formData,
    })
    setSaving(false)
    const data = await res.json()
    if (!res.ok) {
      toast.error(data.error ?? "Upload failed")
    } else {
      toast.success(t("iconUploaded"))
      router.refresh()
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("basicInfo")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-6">
            <div className="flex flex-col items-center gap-2">
              <div className="relative size-24 overflow-hidden rounded-xl border bg-muted">
                {iconUrl ? (
                  <Image
                    src={iconUrl}
                    alt={project.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex size-full items-center justify-center">
                    <FolderIcon className="size-10 text-muted-foreground" />
                  </div>
                )}
              </div>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleIconUpload}
                  disabled={saving}
                />
                <span
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "cursor-pointer"
                  )}
                >
                  {t("uploadIcon")}
                </span>
              </label>
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <Label>{t("name")}</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("namePlaceholder")}
                  onBlur={handleSave}
                />
              </div>
              <div>
                <Label>{t("slug")}</Label>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                  placeholder={t("slugPlaceholder")}
                  onBlur={handleSave}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  /projects/{slug || "..."}
                </p>
              </div>
              <div>
                <Label>{t("description")}</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t("descriptionPlaceholder")}
                  onBlur={handleSave}
                  rows={3}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("itunesIcon")}</CardTitle>
          <p className="text-sm text-muted-foreground">{t("itunesIconHint")}</p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={itunesBundleId}
              onChange={(e) => setItunesBundleId(e.target.value)}
              placeholder="com.example.app"
              onBlur={handleSave}
            />
            <Button
              variant="secondary"
              onClick={async () => {
                if (!itunesBundleId.trim()) {
                  toast.error(t("itunesBundleIdRequired"))
                  return
                }
                setSaving(true)
                try {
                  const res = await fetch("/api/projects/fetch-itunes-icon", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      bundleId: itunesBundleId.trim(),
                      projectId: project.id,
                    }),
                  })
                  const data = await res.json()
                  if (!res.ok) throw new Error(data.error ?? "Fetch failed")
                  toast.success(t("iconFetched"))
                  router.refresh()
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Failed")
                } finally {
                  setSaving(false)
                }
              }}
              disabled={saving || !itunesBundleId.trim()}
            >
              {t("fetchFromiTunes")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
