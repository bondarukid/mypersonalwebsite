"use server"

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

import { z } from "zod"
import { revalidatePath } from "next/cache"
import {
  createProject,
  updateProject,
  deleteProject,
  getProjectById,
} from "@/lib/supabase/projects"
import { routing } from "@/i18n/routing"

const createProjectSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
})

export async function createProjectAction(
  companyId: string,
  formData: FormData
): Promise<{ error?: string; id?: string }> {
  const rawSlug = (formData.get("slug") as string)?.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
  const parsed = createProjectSchema.safeParse({
    name: (formData.get("name") as string)?.trim(),
    slug: rawSlug,
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Validation failed" }
  }

  const result = await createProject(companyId, {
    name: parsed.data.name,
    slug: parsed.data.slug,
  })
  if (result.error) return { error: result.error }
  await revalidatePaths(undefined)
  return { id: result.id }
}

export async function updateProjectAction(
  projectId: string,
  updates: Parameters<typeof updateProject>[1]
): Promise<{ error?: string }> {
  const result = await updateProject(projectId, updates)
  if (result.error) return { error: result.error }
  await revalidatePaths(projectId)
  return {}
}

export async function deleteProjectAction(projectId: string): Promise<{ error?: string }> {
  const result = await deleteProject(projectId)
  if (result.error) return { error: result.error }
  await revalidatePaths(projectId)
  return {}
}

async function revalidatePaths(projectId?: string) {
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/projects")
  for (const locale of routing.locales) {
    const prefix = locale === routing.defaultLocale ? "" : `/${locale}`
    revalidatePath(`${prefix}/dashboard`)
    revalidatePath(`${prefix}/dashboard/projects`)
    revalidatePath(`${prefix}/projects`)
  }
  if (projectId) {
    const project = await getProjectById(projectId)
    if (project?.slug) {
      for (const locale of routing.locales) {
        const prefix = locale === routing.defaultLocale ? "" : `/${locale}`
        revalidatePath(`${prefix}/projects/${project.slug}`)
      }
    }
  }
}
