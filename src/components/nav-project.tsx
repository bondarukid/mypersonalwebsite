"use client"

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

import { useTranslations } from "next-intl"
import { Link } from "@/i18n/routing"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { ArrowLeftIcon, LayoutIcon, SmartphoneIcon, HelpCircleIcon } from "lucide-react"
import type { Project } from "@/lib/supabase/projects"

interface NavProjectProps {
  project: Project
}

export function NavProject({ project }: NavProjectProps) {
  const t = useTranslations("dashboard.projectNav")

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>
        <Link href="/dashboard/projects" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeftIcon className="size-4" />
          {t("backToProjects")}
        </Link>
      </SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip={t("overview")} render={<Link href={`/dashboard/projects/${project.id}/overview`} />}>
            <LayoutIcon className="size-4" />
            <span>{t("overview")}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip={t("platforms")} render={<Link href={`/dashboard/projects/${project.id}/platforms`} />}>
            <SmartphoneIcon className="size-4" />
            <span>{t("platforms")}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip={t("faq")} render={<Link href={`/dashboard/projects/${project.id}/faq`} />}>
            <HelpCircleIcon className="size-4" />
            <span>{t("faq")}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
