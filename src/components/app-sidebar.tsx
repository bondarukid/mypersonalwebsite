"use client"

import * as React from "react"
import { useTranslations } from "next-intl"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { GalleryVerticalEndIcon, AudioLinesIcon, TerminalIcon, TerminalSquareIcon, BotIcon, BookOpenIcon, Settings2Icon, FrameIcon, PieChartIcon, MapIcon } from "lucide-react"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const t = useTranslations("dashboard")

  const data = {
    user: {
      name: "shadcn",
      email: "m@example.com",
      avatar: "/avatars/shadcn.jpg",
    },
    teams: [
      {
        name: "Acme Inc",
        logo: <GalleryVerticalEndIcon />,
        plan: t("enterprise"),
      },
      {
        name: "Acme Corp.",
        logo: <AudioLinesIcon />,
        plan: t("startup"),
      },
      {
        name: "Evil Corp.",
        logo: <TerminalIcon />,
        plan: t("free"),
      },
    ],
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
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
