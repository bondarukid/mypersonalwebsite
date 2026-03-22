"use server"

import { createClient } from "@/lib/supabase/server"

export type SocialLink = {
  id: string
  platform: string
  url: string
  enabled: boolean
  sort_order: number
  created_at: string
}

export async function getSocialLinks(): Promise<SocialLink[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return []
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("social_links")
    .select("id, platform, url, enabled, sort_order, created_at")
    .eq("enabled", true)
    .neq("url", "")
    .order("sort_order", { ascending: true })

  if (error) return []
  const links = (data ?? []) as SocialLink[]
  return links.filter((l) => l.url && l.url !== "#")
}

export async function getAllSocialLinksForAdmin(): Promise<SocialLink[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("social_links")
    .select("id, platform, url, enabled, sort_order, created_at")
    .order("sort_order", { ascending: true })

  if (error) return []
  return (data ?? []) as SocialLink[]
}

export async function updateSocialLink(
  id: string,
  updates: { enabled?: boolean; url?: string }
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase
    .from("social_links")
    .update(updates)
    .eq("id", id)

  if (error) return { error: error.message }
  return {}
}
