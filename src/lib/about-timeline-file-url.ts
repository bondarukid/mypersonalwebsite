/*
 * Copyright (C) 2026 Ivan Bondaruk (https://bondarukid.com)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 */

const BUCKET = "about-timeline"

export function getAboutTimelineObjectPublicUrl(storagePath: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!base) return ""
  const p = storagePath.replace(/^\/+/, "")
  return `${base}/storage/v1/object/public/${BUCKET}/${p}`
}
