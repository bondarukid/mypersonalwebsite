/*
 * Copyright (C) 2026 Ivan Bondaruk (https://bondarukid.com)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * Client-safe: maps DB shapes to the public marketing page. No next/headers.
 */

import { getAboutTimelineObjectPublicUrl } from "@/lib/about-timeline-file-url"
import type {
  AboutTimelineAttachmentRow,
  AboutTimelineMilestoneRow,
  AboutTimelineMilestoneWithDepth,
  AboutTimelineDepthRow,
  AboutTimelineSkillRow,
  AboutTimelineTagRow,
  PublicTimelineMilestone,
  PublicTimelinePublicAttachment,
} from "@/lib/about-timeline-types"

function mapAttachmentToPublic(
  a: AboutTimelineAttachmentRow
): PublicTimelinePublicAttachment {
  const storageUrl = a.storage_path
    ? getAboutTimelineObjectPublicUrl(a.storage_path)
    : null
  let imageSrc: string | null = null
  let href: string | null = null
  if (a.kind === "link") {
    href = a.url
  } else if (a.kind === "image") {
    imageSrc = storageUrl
  } else if (a.kind === "file") {
    href = storageUrl
  } else {
    href = a.url
  }
  return {
    id: a.id,
    kind: a.kind,
    title: a.title,
    body: a.body,
    href: href ?? a.url,
    imageSrc: a.kind === "image" ? imageSrc : null,
    filePath: a.storage_path,
  }
}

function localeSuffix(locale: string): "en" | "uk" | "ja" {
  if (locale === "uk") return "uk"
  if (locale === "ja") return "ja"
  return "en"
}

/** ISO date (YYYY-MM-DD) ascending; tie-breaker id for stable order. */
function byHappenedChronological<
  T extends { happened_on: string; id: string },
>(a: T, b: T): number {
  const c = a.happened_on.localeCompare(b.happened_on)
  if (c !== 0) return c
  return a.id.localeCompare(b.id)
}

export function mapMilestonesToPublicLocale(
  rows: AboutTimelineMilestoneWithDepth[],
  locale: string
): PublicTimelineMilestone[] {
  const s = localeSuffix(locale)
  const milestonesOrdered = [...rows]
    .sort((a, b) => byHappenedChronological(a, b))
    .map((m) => {
      const depthOrder = [...m.depth_events].sort((a, b) =>
        byHappenedChronological(a, b)
      )
      return { ...m, depth_events: depthOrder }
    })
  return milestonesOrdered.map((m) => ({
    id: m.id,
    happened_on: m.happened_on,
    ended_on: m.ended_on,
    icon: m.icon,
    title: (m[`title_${s}` as keyof AboutTimelineMilestoneRow] as string) || m.title_en,
    description:
      (m[`description_${s}` as keyof AboutTimelineMilestoneRow] as string) ||
      m.description_en,
    skills: m.skills.map((sk) => ({
      id: sk.id,
      label:
        (sk[`label_${s}` as keyof AboutTimelineSkillRow] as string) || sk.label_en,
    })),
    tags: m.tags.map((tg) => ({
      id: tg.id,
      label: tg.label_en,
    })),
    depth: m.depth_events.map((d) => ({
      id: d.id,
      happened_on: d.happened_on,
      ended_on: d.ended_on,
      icon: d.icon,
      title: (d[`title_${s}` as keyof AboutTimelineDepthRow] as string) || d.title_en,
      body: (d[`body_${s}` as keyof AboutTimelineDepthRow] as string) || d.body_en,
      attachments: (d.attachments ?? []).map(mapAttachmentToPublic),
    })),
    attachments: (m.attachments ?? []).map(mapAttachmentToPublic),
  }))
}

export function isMilestoneOngoing(endedOn: string | null): boolean {
  return endedOn == null
}
