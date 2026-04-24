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

import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getLocale, getTranslations } from "next-intl/server"
import { FolderCode } from "lucide-react"
import { Link } from "@/i18n/routing"
import { ProjectListCard } from "@/components/project-list-card"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import FooterSection from "@/components/footer"
import { createMetadata } from "@/lib/seo/metadata"
import { getLandingCompany } from "@/lib/supabase/companies"
import { getSocialLinks } from "@/lib/supabase/social-links"
import { getProjectsByCompanyId } from "@/lib/supabase/projects"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = await getTranslations("metadata")
  return createMetadata({
    title: t("projectsTitle"),
    description: t("projectsDescription"),
    path: "projects",
    locale,
  })
}

export default async function ProjectsPage() {
  const landing = await getLandingCompany()
  if (!landing) notFound()

  const tPage = await getTranslations("projectsPage")
  const tCommon = await getTranslations("common")
  const [projects, socialLinks] = await Promise.all([
    getProjectsByCompanyId(landing.id),
    getSocialLinks(),
  ])

  return (
    <div className="flex flex-1 flex-col">
      <div className="bg-gradient-to-b from-zinc-50/80 to-background dark:from-zinc-950/40 dark:to-background">
        <div className="mx-auto w-full max-w-5xl px-6 py-12 md:py-16">
          <header className="max-w-2xl text-balance">
            <h1 className="font-heading text-3xl font-bold tracking-tight text-zinc-950 md:text-4xl dark:text-zinc-50">
              {tPage("heading")}
            </h1>
            <p className="mt-3 text-pretty text-muted-foreground md:text-lg">
              {tPage("intro")}
            </p>
          </header>

          <div className="mt-10">
            {projects.length === 0 ? (
              <Empty className="min-h-[280px] border-2 border-dashed border-zinc-200/90 bg-muted/20 dark:border-zinc-700/80">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <FolderCode
                      className="size-4"
                      strokeWidth={1.75}
                      aria-hidden
                    />
                  </EmptyMedia>
                  <EmptyTitle className="text-base md:text-base">
                    {tPage("emptyTitle")}
                  </EmptyTitle>
                  <EmptyDescription>{tPage("emptyDescription")}</EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button
                    className="w-full max-w-xs"
                    render={<Link href="/" />}
                    nativeButton={false}
                  >
                    {tCommon("backToHome")}
                  </Button>
                </EmptyContent>
              </Empty>
            ) : (
              <section
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                aria-label={tPage("listAria")}
              >
                {projects.map((project, i) => (
                  <ProjectListCard
                    key={project.id}
                    project={project}
                    viewLabel={tPage("viewProject")}
                    priority={i === 0}
                  />
                ))}
              </section>
            )}
          </div>
        </div>
      </div>
      <FooterSection socialLinks={socialLinks} />
    </div>
  )
}
