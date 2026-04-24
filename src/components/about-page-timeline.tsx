/*
 * Copyright (C) 2026 Ivan Bondaruk (https://bondarukid.com)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 */

"use client"

import * as React from "react"
import { useLocale, useTranslations } from "next-intl"
import { Timeline, TimelineItem } from "@/components/ui/timeline"
import { AboutTimelineDepthDialog } from "@/components/about-timeline-depth-dialog"
import { TimelineDynamicIcon } from "@/components/timeline-dynamic-icon"
import { isMilestoneOngoing } from "@/lib/about-timeline-map"
import type { PublicTimelineMilestone } from "@/lib/about-timeline-types"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const ICON_COLORS = [
  "primary",
  "secondary",
  "accent",
  "muted",
] as const

type AboutPageTimelineProps = {
  milestones: PublicTimelineMilestone[]
}

function formatMilestoneLine(
  start: string,
  end: string | null,
  locale: string,
  ongoing: string
): string {
  const f = (s: string) =>
    new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(new Date(s))
  if (!end) {
    return `${f(start)} – ${ongoing}`
  }
  return `${f(start)} – ${f(end)}`
}

export function AboutPageTimeline({ milestones: initialMilestones }: AboutPageTimelineProps) {
  const t = useTranslations("aboutPage.timeline")
  const locale = useLocale()
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [openMilestoneId, setOpenMilestoneId] = React.useState<string | null>(null)
  const [skillFilter, setSkillFilter] = React.useState<Set<string>>(new Set())

  const allSkillOptions = React.useMemo(() => {
    const m = new Map<string, { id: string; label: string }>()
    for (const x of initialMilestones) {
      for (const s of x.skills) m.set(s.id, s)
    }
    return [...m.values()].sort((a, b) => a.label.localeCompare(b.label, locale))
  }, [initialMilestones, locale])

  const milestones = React.useMemo(() => {
    if (skillFilter.size === 0) return initialMilestones
    return initialMilestones.filter(
      (m) =>
        m.skills.length > 0 &&
        m.skills.some((s) => skillFilter.has(s.id))
    )
  }, [initialMilestones, skillFilter])

  const ongoingLabel = t("dateOngoing")
  const mainIdx =
    openMilestoneId == null
      ? -1
      : initialMilestones.findIndex((m) => m.id === openMilestoneId)
  const activeInitial = mainIdx >= 0 ? initialMilestones[mainIdx] : null

  const lineForMilestone = React.useCallback(
    (m: (typeof initialMilestones)[0]) => {
      return formatMilestoneLine(m.happened_on, m.ended_on, locale, ongoingLabel)
    },
    [locale, ongoingLabel]
  )

  const openDialog = (milestoneId: string) => {
    setOpenMilestoneId(milestoneId)
    setDialogOpen(true)
  }

  const prevMain =
    mainIdx > 0
      ? (() => {
          const p = initialMilestones[mainIdx - 1]!
          return {
            date: p.happened_on,
            dateLine: lineForMilestone(p),
            title: p.title,
          }
        })()
      : null
  const nextMain =
    mainIdx >= 0 && mainIdx < initialMilestones.length - 1
      ? (() => {
          const n = initialMilestones[mainIdx + 1]!
          return {
            date: n.happened_on,
            dateLine: lineForMilestone(n),
            title: n.title,
          }
        })()
      : null

  const toggleSkill = (id: string) => {
    setSkillFilter((prev) => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }

  return (
    <section className="relative bg-black py-16 pb-20 md:py-24 md:pb-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-50 md:text-4xl">
            {t("heading")}
          </h2>
          <p className="mt-3 text-zinc-400">{t("subheading")}</p>
        </div>
        {allSkillOptions.length > 0 ? (
          <div className="mb-8 max-w-3xl">
            <p className="mb-2 text-sm font-medium text-zinc-400">
              {t("filterBySkills")}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {allSkillOptions.map((s) => {
                const on = skillFilter.has(s.id)
                return (
                  <Button
                    key={s.id}
                    type="button"
                    size="sm"
                    variant={on ? "default" : "secondary"}
                    className={cn(
                      "h-7 rounded-full px-2.5 text-xs font-medium",
                      !on && "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
                    )}
                    onClick={() => toggleSkill(s.id)}
                  >
                    {s.label}
                  </Button>
                )
              })}
              {skillFilter.size > 0 ? (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs text-zinc-500"
                  onClick={() => setSkillFilter(new Set())}
                >
                  {t("clearFilter")}
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
        {initialMilestones.length > 0 &&
        skillFilter.size > 0 &&
        milestones.length === 0 ? (
          <p className="max-w-2xl text-sm text-zinc-500">{t("emptyFilter")}</p>
        ) : null}
        {initialMilestones.length === 0 ? (
          <p className="max-w-2xl text-sm text-zinc-500">{t("emptyTimeline")}</p>
        ) : null}
        {milestones.length > 0 && (
          <div className="flex justify-center md:justify-start">
            <Timeline className="max-w-3xl">
              {milestones.map((m, i) => (
                <TimelineItem
                  key={m.id}
                  date={m.happened_on}
                  dateLine={lineForMilestone(m)}
                  title={m.title}
                  description={m.description}
                  icon={
                    <TimelineDynamicIcon
                      name={m.icon}
                      className="size-5"
                    />
                  }
                  iconColor={ICON_COLORS[i % ICON_COLORS.length]}
                  status={
                    isMilestoneOngoing(m.ended_on) ? "in-progress" : "completed"
                  }
                  onBubbleClick={() => openDialog(m.id)}
                  bubbleAriaLabel={m.title}
                />
              ))}
            </Timeline>
          </div>
        )}
      </div>

      {activeInitial && (
        <AboutTimelineDepthDialog
          open={dialogOpen}
          onOpenChange={(o) => {
            setDialogOpen(o)
            if (!o) setOpenMilestoneId(null)
          }}
          mainTitle={activeInitial.title}
          mainDate={activeInitial.happened_on}
          mainDateEnd={activeInitial.ended_on}
          mainSkills={activeInitial.skills}
          mainTags={activeInitial.tags}
          mainAttachments={activeInitial.attachments}
          depthEvents={activeInitial.depth}
          prevMain={prevMain}
          nextMain={nextMain}
        />
      )}
    </section>
  )
}
