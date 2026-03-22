import { createClient } from "./server"

export type App = {
  id: string
  company_id: string
  name: string
  ga_property_id: string | null
  github_username: string | null
  github_repo: string | null
  enabled_for_landing: boolean
  sort_order: number
  created_at: string
}

export async function getAppsByCompanyId(
  companyId: string
): Promise<App[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("apps")
    .select("*")
    .eq("company_id", companyId)
    .order("sort_order", { ascending: true })

  if (error) return []
  return (data ?? []) as App[]
}

export async function createApp(
  companyId: string,
  input: {
    name: string
    ga_property_id?: string | null
    github_username?: string | null
    github_repo?: string | null
    enabled_for_landing?: boolean
  }
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.from("apps").insert({
    company_id: companyId,
    name: input.name,
    ga_property_id: input.ga_property_id || null,
    github_username: input.github_username || null,
    github_repo: input.github_repo || null,
    enabled_for_landing: input.enabled_for_landing ?? false,
    sort_order: 0,
  })

  if (error) return { error: error.message }
  return {}
}

export async function updateApp(
  id: string,
  updates: {
    name?: string
    ga_property_id?: string | null
    github_username?: string | null
    github_repo?: string | null
    enabled_for_landing?: boolean
  }
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase
    .from("apps")
    .update(updates)
    .eq("id", id)

  if (error) return { error: error.message }
  return {}
}

export async function deleteApp(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.from("apps").delete().eq("id", id)

  if (error) return { error: error.message }
  return {}
}
