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

import { routing } from "@/i18n/routing"

const FALLBACK_SITE_URL = "https://bondarukid.com"

export const SITE_URL =
  (typeof process.env.NEXT_PUBLIC_SITE_URL === "string" &&
    process.env.NEXT_PUBLIC_SITE_URL.trim()) ||
  FALLBACK_SITE_URL

export const LOCALES = routing.locales as readonly ["en", "uk", "ja"]
export const DEFAULT_LOCALE = routing.defaultLocale

/** Builds absolute URL for a path. With localePrefix "as-needed", default locale has no prefix. */
export function absoluteUrl(
  path: string,
  locale?: string | null
): string {
  const base = new URL(SITE_URL)
  const cleanPath = path.startsWith("/") ? path.slice(1) : path
  const prefix = locale && locale !== DEFAULT_LOCALE ? `${locale}/` : ""
  return `${base.origin}/${prefix}${cleanPath}`.replace(/\/+/g, "/")
}

export function getOgImageUrl(): string {
  return `${SITE_URL}/opengraph-image`
}
