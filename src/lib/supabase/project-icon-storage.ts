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

import sharp from "sharp"
import { createAdminClient } from "@/lib/supabase/admin"

const BUCKET = "project-icons"
const MAX_SIZE = 512
const WEBP_QUALITY = 90
const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"] as const

export async function uploadProjectIcon(
  file: File,
  projectId: string
): Promise<{ path: string; error?: string }> {
  if (file.size > MAX_FILE_SIZE) {
    return { path: "", error: "File size must be under 2MB" }
  }
  if (!ALLOWED_MIME.includes(file.type as (typeof ALLOWED_MIME)[number])) {
    return { path: "", error: "Only JPEG, PNG, and WebP images are allowed" }
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const path = `${projectId}/icon.webp`

  try {
    const processed = await sharp(buffer)
      .resize(MAX_SIZE, MAX_SIZE, { fit: "cover" })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer()

    const supabase = createAdminClient()
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, processed, { contentType: "image/webp", upsert: true })

    if (error) return { path: "", error: error.message }
    return { path }
  } catch (err) {
    return {
      path: "",
      error: err instanceof Error ? err.message : "Failed to process image",
    }
  }
}
