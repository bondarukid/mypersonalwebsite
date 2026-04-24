/*
 * Copyright (C) 2026 Ivan Bondaruk (https://bondarukid.com)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 */

import { createClient } from "./server"
import type {
  AboutTimelineMilestoneRow,
  AboutTimelineDepthRow,
  AboutTimelineSkillRow,
  AboutTimelineTagRow,
  AboutTimelineAttachmentRow,
  AboutTimelineAttachmentKind,
  AboutTimelineMilestoneWithDepth,
} from "@/lib/about-timeline-types"

export type {
  AboutTimelineMilestoneRow,
  AboutTimelineDepthRow,
  AboutTimelineSkillRow,
  AboutTimelineTagRow,
  AboutTimelineAttachmentRow,
  AboutTimelineAttachmentKind,
  AboutTimelineMilestoneWithDepth,
  PublicTimelineMilestone,
  PublicTimelineDepthEvent,
  PublicTimelinePublicAttachment,
} from "@/lib/about-timeline-types"

export { mapMilestonesToPublicLocale, isMilestoneOngoing } from "@/lib/about-timeline-map"

export async function getTimelineSkillCatalog(
  companyId: string
): Promise<AboutTimelineSkillRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("about_timeline_skills")
    .select("*")
    .eq("company_id", companyId)
    .order("sort_order", { ascending: true })
  if (error) return []
  return (data ?? []) as AboutTimelineSkillRow[]
}

export async function getTimelineTagCatalog(
  companyId: string
): Promise<AboutTimelineTagRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("about_timeline_tags")
    .select("*")
    .eq("company_id", companyId)
    .order("sort_order", { ascending: true })
  if (error) return []
  return (data ?? []) as AboutTimelineTagRow[]
}

function groupByMilestoneSkillIds(
  rows: { milestone_id: string; skill_id: string }[]
): Map<string, string[]> {
  const m = new Map<string, string[]>()
  for (const r of rows) {
    const list = m.get(r.milestone_id) ?? []
    list.push(r.skill_id)
    m.set(r.milestone_id, list)
  }
  return m
}

function groupByMilestoneTagIds(
  rows: { milestone_id: string; tag_id: string }[]
): Map<string, string[]> {
  const m = new Map<string, string[]>()
  for (const r of rows) {
    const list = m.get(r.milestone_id) ?? []
    list.push(r.tag_id)
    m.set(r.milestone_id, list)
  }
  return m
}

