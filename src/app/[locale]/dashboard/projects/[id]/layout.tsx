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

import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getProjectById } from "@/lib/supabase/projects"

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string; id: string }>
}) {
  const { id } = await params
  const project = await getProjectById(id)
  if (!project) return notFound()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return notFound()

  const { data: member } = await supabase
    .from("company_members")
    .select("id")
    .eq("company_id", project.company_id)
    .eq("user_id", user.id)
    .maybeSingle()

  if (!member) return notFound()

  return <>{children}</>
}
