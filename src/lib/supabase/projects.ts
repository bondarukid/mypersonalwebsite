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

import { createClient } from "./server"

export type Project = {
  id: string
  company_id: string
  name: string
  slug: string
  description: string | null
  icon_path: string | null
  itunes_bundle_id: string | null
  store_links: Record<string, string>
  platforms: Record<string, string[]>
  min_os_versions: Record<string, string>
  sort_order: number
  created_at: string
  updated_at: string
}

export async function getProjectsByCompanyId(
  companyId: string
): Promise<Project[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("company_id", companyId)
    .order("sort_order", { ascending: true })

  if (error) return []
  return (data ?? []) as Project[]
}

export async function getProjectById(id: string): Promise<Project | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !data) return null
  return data as Project
}

/** Checks if the user is a member of the project's company. Use before storage uploads. */
export async function canUserAccessProject(
  userId: string,
  projectId: string
): Promise<boolean> {
  const project = await getProjectById(projectId)
  if (!project) return false

  const supabase = await createClient()
  const { data } = await supabase
    .from("company_members")
    .select("id")
    .eq("company_id", project.company_id)
    .eq("user_id", userId)
    .maybeSingle()

  return !!data
}

export async function getProjectBySlug(
  slug: string,
  companyId: string
): Promise<Project | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("company_id", companyId)
    .eq("slug", slug)
    .single()

  if (error || !data) return null
  return data as Project
}

export async function createProject(
  companyId: string,
  input: {
    name: string
    slug: string
    description?: string
    store_links?: Record<string, string>
    platforms?: Record<string, string[]>
    min_os_versions?: Record<string, string>
  }
): Promise<{ id?: string; error?: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("projects")
    .insert({
      company_id: companyId,
      name: input.name,
      slug: input.slug.toLowerCase().replace(/\s+/g, "-"),
      description: input.description ?? null,
      store_links: input.store_links ?? {},
      platforms: input.platforms ?? {},
      min_os_versions: input.min_os_versions ?? {},
    })
    .select("id")
    .single()

  if (error) return { error: error.message }
  const projectId = data?.id
  if (!projectId) return { error: "No project ID returned" }

  await supabase.from("faq_sets").insert({
    slug: `project-${projectId}`,
    project_id: projectId,
    company_id: companyId,
  })

  return { id: projectId }
}

export async function updateProject(
  id: string,
  updates: Partial<{
    name: string
    slug: string
    description: string | null
    icon_path: string | null
    itunes_bundle_id: string | null
    store_links: Record<string, string>
    platforms: Record<string, string[]>
    min_os_versions: Record<string, string>
    sort_order: number
  }>
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase
    .from("projects")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) return { error: error.message }
  return {}
}

export async function deleteProject(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.from("projects").delete().eq("id", id)
  if (error) return { error: error.message }
  return {}
}
