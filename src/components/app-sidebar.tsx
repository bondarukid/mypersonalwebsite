"use client"

import * as React from "react"
import { useTranslations } from "next-intl"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { CompanySwitcher } from "@/components/company-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { GalleryVerticalEndIcon, AudioLinesIcon, TerminalIcon, TerminalSquareIcon, BotIcon, BookOpenIcon, Settings2Icon, FrameIcon, PieChartIcon, MapIcon, Share2Icon, BarChart3Icon } from "lucide-react"

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
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  companies: CompanyForSidebar[]
  user: UserForSidebar
  activeCompanyId?: string | null
}) {
  const t = useTranslations("dashboard")

  const data = {
    navMain: [
      {
        title: t("playground"),
        url: "#",
        icon: <TerminalSquareIcon />,
        isActive: true,
        items: [
          { title: t("history"), url: "#" },
          { title: t("starred"), url: "#" },
          { title: t("settings"), url: "#" },
        ],
      },
      {
        title: t("models"),
        url: "#",
        icon: <BotIcon />,
        items: [
          { title: t("genesis"), url: "#" },
          { title: t("explorer"), url: "#" },
          { title: t("quantum"), url: "#" },
        ],
      },
      {
        title: t("documentation"),
        url: "#",
        icon: <BookOpenIcon />,
        items: [
          { title: t("introduction"), url: "#" },
          { title: t("getStarted"), url: "#" },
          { title: t("tutorials"), url: "#" },
          { title: t("changelog"), url: "#" },
        ],
      },
      {
        title: t("settings"),
        url: "#",
        icon: <Settings2Icon />,
        items: [
          { title: t("general"), url: "#" },
          { title: t("team"), url: "#" },
          { title: t("billing"), url: "#" },
          { title: t("limits"), url: "#" },
        ],
      },
      {
        title: t("social"),
        url: "/dashboard/social",
        icon: <Share2Icon />,
        items: [],
      },
      {
        title: t("landingStats"),
        url: "/dashboard/landing-stats",
        icon: <BarChart3Icon />,
        items: [],
      },
    ],
    projects: [
      { name: t("designEngineering"), url: "#", icon: <FrameIcon /> },
      { name: t("salesMarketing"), url: "#", icon: <PieChartIcon /> },
      { name: t("travel"), url: "#", icon: <MapIcon /> },
    ],
  }
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <CompanySwitcher
          companies={companies}
          activeCompanyId={activeCompanyId}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
