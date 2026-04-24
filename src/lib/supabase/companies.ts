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

export type Company = {
  id: string
  name: string
  slug: string
  logo_url: string | null
  created_at: string
  created_by?: string | null
}

export type CompanyMember = {
  id: string
  company_id: string
  user_id: string
  role: string
  created_at: string
}

export async function getUserCompanies(
  userId: string
): Promise<Company[]> {
  const supabase = await createClient()
  const { data: members, error: membersError } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", userId)

  if (membersError || !members?.length) return []

  const companyIds = members.map((m) => m.company_id)
  const { data: companies, error } = await supabase
    .from("companies")
    .select("*")
    .in("id", companyIds)
    .order("name")

  if (error) return []
  return (companies ?? []) as Company[]
}

/**
 * Resolves the Landing site company (slug `landing`).
 * If the row is missing (e.g. migrations not applied on remote), calls RPC
 * `ensure_landing_company` (idempotent insert), then retries SELECT.
 * Falls back to membership-based lookup for dashboard users.
 */
export async function getLandingCompany(): Promise<Company | null> {
  const supabase = await createClient()

  const selectLanding = async () => {
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .eq("slug", "landing")
      .maybeSingle()
    if (error || !data) return null
    return data as Company
  }

  let row = await selectLanding()
  if (row) return row

  const { error: rpcError } = await supabase.rpc("ensure_landing_company")
  if (!rpcError) {
    row = await selectLanding()
    if (row) return row
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: memberships } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", user.id)

  const ids = memberships?.map((m) => m.company_id) ?? []
  if (ids.length === 0) return null

  const { data: byMembership } = await supabase
    .from("companies")
    .select("*")
    .eq("slug", "landing")
    .in("id", ids)
    .maybeSingle()

  return (byMembership as Company | null) ?? null
}

/** Returns the landing site company UUID, or null if missing / inaccessible. */
export async function getLandingCompanyId(): Promise<string | null> {
  const company = await getLandingCompany()
  return company?.id ?? null
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "company"
}

export async function createCompanyForUser(
  userId: string,
  name: string
): Promise<{ company?: Company; error?: string }> {
  const baseSlug = slugify(name)
  let slug = baseSlug
  let attempts = 0
  const maxAttempts = 5

  const supabase = await createClient()

  while (attempts < maxAttempts) {
    const { data: existing } = await supabase
      .from("companies")
      .select("id")
      .eq("slug", slug)
      .single()

    if (!existing) break
    slug = `${baseSlug}-${Math.random().toString(36).slice(2, 8)}`
    attempts++
  }

  const { data: company, error: insertError } = await supabase
    .from("companies")
    .insert({
      name: name.trim(),
      slug,
      created_by: userId,
    })
    .select()
    .single()

  if (insertError) return { error: insertError.message }
  if (!company) return { error: "Failed to create company" }

  const { error: memberError } = await supabase.from("company_members").insert({
    company_id: company.id,
    user_id: userId,
    role: "owner",
  })

  if (memberError) {
    await supabase.from("companies").delete().eq("id", company.id)
    return { error: memberError.message }
  }

  return { company: company as Company }
}

/**
 * Ensures the Landing company row exists (RPC), resolves it, and adds the user
 * to company_members for that company. Required before RLS allows reading or
 * inserting landing-scoped rows (e.g. faq_sets with company_id = landing).
 */
export async function ensureUserInLanding(
  userId: string
): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { error: rpcErr } = await supabase.rpc("ensure_landing_company")
  if (rpcErr) {
    // Continue: getLandingCompany may still work if the row already exists
  }

  const landing = await getLandingCompany()
  if (!landing) {
    return {
      error:
        "Landing company is missing. Apply migrations (ensure_landing_company RPC) or insert companies row slug=landing.",
    }
  }

  const { data: existing } = await supabase
    .from("company_members")
    .select("id")
    .eq("company_id", landing.id)
    .eq("user_id", userId)
    .maybeSingle()

  if (existing) return {}

  const { error: insertErr } = await supabase.from("company_members").insert({
    company_id: landing.id,
    user_id: userId,
    role: "member",
  })

  if (insertErr) {
    return { error: insertErr.message }
  }
  return {}
}
