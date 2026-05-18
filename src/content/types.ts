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

export type Company = {
  id: string
  name: string
  slug: string
  logo_url: string | null
  created_at: string
  created_by?: string | null
}

export type Project = {
  id: string
  name: string
  slug: string
  description: string | null
  icon_path: string | null
  itunes_bundle_id: string | null
  store_links: Record<string, string>
  platforms: Record<string, string[]>
  min_os_versions: Record<string, string>
  sort_order: number
  created_at: string
  updated_at: string
}

export type SocialLink = {
  id: string
  platform: string
  url: string
  enabled: boolean
  sort_order: number
  created_at: string
}

export type Testimonial = {
  id: string
  locale: string
  quote: string
  author: string
  role: string
  avatar_url: string | null
  /** When set (e.g. "SH"), only initials are shown instead of a photo. */
  avatar_initials: string | null
  sort_order: number
  created_at: string
}

export type Certificate = {
  id: string
  locale: string
  name: string
  description: string | null
  /** Relative filename under `public/images/certificates/`, site path `/...`, or full `https://` URL (e.g. Google Drive thumbnail). */
  image_path: string
  /** Issuing organization (shown in UI and JSON-LD). */
  issuer: string | null
  /** Public page to verify or view the credential (Coursera, Credly, etc.). */
  credential_url: string | null
  date_obtained: string
  sort_order: number
  created_at: string
}

export type { FaqSet, FaqItem } from "@/lib/faq-i18n"