export async function getTimelineMilestonesWithDepth(
  companyId: string
): Promise<AboutTimelineMilestoneWithDepth[]> {
  const supabase = await createClient()
  const { data: milestones, error } = await supabase
    .from("about_timeline_milestones")
    .select("*")
    .eq("company_id", companyId)
    .order("sort_order", { ascending: true })

  if (error) return []
  if (!milestones?.length) return []

  const ms = milestones as AboutTimelineMilestoneRow[]
  const ids = ms.map((m) => m.id)

  const { data: depths, error: depthError } = await supabase
    .from("about_timeline_depth_events")
    .select("*")
    .in("milestone_id", ids)
    .order("sort_order", { ascending: true })

  const depthList = (depthError ? [] : (depths ?? [])) as AboutTimelineDepthRow[]

  const { data: msJunction } = await supabase
    .from("about_timeline_milestone_skills")
    .select("milestone_id, skill_id")
    .in("milestone_id", ids)

  const { data: skillsRows } = await supabase
    .from("about_timeline_skills")
    .select("*")
    .eq("company_id", companyId)

  const skillsById = new Map(
    ((skillsRows ?? []) as AboutTimelineSkillRow[]).map((s) => [s.id, s])
  )
  const skillsPerMilestone = groupByMilestoneSkillIds(
    (msJunction as { milestone_id: string; skill_id: string }[] | null) ?? []
  )

  const { data: mtJunction } = await supabase
    .from("about_timeline_milestone_tags")
    .select("milestone_id, tag_id")
    .in("milestone_id", ids)

  const { data: tagsRows } = await supabase
    .from("about_timeline_tags")
    .select("*")
    .eq("company_id", companyId)

  const tagsById = new Map(
    ((tagsRows ?? []) as AboutTimelineTagRow[]).map((s) => [s.id, s])
  )
  const tagsPerMilestone = groupByMilestoneTagIds(
    (mtJunction as { milestone_id: string; tag_id: string }[] | null) ?? []
  )

  const depthIds = depthList.map((d) => d.id)
  const { data: mAtts } = await supabase
    .from("about_timeline_event_attachments")
    .select("*")
    .in("milestone_id", ids)
    .order("sort_order", { ascending: true })

  const dAtts =
    depthIds.length > 0
      ? await supabase
          .from("about_timeline_event_attachments")
          .select("*")
          .in("depth_event_id", depthIds)
          .order("sort_order", { ascending: true })
      : { data: [] as unknown[] }

  const mAttsBy: Map<string, AboutTimelineAttachmentRow[]> = new Map()
  for (const a of (mAtts as AboutTimelineAttachmentRow[] | null) ?? []) {
    if (!a.milestone_id) continue
    const list = mAttsBy.get(a.milestone_id) ?? []
    list.push(a)
    mAttsBy.set(a.milestone_id, list)
  }
  const dAttsBy: Map<string, AboutTimelineAttachmentRow[]> = new Map()
  for (const a of (dAtts.data as AboutTimelineAttachmentRow[] | null) ?? []) {
    if (!a.depth_event_id) continue
    const list = dAttsBy.get(a.depth_event_id) ?? []
    list.push(a)
    dAttsBy.set(a.depth_event_id, list)
  }

  const byMilestone = new Map<string, AboutTimelineDepthRow[]>()
  for (const d of depthList) {
    const list = byMilestone.get(d.milestone_id) ?? []
    list.push(d)
    byMilestone.set(d.milestone_id, list)
  }

  return ms.map((m) => {
    const sids = skillsPerMilestone.get(m.id) ?? []
    const tids = tagsPerMilestone.get(m.id) ?? []
    const depthRaw = byMilestone.get(m.id) ?? []
    return {
      ...m,
      ended_on: m.ended_on ?? null,
      skills: sids
        .map((id) => skillsById.get(id))
        .filter((s): s is AboutTimelineSkillRow => !!s),
      tags: tids
        .map((id) => tagsById.get(id))
        .filter((t): t is AboutTimelineTagRow => !!t),
      attachments: mAttsBy.get(m.id) ?? [],
      depth_events: depthRaw.map((d) => ({
        ...d,
        ended_on: d.ended_on ?? null,
        attachments: dAttsBy.get(d.id) ?? [],
      })),
    }
  })
}

export async function createTimelineMilestone(
  companyId: string,
  input: Omit<
    AboutTimelineMilestoneRow,
    "id" | "company_id" | "created_at" | "updated_at"
  >
): Promise<{ id?: string; error?: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("about_timeline_milestones")
    .insert({
      company_id: companyId,
      sort_order: input.sort_order,
      happened_on: input.happened_on,
      ended_on: input.ended_on,
      icon: input.icon,
      title_en: input.title_en,
      title_uk: input.title_uk,
      title_ja: input.title_ja,
      description_en: input.description_en,
      description_uk: input.description_uk,
      description_ja: input.description_ja,
    })
    .select("id")
    .single()

  if (error) return { error: error.message }
  return { id: data?.id }
}

