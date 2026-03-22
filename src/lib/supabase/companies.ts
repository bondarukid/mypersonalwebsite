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

export async function getLandingCompany(): Promise<Company | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("slug", "landing")
    .single()

  if (error || !data) return null
  return data as Company
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

export async function ensureUserInLanding(userId: string): Promise<void> {
  const supabase = await createClient()
  const landing = await getLandingCompany()
  if (!landing) return

  const { data: existing } = await supabase
    .from("company_members")
    .select("id")
    .eq("company_id", landing.id)
    .eq("user_id", userId)
    .single()

  if (existing) return

  await supabase.from("company_members").insert({
    company_id: landing.id,
    user_id: userId,
    role: "member",
  })
}
