/*
 * Copyright (C) 2026 Ivan Bondaruk (https://bondarukid.com)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 */

import { createClient } from "./server"

const BUCKET = "about-timeline"
const MAX_SIZE_IMAGE = 8 * 1024 * 1024
const MAX_SIZE_FILE = 12 * 1024 * 1024

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
])

const FILE_TYPES = new Set([
  "application/pdf",
  "application/zip",
  "text/plain",
  "text/markdown",
  ...Array.from(IMAGE_TYPES),
])

function makePath(prefix: string, filename: string) {
  const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`
  const base = filename.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 80) || "file"
  return `${prefix.replace(/\/$/, "")}/${id}-${base}`
}

export type UploadAboutTimelineKind = "image" | "file"

export async function uploadAboutTimelineObject(
  file: File,
  folder: string,
  kind: UploadAboutTimelineKind
): Promise<{ path?: string; error?: string; publicUrl?: string }> {
  const isImage = kind === "image"
  const max = isImage ? MAX_SIZE_IMAGE : MAX_SIZE_FILE
  if (file.size > max) {
    return { error: isImage ? "Image is too large (8MB max)" : "File is too large (12MB max)" }
  }
  if (isImage && !IMAGE_TYPES.has(file.type)) {
    return { error: "Use JPEG, PNG, GIF, or WebP" }
  }
  if (!isImage && !FILE_TYPES.has(file.type) && !IMAGE_TYPES.has(file.type)) {
    return { error: "Unsupported file type" }
  }

  const supabase = await createClient()
  const path = makePath(folder, file.name)
  const { error: up } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type || "application/octet-stream" })
  if (up) return { error: up.message }
  return { path, publicUrl: getPublicUrl(path) }
}

function getPublicUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!base) return ""
  return `${base}/storage/v1/object/public/${BUCKET}/${path.replace(/^\/+/, "")}`
}