export async function updateTimelineMilestone(
  id: string,
  updates: Partial<
    Pick<
      AboutTimelineMilestoneRow,
      | "sort_order"
      | "happened_on"
      | "ended_on"
      | "icon"
      | "title_en"
      | "title_uk"
      | "title_ja"
      | "description_en"
      | "description_uk"
      | "description_ja"
    >
  > & { updated_at?: string }
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const clean = Object.fromEntries(
    Object.entries(updates).filter(([, v]) => v !== undefined)
  ) as Record<string, string | number | null>
  const { error } = await supabase
    .from("about_timeline_milestones")
    .update({ ...clean, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) return { error: error.message }
  return {}
}

export async function deleteTimelineMilestone(
  id: string
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase
    .from("about_timeline_milestones")
    .delete()
    .eq("id", id)

  if (error) return { error: error.message }
  return {}
}

export async function createDepthEvent(
  milestoneId: string,
  input: Omit<
    AboutTimelineDepthRow,
    "id" | "milestone_id" | "created_at" | "updated_at"
  >
): Promise<{ id?: string; error?: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("about_timeline_depth_events")
    .insert({
      milestone_id: milestoneId,
      sort_order: input.sort_order,
      happened_on: input.happened_on,
      ended_on: input.ended_on,
      icon: input.icon,
      title_en: input.title_en,
      title_uk: input.title_uk,
      title_ja: input.title_ja,
      body_en: input.body_en,
      body_uk: input.body_uk,
      body_ja: input.body_ja,
    })
    .select("id")
    .single()

  if (error) return { error: error.message }
  return { id: data?.id }
}

export async function updateDepthEvent(
  id: string,
  updates: Partial<
    Pick<
      AboutTimelineDepthRow,
      | "sort_order"
      | "happened_on"
      | "ended_on"
      | "icon"
      | "title_en"
      | "title_uk"
      | "title_ja"
      | "body_en"
      | "body_uk"
      | "body_ja"
    >
  >
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const clean = Object.fromEntries(
    Object.entries(updates).filter(([, v]) => v !== undefined)
  ) as Record<string, string | number | null>
  const { error } = await supabase
    .from("about_timeline_depth_events")
    .update({ ...clean, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) return { error: error.message }
  return {}
}

export async function deleteDepthEvent(
  id: string
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase
    .from("about_timeline_depth_events")
    .delete()
    .eq("id", id)

  if (error) return { error: error.message }
  return {}
}

export async function reorderTimelineMilestones(
  companyId: string,
  orderedIds: string[]
): Promise<{ error?: string }> {
  const supabase = await createClient()
  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabase
      .from("about_timeline_milestones")
      .update({ sort_order: i, updated_at: new Date().toISOString() })
      .eq("id", orderedIds[i])
      .eq("company_id", companyId)

    if (error) return { error: error.message }
  }
  return {}
}

export async function reorderDepthEvents(
  milestoneId: string,
  orderedIds: string[]
): Promise<{ error?: string }> {
  const supabase = await createClient()
  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabase
      .from("about_timeline_depth_events")
      .update({ sort_order: i, updated_at: new Date().toISOString() })
      .eq("id", orderedIds[i])
      .eq("milestone_id", milestoneId)

    if (error) return { error: error.message }
  }
  return {}
}

export async function setMilestoneSkillIds(
  milestoneId: string,
  skillIds: string[]
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error: dErr } = await supabase
    .from("about_timeline_milestone_skills")
    .delete()
    .eq("milestone_id", milestoneId)
  if (dErr) return { error: dErr.message }
  if (skillIds.length === 0) return {}
  const { error: iErr } = await supabase
    .from("about_timeline_milestone_skills")
    .insert(
      skillIds.map((skill_id) => ({ milestone_id: milestoneId, skill_id }))
    )
  if (iErr) return { error: iErr.message }
  return {}
}

export async function setMilestoneTagIds(
  milestoneId: string,
  tagIds: string[]
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error: dErr } = await supabase
    .from("about_timeline_milestone_tags")
    .delete()
    .eq("milestone_id", milestoneId)
  if (dErr) return { error: dErr.message }
  if (tagIds.length === 0) return {}
  const { error: iErr } = await supabase
    .from("about_timeline_milestone_tags")
    .insert(tagIds.map((tag_id) => ({ milestone_id: milestoneId, tag_id })))
  if (iErr) return { error: iErr.message }
  return {}
}

