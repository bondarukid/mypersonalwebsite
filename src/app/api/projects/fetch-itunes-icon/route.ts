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
import { createAdminClient } from "@/lib/supabase/admin"

const ITUNES_LOOKUP = "https://itunes.apple.com/lookup"
const BUCKET = "project-icons"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const bundleId = searchParams.get("bundleId")

  if (!bundleId?.trim()) {
    return NextResponse.json({ error: "bundleId is required" }, { status: 400 })
  }

  const res = await fetch(
    `${ITUNES_LOOKUP}?bundleId=${encodeURIComponent(bundleId)}`
  )
  const data = await res.json()

  const result = data.results?.[0]
  if (!result?.artworkUrl512) {
    return NextResponse.json(
      { error: "App not found or no artwork available" },
      { status: 404 }
    )
  }

  return NextResponse.json({
    imageUrl: result.artworkUrl512,
    trackName: result.trackName,
  })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { bundleId, projectId } = body as { bundleId?: string; projectId?: string }

  if (!bundleId?.trim() || !projectId) {
    return NextResponse.json(
      { error: "bundleId and projectId are required" },
      { status: 400 }
    )
  }

  const canAccess = await canUserAccessProject(user.id, projectId)
  if (!canAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const lookupRes = await fetch(
    `${ITUNES_LOOKUP}?bundleId=${encodeURIComponent(bundleId)}`
  )
  const lookupData = await lookupRes.json()
  const result = lookupData.results?.[0]
  if (!result?.artworkUrl512) {
    return NextResponse.json(
      { error: "App not found or no artwork available" },
      { status: 404 }
    )
  }

  const imageRes = await fetch(result.artworkUrl512)
  const buffer = Buffer.from(await imageRes.arrayBuffer())
  const path = `${projectId}/icon.webp`

  const admin = createAdminClient()
  const { error: uploadError } = await admin.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: "image/webp", upsert: true })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { error } = await updateProject(projectId, {
    icon_path: path,
    itunes_bundle_id: bundleId.trim(),
  })
  if (error) {
    return NextResponse.json({ error }, { status: 500 })
  }

  return NextResponse.json({ path })
}
