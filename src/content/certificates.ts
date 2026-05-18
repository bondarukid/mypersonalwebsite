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

import type { Certificate } from "@/content/types"
import { CONTENT_TS } from "@/content/constants"

/**
 * Add rows per locale (en / uk / ja) or only `en` — other locales fall back to English.
 *
 * image_path options:
 * - File in repo: `my-cert.png` → served from `public/images/certificates/my-cert.png`
 * - Google Drive (file shared as “Anyone with the link”): use thumbnail URL, e.g.
 *   `https://drive.google.com/thumbnail?id=YOUR_FILE_ID&sz=w1200`
 * - Any HTTPS image URL (must be allowed in `next.config.ts` → `images.remotePatterns`).
 */
const certificates: Certificate[] = [
  {
    id: "cert-nextjs-supabase-mastery-2026",
    locale: "en",
    name: "Next.js & Supabase Mastery: Build 2 Full-Stack Apps",
    description:
      "This certificate above verifies that Ivan Bondaruk successfully completed the course Next.js & Supabase Mastery: Build 2 Full-Stack Apps on 03/07/2026 on Udemy. The certificate indicates the entire course was completed as validated by the student. The course length represents the total hours of the videos and article lectures of the course at the time of most recent completion.",
    issuer: "Udemy",
    credential_url:
      "https://drive.google.com/file/d/1y9CaQPzH17_E5_V7IdxsF8bV5SGv6OvR/view?usp=drive_link",
    image_path:
      "https://drive.google.com/thumbnail?id=1y9CaQPzH17_E5_V7IdxsF8bV5SGv6OvR&sz=w1200",
    date_obtained: "2026-03-07",
    sort_order: 0,
    created_at: CONTENT_TS,
  },
  {
    id: "cert-saas-sales-purchase-negotiation-2026",
    locale: "en",
    name: "SaaS Sales & Purchase Negotiation: Commercial Fundamentals",
    description:
      "This certificate above verifies that Ivan Bondaruk successfully completed the course SaaS Sales & Purchase Negotiation: Commercial Fundamentals on 01/27/2026 on Udemy. The certificate indicates the entire course was completed as validated by the student. The course length represents the total hours of the videos and article lectures of the course at the time of most recent completion.",
    issuer: "Udemy",
    credential_url:
      "https://drive.google.com/file/d/1MMogWLD6knQ-NwrI-BRNx86bZbLHeni_/view?usp=drive_link",
    image_path:
      "https://drive.google.com/thumbnail?id=1MMogWLD6knQ-NwrI-BRNx86bZbLHeni_&sz=w1200",
    date_obtained: "2026-01-27",
    sort_order: 1,
    created_at: CONTENT_TS,
  },
  {
    id: "cert-saas-metrics-fundamentals-2026",
    locale: "en",
    name: "SaaS Metrics Fundamentals for Managers, Founders & Investors",
    description:
      "This certificate above verifies that Ivan Bondaruk successfully completed the course SaaS Metrics Fundamentals for Managers, Founders & Investors on 01/27/2026 on Udemy. The certificate indicates the entire course was completed as validated by the student. The course length represents the total hours of the videos and article lectures of the course at the time of most recent completion.",
    issuer: "Udemy",
    credential_url:
      "https://drive.google.com/file/d/1W20oj2xlHucqIO_MYSY8HN2j1RcpS3NA/view?usp=drive_link",
    image_path:
      "https://drive.google.com/thumbnail?id=1W20oj2xlHucqIO_MYSY8HN2j1RcpS3NA&sz=w1200",
    date_obtained: "2026-01-27",
    sort_order: 2,
    created_at: CONTENT_TS,
  },
  {
    id: "cert-shadcn-ui-nextjs-dashboards-2026",
    locale: "en",
    name: "Shadcn UI & Next JS - Build beautiful dashboards with shadcn",
    description:
      "This certificate above verifies that Ivan Bondaruk successfully completed the course Shadcn UI & Next JS - Build beautiful dashboards with shadcn on 03/07/2026 on Udemy. The certificate indicates the entire course was completed as validated by the student. The course length represents the total hours of the videos and article lectures of the course at the time of most recent completion.",
    issuer: "Udemy",
    credential_url:
      "https://drive.google.com/file/d/1_QMPQuDOobGw5_emUH_fL22mcdxem4Qg/view?usp=drive_link",
    image_path:
      "https://drive.google.com/thumbnail?id=1_QMPQuDOobGw5_emUH_fL22mcdxem4Qg&sz=w1200",
    date_obtained: "2026-03-07",
    sort_order: 3,
    created_at: CONTENT_TS,
  },
  {
    id: "cert-essentials-saas-business-2026",
    locale: "en",
    name: "Essentials of Software-as-a-Service (SaaS) Business",
    description:
      "This certificate above verifies that Ivan Bondaruk successfully completed the course Essentials of Software-as-a-Service (SaaS) Business on 01/27/2026 on Udemy. The certificate indicates the entire course was completed as validated by the student. The course length represents the total hours of the videos and article lectures of the course at the time of most recent completion.",
    issuer: "Udemy",
    credential_url:
      "https://drive.google.com/file/d/1wfbkjfxXFBoUXgN5F5ihgVl7S7HHs__9/view?usp=drive_link",
    image_path:
      "https://drive.google.com/thumbnail?id=1wfbkjfxXFBoUXgN5F5ihgVl7S7HHs__9&sz=w1200",
    date_obtained: "2026-01-27",
    sort_order: 4,
    created_at: CONTENT_TS,
  },
]

export function getCertificatesForLocale(locale: string): Certificate[] {
  const direct = certificates.filter((c) => c.locale === locale)
  if (direct.length > 0) return [...direct].sort((a, b) => a.sort_order - b.sort_order)
  if (locale === "en") return []
  const fallback = certificates.filter((c) => c.locale === "en")
  return [...fallback].sort((a, b) => a.sort_order - b.sort_order)
}
