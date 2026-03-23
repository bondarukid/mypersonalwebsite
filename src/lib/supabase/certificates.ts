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

import { createClient } from "@/lib/supabase/server"

export type Certificate = {
  id: string
  locale: string
  name: string
  description: string | null
  image_path: string
  date_obtained: string
  sort_order: number
  created_at: string
}

export type CertificateGroup = {
  image_path: string
  date_obtained: string
  sort_order: number
  locales: Certificate[]
}

const LOCALES = ["en", "uk", "ja"] as const

const DEFAULT_LOCALE = "en"

export async function getCertificatesForLocale(
  locale: string
): Promise<Certificate[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) return []

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("certificates")
    .select("id, locale, name, description, image_path, date_obtained, sort_order, created_at")
    .eq("locale", locale)
    .order("sort_order", { ascending: true })

  if (error) return []

  const certs = (data ?? []) as Certificate[]
  if (certs.length > 0) return certs
  if (locale === DEFAULT_LOCALE) return []

  const { data: fallbackData, error: fallbackError } = await supabase
    .from("certificates")
    .select("id, locale, name, description, image_path, date_obtained, sort_order, created_at")
    .eq("locale", DEFAULT_LOCALE)
    .order("sort_order", { ascending: true })

  if (fallbackError) return []
  return (fallbackData ?? []) as Certificate[]
}

export async function getAllCertificatesForAdmin(): Promise<CertificateGroup[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("certificates")
    .select("id, locale, name, description, image_path, date_obtained, sort_order, created_at")
    .order("sort_order", { ascending: true })
    .order("locale")

  if (error) return []

  const grouped = new Map<string, CertificateGroup>()
  for (const cert of (data ?? []) as Certificate[]) {
    const key = cert.image_path
    const existing = grouped.get(key)
    if (existing) {
      existing.locales.push(cert)
    } else {
      grouped.set(key, {
        image_path: cert.image_path,
        date_obtained: cert.date_obtained,
        sort_order: cert.sort_order,
        locales: [cert],
      })
    }
  }
  return Array.from(grouped.values()).sort(
    (a, b) => a.sort_order - b.sort_order
  )
}

type CreateCertificateInput = {
  image_path: string
  date_obtained: string
  name_en: string
  name_uk?: string
  name_ja?: string
  description_en?: string
  description_uk?: string
  description_ja?: string
}

export async function createCertificate(
  input: CreateCertificateInput
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: maxRow } = await supabase
    .from("certificates")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle()
  const nextSortOrder = (maxRow?.sort_order ?? -1) + 1

  const nameUk = (input.name_uk ?? "").trim() || input.name_en
  const nameJa = (input.name_ja ?? "").trim() || input.name_en
  const descEn = input.description_en ?? ""
  const descUk = input.description_uk ?? ""
  const descJa = input.description_ja ?? ""

  const rows = LOCALES.map((locale) => ({
    locale,
    name:
      locale === "en"
        ? input.name_en
        : locale === "uk"
          ? nameUk
          : nameJa,
    description:
      locale === "en" ? descEn : locale === "uk" ? descUk : descJa,
    image_path: input.image_path,
    date_obtained: input.date_obtained,
    sort_order: nextSortOrder,
  }))

  const { error } = await supabase.from("certificates").insert(rows)

  if (error) return { error: error.message }
  return {}
}

export async function updateCertificate(
  id: string,
  updates: { name?: string; description?: string; date_obtained?: string }
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase
    .from("certificates")
    .update(updates)
    .eq("id", id)

  if (error) return { error: error.message }
  return {}
}

export async function updateCertificateGroupByImagePath(
  image_path: string,
  updates: {
    date_obtained?: string
    name_en?: string
    name_uk?: string
    name_ja?: string
    description_en?: string
    description_uk?: string
    description_ja?: string
  }
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const certs = await supabase
    .from("certificates")
    .select("id, locale")
    .eq("image_path", image_path)

  if (certs.error) return { error: certs.error.message }

  for (const c of certs.data ?? []) {
    const locale = c.locale as (typeof LOCALES)[number]
    const name =
      locale === "en"
        ? updates.name_en
        : locale === "uk"
          ? updates.name_uk
          : updates.name_ja
    const description =
      locale === "en"
        ? updates.description_en
        : locale === "uk"
          ? updates.description_uk
          : updates.description_ja

    const { error } = await supabase
      .from("certificates")
      .update({
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(updates.date_obtained !== undefined && {
          date_obtained: updates.date_obtained,
        }),
      })
      .eq("id", c.id)

    if (error) return { error: error.message }
  }
  return {}
}

export async function deleteCertificatesByImagePath(
  image_path: string
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase
    .from("certificates")
    .delete()
    .eq("image_path", image_path)

  if (error) return { error: error.message }
  return {}
}

export async function updateCertificateImagePath(
  oldPath: string,
  newPath: string
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase
    .from("certificates")
    .update({ image_path: newPath })
    .eq("image_path", oldPath)

  if (error) return { error: error.message }
  return {}
}
