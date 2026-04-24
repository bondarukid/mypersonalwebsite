"use server"

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

import { z } from "zod"
import { revalidatePath } from "next/cache"
import {
  upsertLandingFaqSet,
  updateFaqSet,
  createFaqItem,
  updateFaqItem,
  deleteFaqItem,
  reorderFaqItems,
  getFaqSetById,
} from "@/lib/supabase/faq"
import { getProjectById } from "@/lib/supabase/projects"
import { routing } from "@/i18n/routing"

export async function ensureLandingFaqSetAction(): Promise<{ error?: string }> {
  try {
    await upsertLandingFaqSet()
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to create FAQ set" }
  }
}

export async function updateFaqSetAction(
  faqSetId: string,
  updates: {
    title_en?: string
    title_uk?: string
    title_ja?: string
    support_blurb_en?: string
    support_blurb_uk?: string
    support_blurb_ja?: string
    support_link?: string
    support_link_text_en?: string
    support_link_text_uk?: string
    support_link_text_ja?: string
  }
): Promise<{ error?: string }> {
  const { error } = await updateFaqSet(faqSetId, updates)
  if (error) return { error }
  await revalidatePaths(faqSetId)
  return {}
}

const createFaqItemSchema = z.object({
  question_en: z.string().min(1, "Question (EN) is required"),
  question_uk: z.string().optional(),
  question_ja: z.string().optional(),
  answer_en: z.string().min(1, "Answer (EN) is required"),
  answer_uk: z.string().optional(),
  answer_ja: z.string().optional(),
  icon: z.string().optional(),
})

export async function createFaqItemAction(
  faqSetId: string,
  item: z.infer<typeof createFaqItemSchema>
): Promise<{ id?: string; error?: string }> {
  const parsed = createFaqItemSchema.safeParse(item)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Validation failed" }
  }
  const result = await createFaqItem(faqSetId, parsed.data)
  if (result.error) return { error: result.error }
  await revalidatePaths(faqSetId)
  return { id: result.id }
}

export async function updateFaqItemAction(
  itemId: string,
  faqSetId: string,
  updates: {
    question_en?: string
    question_uk?: string
    question_ja?: string
    answer_en?: string
    answer_uk?: string
    answer_ja?: string
    icon?: string
    sort_order?: number
  }
): Promise<{ error?: string }> {
  const { error } = await updateFaqItem(itemId, updates)
  if (error) return { error }
  await revalidatePaths(faqSetId)
  return {}
}

export async function deleteFaqItemAction(
  itemId: string,
  faqSetId: string
): Promise<{ error?: string }> {
  const { error } = await deleteFaqItem(itemId)
  if (error) return { error }
  await revalidatePaths(faqSetId)
  return {}
}

export async function reorderFaqItemsAction(
  faqSetId: string,
  itemIds: string[]
): Promise<{ error?: string }> {
  const { error } = await reorderFaqItems(faqSetId, itemIds)
  if (error) return { error }
  await revalidatePaths(faqSetId)
  return {}
}

async function revalidatePaths(faqSetId?: string) {
  revalidatePath("/")
  revalidatePath("/dashboard/faq")
  for (const locale of routing.locales) {
    const prefix = locale === routing.defaultLocale ? "" : `/${locale}`
    if (prefix) revalidatePath(`/${locale}`)
    revalidatePath(`${prefix || ""}/dashboard/faq`)
  }
  if (faqSetId) {
    const faqSet = await getFaqSetById(faqSetId)
    if (faqSet?.project_id) {
      const project = await getProjectById(faqSet.project_id)
      if (project?.slug) {
        for (const locale of routing.locales) {
          const prefix = locale === routing.defaultLocale ? "" : `/${locale}`
          revalidatePath(`${prefix}/projects/${project.slug}`)
        }
      }
    }
  }
}
