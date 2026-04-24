"use server"

/*
 * Copyright (C) 2026 Ivan Bondaruk (https://bondarukid.com)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 */

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { getLandingCompany } from "@/lib/supabase/companies"
import { routing } from "@/i18n/routing"
import { isLandingFeatureLucideKey } from "@/config/landing-feature-icons"
import { isTechStackIconSlug } from "@/config/tech-stack-icons"
import {
  upsertLandingFeatureSection,
  getLandingFeatureCards,
  createLandingFeatureCard,
  updateLandingFeatureCard,
  deleteLandingFeatureCard,
  reorderLandingFeatureCards,
  upsertLandingTechStackSection,
  createLandingTechStackItem,
  updateLandingTechStackItem,
  deleteLandingTechStackItem,
  reorderLandingTechStackItemsInCategory,
  getLandingTechStackItems,
  getLandingTechStackCategories,
  createLandingTechStackCategory,
  updateLandingTechStackCategory,
  deleteLandingTechStackCategory,
  reorderLandingTechStackCategories,
} from "@/lib/supabase/landing-home"

async function getLandingCompanyIdForUser(): Promise<{
  companyId: string | null
  error?: string
}> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { companyId: null, error: "Not authenticated" }

  const landing = await getLandingCompany()
  if (!landing) return { companyId: null, error: "Landing company not found" }

  const { data: member } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("company_id", landing.id)
    .eq("user_id", user.id)
    .maybeSingle()

  if (!member)
    return { companyId: null, error: "Not a member of landing company" }
  return { companyId: landing.id }
}

function revalidateLandingHome() {
  revalidatePath("/", "page")
  revalidatePath("/dashboard/landing-home", "page")
  for (const locale of routing.locales) {
    const prefix = locale === routing.defaultLocale ? "" : `/${locale}`
    revalidatePath(`${prefix || ""}/`, "page")
    revalidatePath(
      `${prefix || ""}/dashboard/landing-home`,
      "page"
    )
  }
}

const trilingual = z.string()

const featureSectionSchema = z.object({
  heading_en: trilingual,
  heading_uk: trilingual,
  heading_ja: trilingual,
  intro_en: trilingual,
  intro_uk: trilingual,
  intro_ja: trilingual,
})

const lucideKeySchema = z.string().refine(
  (s) => isLandingFeatureLucideKey(s),
  "Invalid feature icon"
)

const featureCardCreateSchema = z.object({
  lucide_icon: lucideKeySchema,
  title_en: trilingual,
  title_uk: trilingual,
  title_ja: trilingual,
  body_en: trilingual,
  body_uk: trilingual,
  body_ja: trilingual,
})

const featureCardUpdateSchema = z.object({
  id: z.string().uuid(),
  sort_order: z.coerce.number().int().min(0).optional(),
  lucide_icon: lucideKeySchema.optional(),
  title_en: trilingual.optional(),
  title_uk: trilingual.optional(),
  title_ja: trilingual.optional(),
  body_en: trilingual.optional(),
  body_uk: trilingual.optional(),
  body_ja: trilingual.optional(),
})

const techStackSectionSchema = z.object({
  heading_en: trilingual,
  heading_uk: trilingual,
  heading_ja: trilingual,
  subcopy_en: trilingual,
  subcopy_uk: trilingual,
  subcopy_ja: trilingual,
  learn_more_en: trilingual,
  learn_more_uk: trilingual,
  learn_more_ja: trilingual,
})

const techItemSlug = z
  .string()
  .refine((s) => isTechStackIconSlug(s), "Invalid technology icon")

const techItemCreateSchema = z.object({
  category_id: z.string().uuid(),
  simple_icon_slug: techItemSlug,
  title_en: trilingual,
  title_uk: trilingual,
  title_ja: trilingual,
  desc_en: trilingual,
  desc_uk: trilingual,
  desc_ja: trilingual,
})

const techItemUpdateSchema = z.object({
  id: z.string().uuid(),
  category_id: z.string().uuid().optional(),
  sort_order: z.coerce.number().int().min(0).optional(),
  simple_icon_slug: techItemSlug.optional(),
  title_en: trilingual.optional(),
  title_uk: trilingual.optional(),
  title_ja: trilingual.optional(),
  desc_en: trilingual.optional(),
  desc_uk: trilingual.optional(),
  desc_ja: trilingual.optional(),
})

