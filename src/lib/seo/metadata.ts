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

import type { Metadata } from "next"
import {
  SITE_URL,
  LOCALES,
  DEFAULT_LOCALE,
  getOgImageUrl,
  absoluteUrl,
} from "@/config/seo"

type Locale = (typeof LOCALES)[number]

const LOCALE_OG_MAP: Record<string, string> = {
  en: "en_US",
  uk: "uk_UA",
  ja: "ja_JP",
}

export type CreateMetadataOptions = {
  title: string
  description: string
  /** Path without leading slash, e.g. "about", "projects" */
  path: string
  /** Current request locale */
  locale: string
  /** Optional image URL override */
  image?: string
  /** Site name for Open Graph */
  siteName?: string
  /** Whether to index (false for auth/dashboard pages) */
  index?: boolean
}

export function createMetadata({
  title,
  description,
  path,
  locale,
  image,
  siteName = "Ivan Bondaruk",
  index = true,
}: CreateMetadataOptions): Metadata {
  const canonical = absoluteUrl(path, locale)
  const ogImage = image ?? getOgImageUrl()

  const alternates: Metadata["alternates"] = {
    canonical,
    languages: {} as Record<string, string>,
  }

  for (const loc of LOCALES) {
    alternates.languages![loc] = absoluteUrl(path, loc)
  }
  alternates.languages!["x-default"] = absoluteUrl(path, DEFAULT_LOCALE)

  return {
    title,
    description,
    metadataBase: new URL(SITE_URL),
    robots: index ? { index: true, follow: true } : { index: false, follow: false },
    alternates,
    openGraph: {
      type: "website",
      siteName,
      title,
      description,
      url: canonical,
      locale: LOCALE_OG_MAP[locale] ?? locale,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  }
}
