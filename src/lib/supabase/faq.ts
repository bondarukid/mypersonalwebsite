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

import { createClient } from "./server"
import { ensureUserInLanding, getLandingCompany } from "./companies"

export type FaqSet = {
  id: string
  slug: string
  company_id: string
  project_id: string | null
  title_en: string | null
  title_uk: string | null
  title_ja: string | null
  support_blurb_en: string | null
  support_blurb_uk: string | null
  support_blurb_ja: string | null
  support_link: string | null
  support_link_text_en: string | null
  support_link_text_uk: string | null
  support_link_text_ja: string | null
  created_at: string
  updated_at: string
}

export type FaqItem = {
  id: string
  faq_set_id: string
  sort_order: number
  question_en: string
  question_uk: string
  question_ja: string
  answer_en: string
  answer_uk: string
  answer_ja: string
  icon: string
  created_at: string
}

const LOCALES = ["en", "uk", "ja"] as const
type Locale = (typeof LOCALES)[number]

function getLocalized(
  row: Record<string, unknown>,
  keyPrefix: string,
  locale: string
): string {
  const key = `${keyPrefix}_${locale}`
  const val = row[key]
  const fallback = row[`${keyPrefix}_en`]
  return (val ?? fallback ?? "") as string
}

export async function getFaqSetByProjectId(
  projectId: string
): Promise<FaqSet | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("faq_sets")
    .select("*")
    .eq("project_id", projectId)
    .maybeSingle()

  if (error || !data) return null
  return data as FaqSet
}

export async function getFaqSetBySlug(slug: string): Promise<FaqSet | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("faq_sets")
    .select("*")
    .eq("slug", slug)
    .maybeSingle()

  if (error || !data) return null
  return data as FaqSet
}

export async function getFaqSetById(id: string): Promise<FaqSet | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("faq_sets")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error || !data) return null
  return data as FaqSet
}

export async function getFaqItems(faqSetId: string): Promise<FaqItem[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("faq_items")
    .select("*")
    .eq("faq_set_id", faqSetId)
    .order("sort_order", { ascending: true })

  if (error) return []
  return (data ?? []) as FaqItem[]
}

export async function getLandingFaqSet(): Promise<FaqSet | null> {
  return getFaqSetBySlug("landing")
}

export function getFaqItemQuestion(item: FaqItem, locale: string): string {
  const loc = LOCALES.includes(locale as Locale) ? locale : "en"
  return getLocalized(item, "question", loc)
}

export function getFaqItemAnswer(item: FaqItem, locale: string): string {
  const loc = LOCALES.includes(locale as Locale) ? locale : "en"
  return getLocalized(item, "answer", loc)
}

export function getFaqSetTitle(set: FaqSet, locale: string): string {
  const loc = LOCALES.includes(locale as Locale) ? locale : "en"
  return getLocalized(set, "title", loc) || "Frequently Asked Questions"
}

export function getFaqSetSupportBlurb(set: FaqSet, locale: string): string {
  const loc = LOCALES.includes(locale as Locale) ? locale : "en"
  return getLocalized(set, "support_blurb", loc) || ""
}

export function getFaqSetSupportLinkText(set: FaqSet, locale: string): string {
  const loc = LOCALES.includes(locale as Locale) ? locale : "en"
  return getLocalized(set, "support_link_text", loc) || "customer support team"
}

export async function upsertLandingFaqSet(): Promise<FaqSet> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("Not signed in")
  }

  const membership = await ensureUserInLanding(user.id)
  if (membership.error) {
    throw new Error(membership.error)
  }

  const existing = await getFaqSetBySlug("landing")
  if (existing) return existing

  const landing = await getLandingCompany()
  if (!landing) {
    throw new Error("Landing company not found")
  }

  const { data, error } = await supabase
    .from("faq_sets")
    .insert({
      slug: "landing",
      company_id: landing.id,
      title_en: "Frequently Asked Questions",
      support_blurb_en: "Can't find what you're looking for? Contact our",
      support_link: "#",
      support_link_text_en: "customer support team",
    })
    .select("*")
    .single()

  if (error) throw new Error(error.message)
  return data as FaqSet
}

export async function updateFaqSet(
  id: string,
  updates: Partial<Pick<FaqSet, "title_en" | "title_uk" | "title_ja" | "support_blurb_en" | "support_blurb_uk" | "support_blurb_ja" | "support_link" | "support_link_text_en" | "support_link_text_uk" | "support_link_text_ja">>
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase
    .from("faq_sets")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) return { error: error.message }
  return {}
}

export async function createFaqItem(
  faqSetId: string,
  item: { question_en: string; question_uk?: string; question_ja?: string; answer_en: string; answer_uk?: string; answer_ja?: string; icon?: string; sort_order?: number }
): Promise<{ id?: string; error?: string }> {
  const supabase = await createClient()
  const { data: maxRow } = await supabase
    .from("faq_items")
    .select("sort_order")
    .eq("faq_set_id", faqSetId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle()
  const sortOrder = item.sort_order ?? (maxRow?.sort_order ?? -1) + 1

  const { data, error } = await supabase
    .from("faq_items")
    .insert({
      faq_set_id: faqSetId,
      question_en: item.question_en,
      question_uk: item.question_uk ?? item.question_en,
      question_ja: item.question_ja ?? item.question_en,
      answer_en: item.answer_en,
      answer_uk: item.answer_uk ?? item.answer_en,
      answer_ja: item.answer_ja ?? item.answer_en,
      icon: item.icon ?? "help-circle",
      sort_order: sortOrder,
    })
    .select("id")
    .single()

  if (error) return { error: error.message }
  return { id: data?.id }
}

export async function updateFaqItem(
  id: string,
  updates: Partial<Pick<FaqItem, "question_en" | "question_uk" | "question_ja" | "answer_en" | "answer_uk" | "answer_ja" | "icon" | "sort_order">>
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.from("faq_items").update(updates).eq("id", id)
  if (error) return { error: error.message }
  return {}
}

export async function deleteFaqItem(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.from("faq_items").delete().eq("id", id)
  if (error) return { error: error.message }
  return {}
}

export async function reorderFaqItems(
  faqSetId: string,
  itemIds: string[]
): Promise<{ error?: string }> {
  const supabase = await createClient()
  for (let i = 0; i < itemIds.length; i++) {
    const { error } = await supabase
      .from("faq_items")
      .update({ sort_order: i })
      .eq("id", itemIds[i])
      .eq("faq_set_id", faqSetId)
    if (error) return { error: error.message }
  }
  return {}
}
