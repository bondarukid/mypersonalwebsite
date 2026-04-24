/*
 * Copyright (C) 2026 Ivan Bondaruk (https://bondarukid.com)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * Client-safe: no next/headers or server-only Supabase imports.
 */

export type AboutTimelineMilestoneRow = {
  id: string
  company_id: string
  sort_order: number
  happened_on: string
  ended_on: string | null
  icon: string
  title_en: string
  title_uk: string
  title_ja: string
  description_en: string
  description_uk: string
  description_ja: string
  created_at: string
  updated_at: string
}

export type AboutTimelineDepthRow = {
  id: string
  milestone_id: string
  sort_order: number
  happened_on: string
  ended_on: string | null
  icon: string
  title_en: string
  title_uk: string
  title_ja: string
  body_en: string
  body_uk: string
  body_ja: string
  created_at: string
  updated_at: string
}

export type AboutTimelineSkillRow = {
  id: string
  company_id: string
  sort_order: number
  slug: string
  label_en: string
  label_uk: string
  label_ja: string
  created_at: string
  updated_at: string
}

export type AboutTimelineTagRow = {
  id: string
  company_id: string
  sort_order: number
  slug: string
  label_en: string
  label_uk: string
  label_ja: string
  created_at: string
  updated_at: string
}

export type AboutTimelineAttachmentKind = "link" | "image" | "file" | "note"

export type AboutTimelineAttachmentRow = {
  id: string
  milestone_id: string | null
  depth_event_id: string | null
  kind: AboutTimelineAttachmentKind
  sort_order: number
  title: string | null
  body: string | null
  url: string | null
  storage_path: string | null
  created_at: string
  updated_at: string
}

export type AboutTimelineMilestoneWithDepth = AboutTimelineMilestoneRow & {
  depth_events: (AboutTimelineDepthRow & {
    attachments: AboutTimelineAttachmentRow[]
  })[]
  skills: AboutTimelineSkillRow[]
  tags: AboutTimelineTagRow[]
  attachments: AboutTimelineAttachmentRow[]
}

export type PublicTimelinePublicAttachment = {
  id: string
  kind: AboutTimelineAttachmentKind
  title: string | null
  body: string | null
  href: string | null
  imageSrc: string | null
  filePath: string | null
}

export type PublicTimelineMilestone = {
  id: string
  happened_on: string
  ended_on: string | null
  icon: string
  title: string
  description: string
  skills: { id: string; label: string }[]
  tags: { id: string; label: string }[]
  depth: PublicTimelineDepthEvent[]
  attachments: PublicTimelinePublicAttachment[]
}

export type PublicTimelineDepthEvent = {
  id: string
  happened_on: string
  ended_on: string | null
  icon: string
  title: string
  body: string
  attachments: PublicTimelinePublicAttachment[]
}
