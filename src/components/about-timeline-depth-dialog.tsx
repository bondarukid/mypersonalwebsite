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
import Image from "next/image"
import { ArrowDown, ArrowUp } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Timeline,
  TimelineItem,
  formatTimelineDate,
} from "@/components/ui/timeline"
import { TimelineDynamicIcon } from "@/components/timeline-dynamic-icon"
import { cn } from "@/lib/utils"
import type {
  PublicTimelinePublicAttachment,
  PublicTimelineDepthEvent,
} from "@/lib/about-timeline-types"
import { Badge } from "@/components/ui/badge"

export type TimelineMilestoneContext = {
  date: string
  dateLine?: string
  title: string
}

type LabelItem = { id: string; label: string }

type AboutTimelineDepthDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mainTitle: string
  mainDate: string
  mainDateEnd: string | null
  mainSkills: LabelItem[]
  mainTags: LabelItem[]
  mainAttachments: PublicTimelinePublicAttachment[]
  depthEvents: PublicTimelineDepthEvent[]
  prevMain: TimelineMilestoneContext | null
  nextMain: TimelineMilestoneContext | null
}

const DEPTH_ICON_COLORS = [
  "primary",
  "secondary",
  "accent",
  "muted",
] as const

function truncateBody(body: string, max = 140): string {
  if (body.length <= max) return body
  return `${body.slice(0, max).trim()}…`
}

function formatRange(
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
  if (!end) return `${f(start)} – ${ongoing}`
  return `${f(start)} – ${f(end)}`
}

function AttachmentsList({
  items,
  t,
}: {
  items: PublicTimelinePublicAttachment[]
  t: (k: string) => string
}) {
  if (items.length === 0) return null
  return (
    <ul className="mt-4 space-y-3 text-sm text-zinc-300">
      {items.map((a) => (
        <li
          key={a.id}
          className="rounded-md border border-zinc-800 bg-zinc-900/40 p-2"
        >
          {a.title ? (
            <p className="text-xs font-medium text-zinc-500">{a.title}</p>
          ) : null}
          {a.kind === "image" && a.imageSrc ? (
            <a href={a.imageSrc} target="_blank" rel="noreferrer" className="mt-1 block">
              <Image
                src={a.imageSrc}
                alt=""
                width={640}
                height={360}
                unoptimized
                className="max-h-64 w-full rounded object-contain"
              />
            </a>
          ) : null}
          {a.kind === "note" && a.body ? (
            <p className="mt-1 whitespace-pre-wrap text-zinc-200">{a.body}</p>
          ) : null}
          {a.href && a.kind === "link" ? (
            <a
              href={a.href}
              target="_blank"
              rel="noreferrer"
              className="mt-1 break-all text-sky-400 hover:underline"
            >
              {a.href}
            </a>
          ) : null}
          {a.href && (a.kind === "file" || a.kind === "image") && !a.imageSrc ? (
            <a
              href={a.href}
              target="_blank"
              rel="noreferrer"
              className="mt-1 break-all text-sky-400 hover:underline"
            >
              {a.kind === "file" ? t("openFile") : t("viewImage")}
            </a>
          ) : null}
        </li>
      ))}
    </ul>
  )
}

