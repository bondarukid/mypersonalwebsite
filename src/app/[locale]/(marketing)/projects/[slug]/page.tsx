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
import { getLocale } from "next-intl/server"
import { createMetadata } from "@/lib/seo/metadata"
import { getLandingCompany } from "@/lib/supabase/companies"
import {
  getProjectBySlug,
} from "@/lib/supabase/projects"
import { getFaqSetByProjectId } from "@/lib/supabase/faq"
import { ProjectHero } from "@/components/project-hero"
import { FAQSection } from "@/components/faq-section"

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const locale = await getLocale()
  const landing = await getLandingCompany()
  if (!landing) return {}

  const project = await getProjectBySlug(slug, landing.id)
  if (!project) return {}

  const description =
    project.description?.slice(0, 160) ?? `Project: ${project.name}`

  return createMetadata({
    title: project.name,
    description,
    path: `projects/${project.slug}`,
    locale,
  })
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params
  const landing = await getLandingCompany()
  if (!landing) notFound()

  const project = await getProjectBySlug(slug, landing.id)
  if (!project) notFound()

  const faqSet = await getFaqSetByProjectId(project.id)

  return (
    <main className="flex flex-1 flex-col">
      <ProjectHero project={project} />
      {faqSet && <FAQSection faqSetId={faqSet.id} />}
    </main>
  )
}
