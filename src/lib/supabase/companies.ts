import { createClient } from "./server"

export type Company = {
  id: string
  name: string
  slug: string
  logo_url: string | null
  created_at: string
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