export function AboutTimelineDepthDialog({
  open,
  onOpenChange,
  mainTitle,
  mainDate,
  mainDateEnd,
  mainSkills = [],
  mainTags = [],
  mainAttachments = [],
  depthEvents,
  prevMain,
  nextMain,
}: AboutTimelineDepthDialogProps) {
  const t = useTranslations("aboutPage.timeline")
  const locale = useLocale()
  const [selectedIndex, setSelectedIndex] = React.useState(0)

  React.useEffect(() => {
    if (open) {
      setSelectedIndex(0)
    }
  }, [open, mainTitle])

  const selected = depthEvents[selectedIndex]
  const mainLine = formatRange(mainDate, mainDateEnd, locale, t("dateOngoing"))

  const hasTimelineBody =
    prevMain || nextMain || depthEvents.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        overlayClassName="bg-black/85 backdrop-blur-sm"
        showCloseButton
        className={cn(
          "fixed inset-0 left-0 top-0 z-50 flex h-[100dvh] max-h-[100dvh] w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-0 bg-black p-0 text-zinc-50 shadow-none ring-0 sm:max-w-none",
          "data-open:zoom-in-100 data-closed:zoom-out-100"
        )}
      >
        <DialogHeader className="shrink-0 space-y-1 border-b border-zinc-800 px-4 py-4 text-left">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            {t("depthDialogSubtitle")}
          </p>
          <DialogTitle className="text-2xl font-semibold text-zinc-50">
            {mainTitle}
          </DialogTitle>
          <p className="text-sm text-zinc-400">{mainLine}</p>
          {mainSkills.length + mainTags.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {mainSkills.map((s) => (
                <Badge
                  key={`s-${s.id}`}
                  variant="secondary"
                  className="border border-zinc-600 bg-zinc-900/80 text-zinc-200"
                >
                  {s.label}
                </Badge>
              ))}
              {mainTags.map((g) => (
                <Badge
                  key={`g-${g.id}`}
                  variant="outline"
                  className="border-dashed border-zinc-500 text-zinc-400"
                >
                  {g.label}
                </Badge>
              ))}
            </div>
          ) : null}
          <AttachmentsList items={mainAttachments} t={t} />
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <div className="flex min-h-0 min-h-[45vh] flex-1 flex-col border-zinc-800 md:min-h-0 md:border-r">
            <ScrollArea className="h-full min-h-0">
              <div
                className={cn(
                  "dark bg-black p-4 pr-3",
                  "text-foreground [&_time]:text-zinc-500 [&_h3]:text-zinc-50 [&_.text-muted-foreground]:text-zinc-400",
                  "[&_.ring-background]:ring-zinc-950"
                )}
              >
                {hasTimelineBody ? (
                  <Timeline
                    size="sm"
                    className="max-w-full py-2"
                    iconsize="md"
                  >
                    {prevMain && (
                      <TimelineItem
                        date={prevMain.date}
                        dateLine={prevMain.dateLine}
                        title={prevMain.title}
                        description={t("depthContextPrevious")}
                        icon={<ArrowUp className="size-5" aria-hidden />}
                        iconColor="muted"
                        status="completed"
                      />
                    )}

                    {depthEvents.map((ev, i) => (
                      <TimelineItem
                        key={ev.id}
                        date={ev.happened_on}
                        dateLine={formatRange(
                          ev.happened_on,
                          ev.ended_on,
                          locale,
                          t("dateOngoing")
                        )}
                        title={ev.title}
                        description={truncateBody(ev.body)}
                        icon={
                          <TimelineDynamicIcon
                            name={ev.icon}
                            className="size-5"
                          />
                        }
                        iconColor={
                          DEPTH_ICON_COLORS[i % DEPTH_ICON_COLORS.length]
                        }
                        status={
                          i === depthEvents.length - 1 && !nextMain
                            ? "in-progress"
                            : "completed"
                        }
                        onBubbleClick={() => setSelectedIndex(i)}
                        bubbleAriaLabel={ev.title}
                        selected={i === selectedIndex}
                      />
                    ))}

                    {nextMain && (
                      <TimelineItem
                        date={nextMain.date}
                        dateLine={nextMain.dateLine}
                        title={nextMain.title}
                        description={t("depthContextNext")}
                        icon={<ArrowDown className="size-5" aria-hidden />}
                        iconColor="muted"
                        status="completed"
                      />
                    )}
                  </Timeline>
                ) : (
                  <p className="py-6 text-sm text-zinc-500">
                    {t("depthSelectDetail")}
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>

          <Separator className="shrink-0 md:hidden" />

          <div className="flex min-h-0 min-h-[35vh] flex-1 flex-col bg-zinc-950/50 md:min-h-0">
            <ScrollArea className="h-full min-h-0">
              <div className="p-4 md:p-6">
                {selected ? (
                  <>
                    <time
                      className="text-sm text-zinc-500"
                      dateTime={
                        selected.happened_on
                          ? new Date(selected.happened_on).toISOString()
                          : undefined
                      }
                    >
                      {formatRange(
                        selected.happened_on,
                        selected.ended_on,
                        locale,
                        t("dateOngoing")
                      )}
                    </time>
                    <h3 className="mt-2 text-lg font-semibold text-zinc-50">
                      {selected.title}
                    </h3>
                    <p className="mt-4 whitespace-pre-wrap text-base leading-relaxed text-zinc-300">
                      {selected.body}
                    </p>
                    <AttachmentsList items={selected.attachments} t={t} />
                  </>
                ) : (
                  <p className="text-sm text-zinc-500">{t("depthSelectDetail")}</p>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
