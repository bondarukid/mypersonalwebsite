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

import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { updateProject, canUserAccessProject } from "@/lib/supabase/projects"
import { uploadProjectIcon } from "@/lib/supabase/project-icon-storage"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const canAccess = await canUserAccessProject(user.id, projectId)
  if (!canAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const formData = await request.formData()
  const file = formData.get("icon") as File | null

  if (!file || !(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Icon file is required" }, { status: 400 })
  }

  const { path, error: uploadError } = await uploadProjectIcon(file, projectId)
  if (uploadError) {
    return NextResponse.json({ error: uploadError }, { status: 400 })
  }

  const { error } = await updateProject(projectId, { icon_path: path })
  if (error) {
    return NextResponse.json({ error }, { status: 500 })
  }

  return NextResponse.json({ path })
}
