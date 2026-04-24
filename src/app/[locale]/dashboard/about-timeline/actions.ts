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
import {
  createTimelineMilestone,
  updateTimelineMilestone,
  deleteTimelineMilestone,
  createDepthEvent,
  updateDepthEvent,
  deleteDepthEvent,
  reorderTimelineMilestones,
  reorderDepthEvents,
  getTimelineMilestonesWithDepth,
  setMilestoneSkillIds,
  setMilestoneTagIds,
  createTimelineSkill,
  createTimelineTag,
  updateTimelineSkill,
  updateTimelineTag,
  deleteTimelineSkill,
  deleteTimelineTag,
  createEventAttachment,
  updateEventAttachment,
  deleteEventAttachment,
  getTimelineSkillCatalog,
  getTimelineTagCatalog,
  type AboutTimelineAttachmentKind,
} from "@/lib/supabase/about-timeline"
import { uploadAboutTimelineObject } from "@/lib/supabase/about-timeline-upload"
import { routing } from "@/i18n/routing"

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

  if (!member) return { companyId: null, error: "Not a member of landing company" }
  return { companyId: landing.id }
}

function revalidateAbout() {
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}/about`, "page")
  }
}

const optionalDate = z
  .union([z.string().min(1), z.literal(""), z.null()])
  .optional()
  .transform((s) => {
    if (s == null || s === "") return null
    return s
  })

const milestoneSchema = z.object({
  happened_on: z.string().min(1),
  ended_on: optionalDate,
  icon: z.string().min(1),
  title_en: z.string(),
  title_uk: z.string(),
  title_ja: z.string(),
  description_en: z.string(),
  description_uk: z.string(),
  description_ja: z.string(),
})

const depthSchema = z.object({
  happened_on: z.string().min(1),
  ended_on: optionalDate,
  icon: z.string().min(1),
  title_en: z.string(),
  title_uk: z.string(),
  title_ja: z.string(),
  body_en: z.string(),
  body_uk: z.string(),
  body_ja: z.string(),
})

async function nextSkillSortOrder(companyId: string): Promise<number> {
  const rows = await getTimelineSkillCatalog(companyId)
  if (rows.length === 0) return 0
  return Math.max(...rows.map((r) => r.sort_order), -1) + 1
}

async function nextTagSortOrder(companyId: string): Promise<number> {
  const rows = await getTimelineTagCatalog(companyId)
  if (rows.length === 0) return 0
  return Math.max(...rows.map((r) => r.sort_order), -1) + 1
}

function makeSlugFromLabel(
  en: string,
  uk: string,
  ja: string,
  existing: Set<string>
): string {
  const base = (en || uk || ja || "item")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "item"
  let slug = base.slice(0, 64)
  let n = 0
  while (existing.has(slug) && n < 50) {
    n += 1
    slug = `${base}-${n}`.slice(0, 64)
  }
  if (existing.has(slug)) {
    slug = `${base}-${globalThis.crypto?.randomUUID?.().slice(0, 8) ?? "x"}`
  }
  return slug
}

const skillInputSchema = z.object({
  label_en: z.string().min(1),
  label_uk: z.string().optional().default(""),
  label_ja: z.string().optional().default(""),
})

const tagInputSchema = z.object({
  label_en: z.string().min(1),
  label_uk: z.string().optional().default(""),
  label_ja: z.string().optional().default(""),
})

const attachmentKindSchema: z.ZodType<AboutTimelineAttachmentKind> = z.enum([
  "link",
  "image",
  "file",
  "note",
])

const idsSchema = z.array(z.string().uuid())

export async function createMilestoneAction(
  input: z.infer<typeof milestoneSchema> & { sort_order: number }
): Promise<{ id?: string; error?: string }> {
  const { companyId, error } = await getLandingCompanyIdForUser()
  if (!companyId) return { error: error ?? "Forbidden" }
  const parsed = milestoneSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Validation failed" }
  }
  const result = await createTimelineMilestone(companyId, {
    sort_order: input.sort_order,
    happened_on: parsed.data.happened_on,
    ended_on: parsed.data.ended_on,
    icon: parsed.data.icon,
    title_en: parsed.data.title_en,
    title_uk: parsed.data.title_uk,
    title_ja: parsed.data.title_ja,
    description_en: parsed.data.description_en,
    description_uk: parsed.data.description_uk,
    description_ja: parsed.data.description_ja,
  })
  if (result.error) return { error: result.error }
  revalidateAbout()
  return { id: result.id }
}

export async function updateMilestoneAction(
  id: string,
  updates: Partial<z.infer<typeof milestoneSchema>> & { sort_order?: number }
): Promise<{ error?: string }> {
  const { companyId, error } = await getLandingCompanyIdForUser()
  if (!companyId) return { error: error ?? "Forbidden" }
  const { error: uerr } = await updateTimelineMilestone(
    id,
    updates as Parameters<typeof updateTimelineMilestone>[1]
  )
  if (uerr) return { error: uerr }
  revalidateAbout()
  return {}
}

export async function deleteMilestoneAction(id: string): Promise<{ error?: string }> {
  const { companyId, error } = await getLandingCompanyIdForUser()
  if (!companyId) return { error: error ?? "Forbidden" }
  const { error: derr } = await deleteTimelineMilestone(id)
  if (derr) return { error: derr }
  revalidateAbout()
  return {}
}

export async function reorderMilestonesAction(
  orderedIds: string[]
): Promise<{ error?: string }> {
  const { companyId, error } = await getLandingCompanyIdForUser()
  if (!companyId) return { error: error ?? "Forbidden" }
  const { error: rerr } = await reorderTimelineMilestones(companyId, orderedIds)
  if (rerr) return { error: rerr }
  revalidateAbout()
  return {}
}

export async function createDepthEventAction(
  milestoneId: string,
  input: z.infer<typeof depthSchema> & { sort_order: number }
): Promise<{ id?: string; error?: string }> {
  const { companyId, error } = await getLandingCompanyIdForUser()
  if (!companyId) return { error: error ?? "Forbidden" }
  const parsed = depthSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Validation failed" }
  }
  const result = await createDepthEvent(milestoneId, {
    sort_order: input.sort_order,
    happened_on: parsed.data.happened_on,
    ended_on: parsed.data.ended_on,
    icon: parsed.data.icon,
    title_en: parsed.data.title_en,
    title_uk: parsed.data.title_uk,
    title_ja: parsed.data.title_ja,
    body_en: parsed.data.body_en,
    body_uk: parsed.data.body_uk,
    body_ja: parsed.data.body_ja,
  })
  if (result.error) return { error: result.error }
  revalidateAbout()
  return { id: result.id }
}

export async function updateDepthEventAction(
  id: string,
  updates: Partial<z.infer<typeof depthSchema>> & { sort_order?: number }
): Promise<{ error?: string }> {
  const { companyId, error } = await getLandingCompanyIdForUser()
  if (!companyId) return { error: error ?? "Forbidden" }
  const { error: uerr } = await updateDepthEvent(
    id,
    updates as Parameters<typeof updateDepthEvent>[1]
  )
  if (uerr) return { error: uerr }
  revalidateAbout()
  return {}
}

export async function deleteDepthEventAction(id: string): Promise<{ error?: string }> {
  const { companyId, error } = await getLandingCompanyIdForUser()
  if (!companyId) return { error: error ?? "Forbidden" }
  const { error: derr } = await deleteDepthEvent(id)
  if (derr) return { error: derr }
  revalidateAbout()
  return {}
}

export async function reorderDepthEventsAction(
  milestoneId: string,
  orderedIds: string[]
): Promise<{ error?: string }> {
  const { companyId, error } = await getLandingCompanyIdForUser()
  if (!companyId) return { error: error ?? "Forbidden" }
  const { error: rerr } = await reorderDepthEvents(milestoneId, orderedIds)
  if (rerr) return { error: rerr }
  revalidateAbout()
  return {}
}

export async function setMilestoneSkillsAction(
  milestoneId: string,
  skillIds: string[]
): Promise<{ error?: string }> {
  const { companyId, error } = await getLandingCompanyIdForUser()
  if (!companyId) return { error: error ?? "Forbidden" }
  const p = idsSchema.safeParse(skillIds)
  if (!p.success) return { error: "Invalid skill id list" }
  const m = (await getTimelineMilestonesWithDepth(companyId)).find(
    (x) => x.id === milestoneId
  )
  if (!m) return { error: "Milestone not found" }
  const { error: e } = await setMilestoneSkillIds(milestoneId, p.data)
  if (e) return { error: e }
  revalidateAbout()
  return {}
}

export async function setMilestoneTagsAction(
  milestoneId: string,
  tagIds: string[]
): Promise<{ error?: string }> {
  const { companyId, error } = await getLandingCompanyIdForUser()
  if (!companyId) return { error: error ?? "Forbidden" }
  const p = idsSchema.safeParse(tagIds)
  if (!p.success) return { error: "Invalid tag id list" }
  const m = (await getTimelineMilestonesWithDepth(companyId)).find(
    (x) => x.id === milestoneId
  )
  if (!m) return { error: "Milestone not found" }
  const { error: e } = await setMilestoneTagIds(milestoneId, p.data)
  if (e) return { error: e }
  revalidateAbout()
  return {}
}

export async function createSkillAction(
  input: z.infer<typeof skillInputSchema>
): Promise<{ id?: string; error?: string; slug?: string }> {
  const { companyId, error } = await getLandingCompanyIdForUser()
  if (!companyId) return { error: error ?? "Forbidden" }
  const p = skillInputSchema.safeParse(input)
  if (!p.success) return { error: p.error.issues[0]?.message ?? "Invalid" }
  const skills = await getTimelineSkillCatalog(companyId)
  const existing = new Set(skills.map((s) => s.slug))
  const slug = makeSlugFromLabel(
    p.data.label_en,
    p.data.label_uk ?? "",
    p.data.label_ja ?? "",
    existing
  )
  const so = await nextSkillSortOrder(companyId)
  const r = await createTimelineSkill(companyId, {
    slug,
    label_en: p.data.label_en,
    label_uk: p.data.label_uk ?? "",
    label_ja: p.data.label_ja ?? "",
    sort_order: so,
  })
  if (r.error) return { error: r.error }
  revalidateAbout()
  return { id: r.id, slug }
}

export async function createTagAction(
  input: z.infer<typeof tagInputSchema>
): Promise<{ id?: string; error?: string; slug?: string }> {
  const { companyId, error } = await getLandingCompanyIdForUser()
  if (!companyId) return { error: error ?? "Forbidden" }
  const p = tagInputSchema.safeParse(input)
  if (!p.success) return { error: p.error.issues[0]?.message ?? "Invalid" }
  const tags = await getTimelineTagCatalog(companyId)
  const existing = new Set(tags.map((s) => s.slug))
  const slug = makeSlugFromLabel(
    p.data.label_en,
    p.data.label_uk ?? "",
    p.data.label_ja ?? "",
    existing
  )
  const so = await nextTagSortOrder(companyId)
  const r = await createTimelineTag(companyId, {
    slug,
    label_en: p.data.label_en,
    label_uk: p.data.label_uk ?? "",
    label_ja: p.data.label_ja ?? "",
    sort_order: so,
  })
  if (r.error) return { error: r.error }
  revalidateAbout()
  return { id: r.id, slug }
}

export async function updateSkillAction(
  id: string,
  input: { label_en?: string; label_uk?: string; label_ja?: string }
): Promise<{ error?: string }> {
  const g = await getLandingCompanyIdForUser()
  if (!g.companyId) return { error: g.error ?? "Forbidden" }
  const e = await updateTimelineSkill(id, {
    label_en: input.label_en,
    label_uk: input.label_uk,
    label_ja: input.label_ja,
  })
  if (e.error) return e
  revalidateAbout()
  return {}
}

export async function updateTagAction(
  id: string,
  input: { label_en?: string; label_uk?: string; label_ja?: string }
): Promise<{ error?: string }> {
  const g = await getLandingCompanyIdForUser()
  if (!g.companyId) return { error: g.error ?? "Forbidden" }
  const e = await updateTimelineTag(id, {
    label_en: input.label_en,
    label_uk: input.label_uk,
    label_ja: input.label_ja,
  })
  if (e.error) return e
  revalidateAbout()
  return {}
}

export async function deleteSkillAction(id: string): Promise<{ error?: string }> {
  const g = await getLandingCompanyIdForUser()
  if (!g.companyId) return { error: g.error ?? "Forbidden" }
  const e = await deleteTimelineSkill(id)
  if (e.error) return e
  revalidateAbout()
  return {}
}

export async function deleteTagAction(id: string): Promise<{ error?: string }> {
  const g = await getLandingCompanyIdForUser()
  if (!g.companyId) return { error: g.error ?? "Forbidden" }
  const e = await deleteTimelineTag(id)
  if (e.error) return e
  revalidateAbout()
  return {}
}

type CreateAttachmentInput = {
  milestoneId?: string
  depthEventId?: string
  kind: AboutTimelineAttachmentKind
  title?: string
  body?: string
  url?: string
}

export async function createAttachmentAction(
  input: CreateAttachmentInput
): Promise<{ id?: string; error?: string }> {
  const g = await getLandingCompanyIdForUser()
  if (!g.companyId) return { error: g.error ?? "Forbidden" }
  if (
    (input.milestoneId && input.depthEventId) ||
    (!input.milestoneId && !input.depthEventId)
  ) {
    return { error: "Set exactly one of milestone or depth" }
  }
  const p = attachmentKindSchema.safeParse(input.kind)
  if (!p.success) return { error: "Invalid kind" }
  const ms = await getTimelineMilestonesWithDepth(g.companyId)
  let count = 0
  if (input.milestoneId) {
    const m = ms.find((x) => x.id === input.milestoneId)
    if (!m) return { error: "Milestone not found" }
    count = m.attachments.length
  } else if (input.depthEventId) {
    let found = 0
    for (const m of ms) {
      const d = m.depth_events.find((d) => d.id === input.depthEventId)
      if (d) {
        found = d.attachments.length
        break
      }
    }
    count = found
  }
  if (p.data === "link" && !input.url) return { error: "URL is required" }
  if (p.data === "note" && !input.body) return { error: "Text is required" }
  if ((p.data === "image" || p.data === "file") && !input.url) {
    return { error: "File path missing" }
  }

  const r = await createEventAttachment({
    milestone_id: input.milestoneId ?? null,
    depth_event_id: input.depthEventId ?? null,
    kind: p.data,
    sort_order: count,
    title: input.title ?? null,
    body: input.body ?? null,
    url: p.data === "image" || p.data === "file" ? null : (input.url ?? null),
    storage_path:
      p.data === "image" || p.data === "file" ? (input.url ?? null) : null,
  })
  if (r.error) return { error: r.error }
  revalidateAbout()
  return { id: r.id }
}

export async function createAttachmentWithUploadAction(formData: FormData): Promise<{
  id?: string
  error?: string
}> {
  const g = await getLandingCompanyIdForUser()
  if (!g.companyId) return { error: g.error ?? "Forbidden" }
  const milestoneId = (formData.get("milestoneId") as string) || undefined
  const depthEventId = (formData.get("depthEventId") as string) || undefined
  const kind = formData.get("kind") as string
  const title = (formData.get("title") as string) || undefined
  const file = formData.get("file") as File | null
  if (!file || !file.size) return { error: "No file" }
  if (kind !== "image" && kind !== "file") return { error: "Invalid kind" }

  if (
    (milestoneId && depthEventId) ||
    (!milestoneId && !depthEventId)
  ) {
    return { error: "Set exactly one target" }
  }

  const folder = `company/${g.companyId}/${milestoneId ? `milestone/${milestoneId}` : `depth/${depthEventId}`}`

  const { path, error: up } = await uploadAboutTimelineObject(
    file,
    folder,
    kind as "image" | "file"
  )
  if (up) return { error: up }
  if (!path) return { error: "Upload failed" }
  return createAttachmentAction({
    milestoneId,
    depthEventId,
    kind: kind as "image" | "file",
    title,
    url: path,
  })
}

export async function deleteAttachmentAction(
  id: string
): Promise<{ error?: string }> {
  const g = await getLandingCompanyIdForUser()
  if (!g.companyId) return { error: g.error ?? "Forbidden" }
  const e = await deleteEventAttachment(id)
  if (e.error) return e
  revalidateAbout()
  return {}
}

export async function updateAttachmentSortAction(
  id: string,
  sortOrder: number
): Promise<{ error?: string }> {
  const g = await getLandingCompanyIdForUser()
  if (!g.companyId) return { error: g.error ?? "Forbidden" }
  const e = await updateEventAttachment(id, { sort_order: sortOrder })
  if (e.error) return e
  revalidateAbout()
  return {}
}
