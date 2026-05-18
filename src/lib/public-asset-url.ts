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

/**
 * Maps a short storage-style key or a site path to a URL usable by Next/Image.
 * Keys are served from `public/images/<subdir>/`.
 */
export function publicImageUrl(subdir: string, path: string | null): string {
  if (!path) return ""
  const p = path.trim()
  if (!p) return ""
  if (p.startsWith("http://") || p.startsWith("https://")) return p
  if (p.startsWith("/")) return p
  return `/images/${subdir}/${p.replace(/^\/+/, "")}`
}
