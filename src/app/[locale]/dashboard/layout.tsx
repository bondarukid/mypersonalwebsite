import type { Metadata } from "next"
import { redirect } from "@/i18n/routing"
import { createClient } from "@/lib/supabase/server"
import {
  getUserCompanies,
  ensureUserInLanding,
  getLandingCompany,
} from "@/lib/supabase/companies"
import { getProfileByUserId } from "@/lib/supabase/profiles"
import { getProjectsByCompanyId } from "@/lib/supabase/projects"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect({ href: "/login", locale })
    return
  }

  const userId = user.id
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("user_id", userId)
    .single()

  if (!profile?.display_name?.trim()) {
    redirect({ href: "/onboarding", locale })
    return
  }

  await ensureUserInLanding(userId)

  const [profileData, companies, landing] = await Promise.all([
    getProfileByUserId(userId),
    getUserCompanies(userId),
    getLandingCompany(),
  ])

  const projects = landing?.id
    ? await getProjectsByCompanyId(landing.id)
    : []

  const companiesForSidebar = companies.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
  }))
  const activeCompanyId = companies[0]?.id ?? null

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar
        companies={companiesForSidebar}
        user={{
          name: profileData?.display_name || user.email || "",
          email: user.email || "",
        }}
        activeCompanyId={activeCompanyId}
        projects={projects}
      />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-2">
          <div className="@container/main flex flex-1 flex-col gap-2">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
