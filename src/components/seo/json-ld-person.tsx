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

import { getSocialLinks } from "@/lib/supabase/social-links"
import { SITE_URL, getOgImageUrl } from "@/config/seo"

type PersonSchema = {
  "@context": string
  "@type": string
  name: string
  jobTitle: string
  url: string
  image: string
  description: string
  sameAs: string[]
}

export async function JsonLdPerson() {
  const socialLinks = await getSocialLinks()
  const sameAs = socialLinks
    .map((l) => l.url)
    .filter((url) => url && url !== "#" && url.startsWith("http"))

  const schema: PersonSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Ivan Bondaruk",
    jobTitle: "Software Developer",
    url: SITE_URL,
    image: getOgImageUrl(),
    description:
      "Full-stack developer building modern web applications. React, Next.js, TypeScript. Browse projects, skills & contact.",
    sameAs,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
