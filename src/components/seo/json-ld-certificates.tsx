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

import type { Certificate } from "@/lib/supabase/certificates"

function getCertificateImageUrl(imagePath: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!base) return ""
  return `${base}/storage/v1/object/public/certificates/${imagePath}`
}

/** Extracts issuing organization from certificate name when possible (e.g. "AWS Certified" -> "Amazon Web Services") */
function inferIssuer(name: string): string | undefined {
  const lower = name.toLowerCase()
  if (lower.includes("aws") || lower.includes("amazon")) return "Amazon Web Services"
  if (lower.includes("google") || lower.includes("gcp")) return "Google"
  if (lower.includes("microsoft") || lower.includes("azure")) return "Microsoft"
  if (lower.includes("meta") || lower.includes("facebook")) return "Meta"
  if (lower.includes("coursera")) return "Coursera"
  if (lower.includes("udemy")) return "Udemy"
  if (lower.includes("freecodecamp")) return "freeCodeCamp"
  return undefined
}

type CredentialSchema = {
  "@type": "EducationalOccupationalCredential"
  name: string
  datePublished?: string
  credentialCategory: string
  description?: string
  image?: string
  recognizedBy?: { "@type": "Organization"; name: string }
}

type ItemListSchema = {
  "@context": string
  "@type": "ItemList"
  itemListElement: Array<{
    "@type": "ListItem"
    position: number
    item: CredentialSchema
  }>
}

interface JsonLdCertificatesProps {
  certificates: Certificate[]
}

export function JsonLdCertificates({ certificates }: JsonLdCertificatesProps) {
  if (certificates.length === 0) return null

  const items: ItemListSchema["itemListElement"] = certificates.map(
    (cert, index) => {
      const credential: CredentialSchema = {
        "@type": "EducationalOccupationalCredential",
        name: cert.name,
        credentialCategory: "professional certification",
        ...(cert.description && { description: cert.description }),
        ...(cert.image_path && { image: getCertificateImageUrl(cert.image_path) }),
      }
      if (cert.date_obtained) {
        credential.datePublished = cert.date_obtained
      }
      const issuer = inferIssuer(cert.name)
      if (issuer) {
        credential.recognizedBy = { "@type": "Organization", name: issuer }
      }
      return {
        "@type": "ListItem" as const,
        position: index + 1,
        item: credential,
      }
    }
  )

  const schema: ItemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
