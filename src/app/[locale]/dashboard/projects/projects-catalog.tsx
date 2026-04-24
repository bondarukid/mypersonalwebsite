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
import { createProjectAction } from "./actions"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Link } from "@/i18n/routing"
import { PlusIcon, FolderIcon } from "lucide-react"

interface ProjectsCatalogProps {
  companyId: string
  projects: Project[]
}

export function ProjectsCatalog({ companyId, projects }: ProjectsCatalogProps) {
  const t = useTranslations("dashboard.projectsPage")
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !slug.trim()) {
      toast.error(t("nameAndSlugRequired"))
      return
    }
    setCreating(true)
    const formData = new FormData()
    formData.set("name", name.trim())
    formData.set("slug", slug.trim().toLowerCase().replace(/\s+/g, "-"))
    const result = await createProjectAction(companyId, formData)
    setCreating(false)
    if (result.error) {
      toast.error(result.error)
    } else if (result.id) {
      toast.success(t("projectCreated"))
      setOpen(false)
      setName("")
      setSlug("")
      router.push(`/dashboard/projects/${result.id}/overview`)
    }
  }

  const handleNameChange = (v: string) => {
    setName(v)
    if (!slug || slug === slugify(name)) {
      setSlug(slugify(v))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button>
                <PlusIcon className="mr-2 size-4" />
                {t("addProject")}
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("newProject")}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label>{t("name")}</Label>
                <Input
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder={t("namePlaceholder")}
                />
              </div>
              <div>
                <Label>{t("slug")}</Label>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                  placeholder={t("slugPlaceholder")}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  {t("cancel")}
                </Button>
                <Button type="submit" disabled={creating}>
                  {creating ? t("creating") : t("create")}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {projects.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FolderIcon className="size-12 text-muted-foreground" />
            <p className="mt-4 text-center text-muted-foreground">
              {t("noProjects")}
            </p>
            <Button className="mt-4" onClick={() => setOpen(true)}>
              <PlusIcon className="mr-2 size-4" />
              {t("addProject")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} href={`/dashboard/projects/${project.id}/overview`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="flex items-center gap-4 py-4">
                  <div className="flex size-12 items-center justify-center rounded-lg bg-muted">
                    <FolderIcon className="size-6 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{project.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      /projects/{project.slug}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
}
