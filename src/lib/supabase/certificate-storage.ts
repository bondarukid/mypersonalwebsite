/*
 * Copyright (C) 2026 Ivan Bondaruk (https://bondarukid.com)
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

const BUCKET = "certificates"
const MAX_WIDTH = 1200
const WEBP_QUALITY = 85
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
}

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"] as const

export async function uploadCertificateImageFromBuffer(
  buffer: Buffer,
  baseFilename: string,
  mimeType: string = "image/jpeg"
): Promise<{ path: string; error?: string }> {
  if (buffer.length > MAX_FILE_SIZE) {
    return { path: "", error: "File size must be under 5MB" }
  }
  if (!ALLOWED_MIME.includes(mimeType as (typeof ALLOWED_MIME)[number])) {
    return { path: "", error: "Only JPEG, PNG, and WebP images are allowed" }
  }

  const slug = slugify(baseFilename) || "certificate"
  const shortId = Math.random().toString(36).slice(2, 8)
  const path = `${slug}-${shortId}.webp`

  try {
    const processed = await sharp(buffer)
      .resize(MAX_WIDTH, undefined, { withoutEnlargement: true })
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

export async function uploadCertificateImage(
  file: File,
  baseFilename: string
): Promise<{ path: string; error?: string }> {
  if (file.size > MAX_FILE_SIZE) {
    return { path: "", error: "File size must be under 5MB" }
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { path: "", error: "Only JPEG, PNG, and WebP images are allowed" }
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const slug = slugify(baseFilename) || "certificate"
  const shortId = Math.random().toString(36).slice(2, 8)
  const path = `${slug}-${shortId}.webp`

  try {
    const processed = await sharp(buffer)
      .resize(MAX_WIDTH, undefined, { withoutEnlargement: true })
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

export async function deleteCertificateImage(path: string): Promise<{ error?: string }> {
  const supabase = createAdminClient()
  const { error } = await supabase.storage.from(BUCKET).remove([path])
  if (error) return { error: error.message }
  return {}
}
