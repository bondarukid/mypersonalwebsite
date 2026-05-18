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

export type FaqSet = {
  id: string
  slug: string
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