export async function createTimelineSkill(
  companyId: string,
  input: Pick<AboutTimelineSkillRow, "slug" | "label_en" | "label_uk" | "label_ja" | "sort_order">
): Promise<{ id?: string; error?: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("about_timeline_skills")
    .insert({
      company_id: companyId,
      sort_order: input.sort_order,
      slug: input.slug,
      label_en: input.label_en,
      label_uk: input.label_uk,
      label_ja: input.label_ja,
    })
    .select("id")
    .single()
  if (error) return { error: error.message }
  return { id: data?.id }
}

export async function createTimelineTag(
  companyId: string,
  input: Pick<AboutTimelineTagRow, "slug" | "label_en" | "label_uk" | "label_ja" | "sort_order">
): Promise<{ id?: string; error?: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("about_timeline_tags")
    .insert({
      company_id: companyId,
      sort_order: input.sort_order,
      slug: input.slug,
      label_en: input.label_en,
      label_uk: input.label_uk,
      label_ja: input.label_ja,
    })
    .select("id")
    .single()
  if (error) return { error: error.message }
  return { id: data?.id }
}

export async function updateTimelineSkill(
  id: string,
  updates: Partial<
    Pick<AboutTimelineSkillRow, "slug" | "label_en" | "label_uk" | "label_ja" | "sort_order">
  >
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const clean = Object.fromEntries(
    Object.entries(updates).filter(([, v]) => v !== undefined)
  ) as Record<string, string | number>
  const { error } = await supabase
    .from("about_timeline_skills")
    .update({ ...clean, updated_at: new Date().toISOString() })
    .eq("id", id)
  if (error) return { error: error.message }
  return {}
}

export async function updateTimelineTag(
  id: string,
  updates: Partial<
    Pick<AboutTimelineTagRow, "slug" | "label_en" | "label_uk" | "label_ja" | "sort_order">
  >
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const clean = Object.fromEntries(
    Object.entries(updates).filter(([, v]) => v !== undefined)
  ) as Record<string, string | number>
  const { error } = await supabase
    .from("about_timeline_tags")
    .update({ ...clean, updated_at: new Date().toISOString() })
    .eq("id", id)
  if (error) return { error: error.message }
  return {}
}

export async function deleteTimelineSkill(
  id: string
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase
    .from("about_timeline_skills")
    .delete()
    .eq("id", id)
  if (error) return { error: error.message }
  return {}
}

export async function deleteTimelineTag(
  id: string
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase
    .from("about_timeline_tags")
    .delete()
    .eq("id", id)
  if (error) return { error: error.message }
  return {}
}

export async function createEventAttachment(
  input: Omit<
    AboutTimelineAttachmentRow,
    "id" | "created_at" | "updated_at"
  >
): Promise<{ id?: string; error?: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("about_timeline_event_attachments")
    .insert({
      milestone_id: input.milestone_id,
      depth_event_id: input.depth_event_id,
      kind: input.kind,
      sort_order: input.sort_order,
      title: input.title,
      body: input.body,
      url: input.url,
      storage_path: input.storage_path,
    })
    .select("id")
    .single()
  if (error) return { error: error.message }
  return { id: data?.id }
}

export async function updateEventAttachment(
  id: string,
  updates: Partial<
    Pick<
      AboutTimelineAttachmentRow,
      | "sort_order"
      | "title"
      | "body"
      | "url"
      | "storage_path"
    >
  >
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase
    .from("about_timeline_event_attachments")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
  if (error) return { error: error.message }
  return {}
}

export async function deleteEventAttachment(
  id: string
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: row, error: fetchError } = await supabase
    .from("about_timeline_event_attachments")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle()
  if (fetchError) return { error: fetchError.message }
  const { error } = await supabase
    .from("about_timeline_event_attachments")
    .delete()
    .eq("id", id)
  if (error) return { error: error.message }
  if (row?.storage_path) {
    await supabase.storage.from("about-timeline").remove([row.storage_path])
  }
  return {}
}
