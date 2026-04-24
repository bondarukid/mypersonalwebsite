/*
 * Copyright (C) 2026 Ivan Bondaruk (https://bondarukid.com)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * Server-free helpers for landing home data (safe to import from Client Components).
 */

/** @deprecated only for i18n fallback when DB has no categories */
export const LEGACY_TECH_STACK_TAB_KEYS = [
  "mobile",
  "web",
  "ides",
  "robotics",
] as const
export type LegacyTechStackTabId = (typeof LEGACY_TECH_STACK_TAB_KEYS)[number]

export type LandingFeatureSectionRow = {
  company_id: string
  heading_en: string
  heading_uk: string
  heading_ja: string
  intro_en: string
  intro_uk: string
  intro_ja: string
  created_at: string
  updated_at: string
}

export type LandingFeatureCardRow = {
  id: string
  company_id: string
  sort_order: number
  lucide_icon: string
  title_en: string
  title_uk: string
  title_ja: string
  body_en: string
  body_uk: string
  body_ja: string
  created_at: string
  updated_at: string
}

export type LandingTechStackSectionRow = {
  company_id: string
  heading_en: string
  heading_uk: string
  heading_ja: string
  subcopy_en: string
  subcopy_uk: string
  subcopy_ja: string
  learn_more_en: string
  learn_more_uk: string
  learn_more_ja: string
  created_at: string
  updated_at: string
}

export type LandingTechStackCategoryRow = {
  id: string
  company_id: string
  sort_order: number
  label_en: string
  label_uk: string
  label_ja: string
  created_at: string
  updated_at: string
}

export type LandingTechStackItemRow = {
  id: string
  company_id: string
  category_id: string
  sort_order: number
  simple_icon_slug: string
  title_en: string
  title_uk: string
  title_ja: string
  desc_en: string
  desc_uk: string
  desc_ja: string
  created_at: string
  updated_at: string
}

function pickLocalized(
  row: Record<string, unknown>,
  keyPrefix: string,
  locale: string
): string {
  const key = `${keyPrefix}_${locale}`
  const v = row[key] ?? row[`${keyPrefix}_en`]
  return typeof v === "string" ? v : ""
}

export function getLocalizedSectionHeadingIntro(
  row: LandingFeatureSectionRow,
  locale: string
): { heading: string; intro: string } {
  const o = row as unknown as Record<string, unknown>
  return {
    heading: pickLocalized(o, "heading", locale),
    intro: pickLocalized(o, "intro", locale),
  }
}

export function getLocalizedFeatureCard(
  row: LandingFeatureCardRow,
  locale: string
): { title: string; body: string; lucide_icon: string } {
  const o = row as unknown as Record<string, unknown>
  return {
    title: pickLocalized(o, "title", locale),
    body: pickLocalized(o, "body", locale),
    lucide_icon: row.lucide_icon,
  }
}

export function getLocalizedTechStackSection(
  row: LandingTechStackSectionRow,
  locale: string
): {
  heading: string
  subcopy: string
  learnMore: string
} {
  const o = row as unknown as Record<string, unknown>
  return {
    heading: pickLocalized(o, "heading", locale),
    subcopy: pickLocalized(o, "subcopy", locale),
    learnMore: pickLocalized(o, "learn_more", locale),
  }
}

export function getLocalizedCategoryLabel(
  row: LandingTechStackCategoryRow,
  locale: string
): string {
  const o = row as unknown as Record<string, unknown>
  return pickLocalized(o, "label", locale)
}

export function getLocalizedTechItem(
  row: LandingTechStackItemRow,
  locale: string
): { title: string; description: string; simple_icon_slug: string } {
  const o = row as unknown as Record<string, unknown>
  return {
    title: pickLocalized(o, "title", locale),
    description: pickLocalized(o, "desc", locale),
    simple_icon_slug: row.simple_icon_slug,
  }
}

export function groupTechStackItemsByCategory(
  items: LandingTechStackItemRow[]
): Map<string, LandingTechStackItemRow[]> {
  const m = new Map<string, LandingTechStackItemRow[]>()
  for (const item of items) {
    const k = item.category_id
    const list = m.get(k) ?? []
    list.push(item)
    m.set(k, list)
  }
  for (const list of m.values()) {
    list.sort((a, b) => a.sort_order - b.sort_order)
  }
  return m
}
