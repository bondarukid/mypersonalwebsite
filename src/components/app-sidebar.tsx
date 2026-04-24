"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavProject } from "@/components/nav-project"
import { NavUser } from "@/components/nav-user"
import { CompanySwitcher } from "@/components/company-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  BookOpenIcon,
  FrameIcon,
  Share2Icon,
  BarChart3Icon,
  QuoteIcon,
  AwardIcon,
  HistoryIcon,
  LayoutGridIcon,
} from "lucide-react"
import type { Project } from "@/lib/supabase/projects"

export type CompanyForSidebar = {
  id: string
  name: string
  slug: string
}

export type UserForSidebar = {
  name: string
  email: string
  avatar?: string
}

export function AppSidebar({
  companies,
  user,
  activeCompanyId,
  projects = [],
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  companies: CompanyForSidebar[]
  user: UserForSidebar
  activeCompanyId?: string | null
  projects?: Project[]
}) {
  const t = useTranslations("dashboard")
  const pathname = usePathname()

  const projectIdMatch = pathname.match(/\/dashboard\/projects\/([a-f0-9-]+)(?:\/|$)/)
  const activeProjectId = projectIdMatch?.[1] ?? null
  const activeProject = activeProjectId
    ? projects.find((p) => p.id === activeProjectId)
    : null

  const navMain = [
    { title: t("social"), url: "/dashboard/social", icon: <Share2Icon />, items: [] },
    { title: t("landingStats"), url: "/dashboard/landing-stats", icon: <BarChart3Icon />, items: [] },
    { title: t("testimonials"), url: "/dashboard/testimonials", icon: <QuoteIcon />, items: [] },
    { title: t("certificates"), url: "/dashboard/certificates", icon: <AwardIcon />, items: [] },
    { title: t("faq"), url: "/dashboard/faq", icon: <BookOpenIcon />, items: [] },
    { title: t("landingHome"), url: "/dashboard/landing-home", icon: <LayoutGridIcon />, items: [] },
    { title: t("aboutTimeline"), url: "/dashboard/about-timeline", icon: <HistoryIcon />, items: [] },
    { title: t("projects"), url: "/dashboard/projects", icon: <FrameIcon />, items: [] },
  ]

  const projectsForNav = projects.map((p) => ({
    name: p.name,
    url: `/dashboard/projects/${p.id}/overview`,
    icon: <FrameIcon />,
  }))

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <CompanySwitcher
          companies={companies}
          activeCompanyId={activeCompanyId}
        />
      </SidebarHeader>
      <SidebarContent>
        {activeProject ? (
          <NavProject project={activeProject} />
        ) : (
          <>
            <NavMain items={navMain} />
            <NavProjects projects={projectsForNav} />
          </>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