const categoryCreateSchema = z.object({
  label_en: trilingual,
  label_uk: trilingual,
  label_ja: trilingual,
})

const categoryUpdateSchema = z.object({
  id: z.string().uuid(),
  sort_order: z.coerce.number().int().min(0).optional(),
  label_en: trilingual.optional(),
  label_uk: trilingual.optional(),
  label_ja: trilingual.optional(),
})

export async function saveFeatureSectionAction(
  raw: z.infer<typeof featureSectionSchema>
): Promise<{ error?: string }> {
  const { companyId, error } = await getLandingCompanyIdForUser()
  if (!companyId) return { error: error ?? "Forbidden" }
  const p = featureSectionSchema.safeParse(raw)
  if (!p.success) return { error: p.error.issues[0]?.message ?? "Invalid" }
  const e = await upsertLandingFeatureSection(companyId, p.data)
  if (e.error) return e
  revalidateLandingHome()
  return {}
}

export async function createFeatureCardAction(
  raw: z.infer<typeof featureCardCreateSchema>
): Promise<{ id?: string; error?: string }> {
  const { companyId, error } = await getLandingCompanyIdForUser()
  if (!companyId) return { error: error ?? "Forbidden" }
  const p = featureCardCreateSchema.safeParse(raw)
  if (!p.success) return { error: p.error.issues[0]?.message ?? "Invalid" }
  const cards = await getLandingFeatureCards(companyId)
  const maxOrder = cards.reduce((m, c) => Math.max(m, c.sort_order), -1)
  const r = await createLandingFeatureCard(companyId, {
    sort_order: maxOrder + 1,
    ...p.data,
  })
  if (r.error) return { error: r.error }
  revalidateLandingHome()
  return { id: r.id }
}

export async function updateFeatureCardAction(
  raw: z.infer<typeof featureCardUpdateSchema>
): Promise<{ error?: string }> {
  const { companyId, error } = await getLandingCompanyIdForUser()
  if (!companyId) return { error: error ?? "Forbidden" }
  const p = featureCardUpdateSchema.safeParse(raw)
  if (!p.success) return { error: p.error.issues[0]?.message ?? "Invalid" }
  const { id, ...rest } = p.data
  const e = await updateLandingFeatureCard(id, rest)
  if (e.error) return e
  revalidateLandingHome()
  return {}
}

export async function deleteFeatureCardAction(id: string): Promise<{
  error?: string
}> {
  const { companyId, error } = await getLandingCompanyIdForUser()
  if (!companyId) return { error: error ?? "Forbidden" }
  const e = await deleteLandingFeatureCard(id)
  if (e.error) return e
  revalidateLandingHome()
  return {}
}

export async function reorderFeatureCardsAction(
  orderedIds: string[]
): Promise<{ error?: string }> {
  const { companyId, error } = await getLandingCompanyIdForUser()
  if (!companyId) return { error: error ?? "Forbidden" }
  const e = await reorderLandingFeatureCards(companyId, orderedIds)
  if (e.error) return e
  revalidateLandingHome()
  return {}
}

export async function saveTechStackSectionAction(
  raw: z.infer<typeof techStackSectionSchema>
): Promise<{ error?: string }> {
  const { companyId, error } = await getLandingCompanyIdForUser()
  if (!companyId) return { error: error ?? "Forbidden" }
  const p = techStackSectionSchema.safeParse(raw)
  if (!p.success) return { error: p.error.issues[0]?.message ?? "Invalid" }
  const e = await upsertLandingTechStackSection(companyId, p.data)
  if (e.error) return e
  revalidateLandingHome()
  return {}
}

