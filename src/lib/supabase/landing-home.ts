/*
 * Copyright (C) 2026 Ivan Bondaruk (https://bondarukid.com)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 */

export * from "./landing-home-i18n"

import { createClient } from "./server"
import type {
  LandingFeatureSectionRow,
  LandingFeatureCardRow,
  LandingTechStackSectionRow,
  LandingTechStackCategoryRow,
  LandingTechStackItemRow,
} from "./landing-home-i18n"

export async function getLandingFeatureSection(
  companyId: string
): Promise<LandingFeatureSectionRow | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("landing_feature_section")
    .select("*")
    .eq("company_id", companyId)
    .maybeSingle()
  if (error || !data) return null
  return data as LandingFeatureSectionRow
}

export async function getLandingFeatureCards(
  companyId: string
): Promise<LandingFeatureCardRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("landing_feature_cards")
    .select("*")
    .eq("company_id", companyId)
    .order("sort_order", { ascending: true })
  if (error) return []
  return (data ?? []) as LandingFeatureCardRow[]
}

export async function getLandingTechStackSection(
  companyId: string
): Promise<LandingTechStackSectionRow | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("landing_tech_stack_section")
    .select("*")
    .eq("company_id", companyId)
    .maybeSingle()
  if (error || !data) return null
  return data as LandingTechStackSectionRow
}

export async function getLandingTechStackItems(
  companyId: string
): Promise<LandingTechStackItemRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("landing_tech_stack_items")
    .select("*")
    .eq("company_id", companyId)
  if (error) return []
  return (data ?? []) as LandingTechStackItemRow[]
}

export async function getLandingTechStackCategories(
  companyId: string
): Promise<LandingTechStackCategoryRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("landing_tech_stack_categories")
    .select("*")
    .eq("company_id", companyId)
    .order("sort_order", { ascending: true })
  if (error) return []
  return (data ?? []) as LandingTechStackCategoryRow[]
}

// --- writes (used from server actions with authenticated client / RLS) ---

export async function upsertLandingFeatureSection(
  companyId: string,
  data: {
    heading_en: string
    heading_uk: string
    heading_ja: string
    intro_en: string
    intro_uk: string
    intro_ja: string
  }
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.from("landing_feature_section").upsert(
    { company_id: companyId, ...data, updated_at: new Date().toISOString() },
    { onConflict: "company_id" }
  )
  return error ? { error: error.message } : {}
}

export async function createLandingFeatureCard(
  companyId: string,
  data: {
    sort_order: number
    lucide_icon: string
    title_en: string
    title_uk: string
    title_ja: string
    body_en: string
    body_uk: string
    body_ja: string
  }
): Promise<{ id?: string; error?: string }> {
  const supabase = await createClient()
  const { data: row, error } = await supabase
    .from("landing_feature_cards")
    .insert({ company_id: companyId, ...data })
    .select("id")
    .single()
  if (error) return { error: error.message }
  return { id: row.id }
}

export async function updateLandingFeatureCard(
  id: string,
  data: Partial<{
    sort_order: number
    lucide_icon: string
    title_en: string
    title_uk: string
    title_ja: string
    body_en: string
    body_uk: string
    body_ja: string
  }>
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase
    .from("landing_feature_cards")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id)
  return error ? { error: error.message } : {}
}

export async function deleteLandingFeatureCard(id: string): Promise<{
  error?: string
}> {
  const supabase = await createClient()
  const { error } = await supabase.from("landing_feature_cards").delete().eq("id", id)
  return error ? { error: error.message } : {}
}

export async function reorderLandingFeatureCards(
  companyId: string,
  orderedIds: string[]
): Promise<{ error?: string }> {
  const supabase = await createClient()
  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabase
      .from("landing_feature_cards")
      .update({ sort_order: i, updated_at: new Date().toISOString() })
      .eq("id", orderedIds[i])
      .eq("company_id", companyId)
    if (error) return { error: error.message }
  }
  return {}
}

export async function upsertLandingTechStackSection(
  companyId: string,
  data: Partial<
    Pick<
      LandingTechStackSectionRow,
      | "heading_en"
      | "heading_uk"
      | "heading_ja"
      | "subcopy_en"
      | "subcopy_uk"
      | "subcopy_ja"
      | "learn_more_en"
      | "learn_more_uk"
      | "learn_more_ja"
    >
  >
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.from("landing_tech_stack_section").upsert(
    {
      company_id: companyId,
      ...data,
      updated_at: new Date().toISOString(),
    } as Record<string, unknown>,
    { onConflict: "company_id" }
  )
  return error ? { error: error.message } : {}
}

export async function createLandingTechStackItem(
  companyId: string,
  data: {
    category_id: string
    sort_order: number
    simple_icon_slug: string
    title_en: string
    title_uk: string
    title_ja: string
    desc_en: string
    desc_uk: string
    desc_ja: string
  }
): Promise<{ id?: string; error?: string }> {
  const supabase = await createClient()
  const { data: row, error } = await supabase
    .from("landing_tech_stack_items")
    .insert({ company_id: companyId, ...data })
    .select("id")
    .single()
  if (error) return { error: error.message }
  return { id: row.id }
}

export async function updateLandingTechStackItem(
  id: string,
  data: Partial<{
    category_id: string
    sort_order: number
    simple_icon_slug: string
    title_en: string
    title_uk: string
    title_ja: string
    desc_en: string
    desc_uk: string
    desc_ja: string
  }>
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase
    .from("landing_tech_stack_items")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id)
  return error ? { error: error.message } : {}
}

export async function deleteLandingTechStackItem(
  id: string
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase
    .from("landing_tech_stack_items")
    .delete()
    .eq("id", id)
  return error ? { error: error.message } : {}
}

export async function reorderLandingTechStackItemsInCategory(
  companyId: string,
  categoryId: string,
  orderedIds: string[]
): Promise<{ error?: string }> {
  const supabase = await createClient()
  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabase
      .from("landing_tech_stack_items")
      .update({ sort_order: i, updated_at: new Date().toISOString() })
      .eq("id", orderedIds[i])
      .eq("company_id", companyId)
      .eq("category_id", categoryId)
    if (error) return { error: error.message }
  }
  return {}
}

export async function createLandingTechStackCategory(
  companyId: string,
  data: {
    sort_order: number
    label_en: string
    label_uk: string
    label_ja: string
  }
): Promise<{ id?: string; error?: string }> {
  const supabase = await createClient()
  const { data: row, error } = await supabase
    .from("landing_tech_stack_categories")
    .insert({ company_id: companyId, ...data })
    .select("id")
    .single()
  if (error) return { error: error.message }
  return { id: row.id }
}

export async function updateLandingTechStackCategory(
  id: string,
  data: Partial<{
    sort_order: number
    label_en: string
    label_uk: string
    label_ja: string
  }>
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase
    .from("landing_tech_stack_categories")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id)
  return error ? { error: error.message } : {}
}

export async function deleteLandingTechStackCategory(
  id: string
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase
    .from("landing_tech_stack_categories")
    .delete()
    .eq("id", id)
  return error ? { error: error.message } : {}
}

export async function reorderLandingTechStackCategories(
  companyId: string,
  orderedIds: string[]
): Promise<{ error?: string }> {
  const supabase = await createClient()
  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabase
      .from("landing_tech_stack_categories")
      .update({ sort_order: i, updated_at: new Date().toISOString() })
      .eq("id", orderedIds[i])
      .eq("company_id", companyId)
    if (error) return { error: error.message }
  }
  return {}
}