export async function createTechCategoryAction(
  raw: z.infer<typeof categoryCreateSchema>
): Promise<{ id?: string; error?: string }> {
  const { companyId, error } = await getLandingCompanyIdForUser()
  if (!companyId) return { error: error ?? "Forbidden" }
  const p = categoryCreateSchema.safeParse(raw)
  if (!p.success) return { error: p.error.issues[0]?.message ?? "Invalid" }
  const cats = await getLandingTechStackCategories(companyId)
  const maxOrder = cats.reduce((m, c) => Math.max(m, c.sort_order), -1)
  const r = await createLandingTechStackCategory(companyId, {
    sort_order: maxOrder + 1,
    ...p.data,
  })
  if (r.error) return { error: r.error }
  revalidateLandingHome()
  return { id: r.id }
}

export async function updateTechCategoryAction(
  raw: z.infer<typeof categoryUpdateSchema>
): Promise<{ error?: string }> {
  const { companyId, error } = await getLandingCompanyIdForUser()
  if (!companyId) return { error: error ?? "Forbidden" }
  const p = categoryUpdateSchema.safeParse(raw)
  if (!p.success) return { error: p.error.issues[0]?.message ?? "Invalid" }
  const { id, ...rest } = p.data
  const e = await updateLandingTechStackCategory(id, rest)
  if (e.error) return e
  revalidateLandingHome()
  return {}
}

export async function deleteTechCategoryAction(id: string): Promise<{
  error?: string
}> {
  const { companyId, error } = await getLandingCompanyIdForUser()
  if (!companyId) return { error: error ?? "Forbidden" }
  const e = await deleteLandingTechStackCategory(id)
  if (e.error) return e
  revalidateLandingHome()
  return {}
}

export async function reorderTechCategoriesAction(
  orderedIds: string[]
): Promise<{ error?: string }> {
  const { companyId, error } = await getLandingCompanyIdForUser()
  if (!companyId) return { error: error ?? "Forbidden" }
  const e = await reorderLandingTechStackCategories(companyId, orderedIds)
  if (e.error) return e
  revalidateLandingHome()
  return {}
}

export async function createTechItemAction(
  raw: z.infer<typeof techItemCreateSchema>
): Promise<{ id?: string; error?: string }> {
  const { companyId, error } = await getLandingCompanyIdForUser()
  if (!companyId) return { error: error ?? "Forbidden" }
  const p = techItemCreateSchema.safeParse(raw)
  if (!p.success) return { error: p.error.issues[0]?.message ?? "Invalid" }
  const all = await getLandingTechStackItems(companyId)
  const inCat = all.filter((x) => x.category_id === p.data.category_id)
  const maxOrder = inCat.reduce((m, c) => Math.max(m, c.sort_order), -1)
  const r = await createLandingTechStackItem(companyId, {
    ...p.data,
    sort_order: maxOrder + 1,
  })
  if (r.error) return { error: r.error }
  revalidateLandingHome()
  return { id: r.id }
}

export async function updateTechItemAction(
  raw: z.infer<typeof techItemUpdateSchema>
): Promise<{ error?: string }> {
  const { companyId, error } = await getLandingCompanyIdForUser()
  if (!companyId) return { error: error ?? "Forbidden" }
  const p = techItemUpdateSchema.safeParse(raw)
  if (!p.success) return { error: p.error.issues[0]?.message ?? "Invalid" }
  const { id, ...rest } = p.data
  const e = await updateLandingTechStackItem(id, rest)
  if (e.error) return e
  revalidateLandingHome()
  return {}
}

export async function deleteTechItemAction(id: string): Promise<{
  error?: string
}> {
  const { companyId, error } = await getLandingCompanyIdForUser()
  if (!companyId) return { error: error ?? "Forbidden" }
  const e = await deleteLandingTechStackItem(id)
  if (e.error) return e
  revalidateLandingHome()
  return {}
}

export async function reorderTechItemsInCategoryAction(
  categoryId: string,
  orderedIds: string[]
): Promise<{ error?: string }> {
  const { companyId, error } = await getLandingCompanyIdForUser()
  if (!companyId) return { error: error ?? "Forbidden" }
  const cats = await getLandingTechStackCategories(companyId)
  if (!cats.some((c) => c.id === categoryId)) {
    return { error: "Invalid category" }
  }
  const e = await reorderLandingTechStackItemsInCategory(
    companyId,
    categoryId,
    orderedIds
  )
  if (e.error) return e
  revalidateLandingHome()
  return {}
}
