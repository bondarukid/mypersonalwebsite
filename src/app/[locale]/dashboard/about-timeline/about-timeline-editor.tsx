"use client"

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

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVerticalIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { TIMELINE_ICON_OPTIONS } from "@/config/timeline-icons"
import { TimelineDynamicIcon } from "@/components/timeline-dynamic-icon"
import type {
  AboutTimelineDepthRow,
  AboutTimelineMilestoneWithDepth,
  AboutTimelineSkillRow,
  AboutTimelineTagRow,
} from "@/lib/about-timeline-types"
import {
  createMilestoneAction,
  updateMilestoneAction,
  deleteMilestoneAction,
  reorderMilestonesAction,
  createDepthEventAction,
  updateDepthEventAction,
  deleteDepthEventAction,
  reorderDepthEventsAction,
  setMilestoneSkillsAction,
  setMilestoneTagsAction,
} from "./actions"
import { TimelineAttachmentsBlock } from "./timeline-attachments-block"
import { TimelineSkillsTagsCatalog } from "./timeline-skills-tags-catalog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DatePicker } from "@/components/ui/date-picker"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import { routing } from "@/i18n/routing"

const LOCALES = [
  { id: "en", label: "English" },
  { id: "uk", label: "Ukrainian" },
  { id: "ja", label: "日本語" },
] as const

function TimelineIconSelect({
  value,
  onValueChange,
  className,
  "aria-label": ariaLabel,
}: {
  value: string
  onValueChange: (v: string) => void
  className?: string
  "aria-label"?: string
}) {
  const safe = (value || "circle").replace(/_/g, "-")
  return (
    <Select
      value={value || "circle"}
      onValueChange={(v) => onValueChange(v ?? "")}
    >
      <SelectTrigger
        className={cn("min-w-0 gap-1.5", className)}
        aria-label={ariaLabel}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2 pr-0.5">
          <TimelineDynamicIcon
            name={safe}
            className="size-4 shrink-0 text-foreground"
          />
          <span className="min-w-0 flex-1 truncate text-left text-sm">
            {safe}
          </span>
        </div>
      </SelectTrigger>
      <SelectContent>
        {TIMELINE_ICON_OPTIONS.map((ico) => (
          <SelectItem key={ico} value={ico}>
            <span className="flex w-full min-w-0 items-center gap-2">
              <TimelineDynamicIcon
                name={ico}
                className="size-4 shrink-0 text-foreground"
              />
              <span className="min-w-0 flex-1 truncate text-left text-sm">
                {ico}
              </span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function todayISODate(): string {
  return new Date().toISOString().slice(0, 10)
}

function MilestoneSkillTagPickers({
  milestone,
  skillCatalog,
  tagCatalog,
  activeLocale,
  t,
  onRefresh,
}: {
  milestone: AboutTimelineMilestoneWithDepth
  skillCatalog: AboutTimelineSkillRow[]
  tagCatalog: AboutTimelineTagRow[]
  activeLocale: string
  t: (key: string) => string
  onRefresh: () => void
}) {
  const skillLabel = (row: { label_en: string; label_uk: string; label_ja: string }) => {
    if (activeLocale === "uk") return row.label_uk || row.label_en
    if (activeLocale === "ja") return row.label_ja || row.label_en
    return row.label_en
  }

  const selectedSkill = new Set(milestone.skills.map((s) => s.id))
  const selectedTag = new Set(milestone.tags.map((x) => x.id))

  const toggleSkill = async (id: string) => {
    const next = new Set(milestone.skills.map((s) => s.id))
    if (next.has(id)) next.delete(id)
    else next.add(id)
    const r = await setMilestoneSkillsAction(milestone.id, [...next])
    if (r.error) {
      toast.error(r.error)
    } else {
      toast.success(t("saved"))
      onRefresh()
    }
  }

  const toggleTag = async (id: string) => {
    const next = new Set(milestone.tags.map((s) => s.id))
    if (next.has(id)) next.delete(id)
    else next.add(id)
    const r = await setMilestoneTagsAction(milestone.id, [...next])
    if (r.error) {
      toast.error(r.error)
    } else {
      toast.success(t("saved"))
      onRefresh()
    }
  }

  return (
    <div className="space-y-3 border-t border-border pt-3">
      <div>
        <p className="mb-2 text-sm font-medium">{t("milestoneSkills")}</p>
        {skillCatalog.length === 0 ? (
          <p className="text-xs text-muted-foreground">{t("addSkillsInLibrary")}</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {skillCatalog.map((s) => (
              <label
                key={s.id}
                className="flex cursor-pointer items-center gap-2 text-sm"
              >
                <Checkbox
                  checked={selectedSkill.has(s.id)}
                  onCheckedChange={() => {
                    void toggleSkill(s.id)
                  }}
                />
                <span>{skillLabel(s)}</span>
              </label>
            ))}
          </div>
        )}
      </div>
      <div>
        <p className="mb-2 text-sm font-medium">{t("milestoneTags")}</p>
        {tagCatalog.length === 0 ? (
          <p className="text-xs text-muted-foreground">{t("addTagsInLibrary")}</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {tagCatalog.map((g) => (
              <label
                key={g.id}
                className="flex cursor-pointer items-center gap-2 text-sm"
              >
                <Checkbox
                  checked={selectedTag.has(g.id)}
                  onCheckedChange={() => {
                    void toggleTag(g.id)
                  }}
                />
                <span>{g.label_en}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

type DepthEventWithAtt =
  AboutTimelineMilestoneWithDepth["depth_events"][number]

function nextMilestoneSortOrder(milestones: AboutTimelineMilestoneWithDepth[]): number {
  if (milestones.length === 0) return 0
  return Math.max(...milestones.map((m) => m.sort_order)) + 1
}

function SortableDepthRow({
  depth,
  activeLocale,
  savingId,
  onUpdate,
  onDelete,
  t,
}: {
  depth: DepthEventWithAtt
  activeLocale: string
  savingId: string | null
  onUpdate: (
    id: string,
    field:
      | "happened_on"
      | "ended_on"
      | "icon"
      | "title_en"
      | "title_uk"
      | "title_ja"
      | "body_en"
      | "body_uk"
      | "body_ja",
    value: string
  ) => void
  onDelete: (id: string) => void
  t: (key: string) => string
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: depth.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const titleKey =
    activeLocale === "en"
      ? "title_en"
      : activeLocale === "uk"
        ? "title_uk"
        : "title_ja"
  const bodyKey =
    activeLocale === "en"
      ? "body_en"
      : activeLocale === "uk"
        ? "body_uk"
        : "body_ja"

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isDragging ? "opacity-50" : ""}
    >
      <Card className="border-dashed">
        <CardHeader className="space-y-2 pb-3">
          <div className="flex items-center gap-2">
            <Button
              {...attributes}
              {...listeners}
              variant="ghost"
              size="icon"
              className="size-8 shrink-0 cursor-grab active:cursor-grabbing"
              aria-label={t("dragDepthToReorder")}
              type="button"
            >
              <GripVerticalIcon className="size-4 text-muted-foreground" />
            </Button>
            <CardTitle className="flex-1 text-sm font-medium">
              {activeLocale === "en"
                ? depth.title_en
                : activeLocale === "uk"
                  ? depth.title_uk
                  : depth.title_ja}
            </CardTitle>
            <TimelineIconSelect
              value={depth.icon}
              onValueChange={(v) => onUpdate(depth.id, "icon", v ?? "")}
              className="w-40 sm:w-44"
            />
            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={() => onDelete(depth.id)}
              aria-label={t("deleteDepthEvent")}
            >
              <Trash2Icon className="size-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-3 pl-10">
            <div className="min-w-[140px] flex-1">
              <Label className="text-xs">{t("dateStart")}</Label>
              <DatePicker
                value={depth.happened_on}
                onValueChange={(v) => onUpdate(depth.id, "happened_on", v)}
                disabled={savingId === depth.id}
                locale={activeLocale}
                placeholder={t("dateStart")}
                aria-label={t("dateStart")}
              />
            </div>
            <div className="min-w-[140px] flex-1">
              <Label className="text-xs">{t("endDateLabel")}</Label>
              <DatePicker
                value={depth.ended_on ?? ""}
                onValueChange={(v) =>
                  onUpdate(depth.id, "ended_on", v ?? "")
                }
                disabled={savingId === depth.id}
                locale={activeLocale}
                placeholder={t("endDateLabel")}
                aria-label={t("endDateLabel")}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <div>
            <Label>{t("depthTitle")}</Label>
            <Input
              key={`${depth.id}-title-${activeLocale}`}
              defaultValue={
                (depth[titleKey as keyof AboutTimelineDepthRow] as string) ?? ""
              }
              onBlur={(e) =>
                onUpdate(depth.id, titleKey, e.target.value.trim())
              }
              disabled={savingId === depth.id}
            />
          </div>
          <div>
            <Label>{t("depthBody")}</Label>
            <Textarea
              key={`${depth.id}-body-${activeLocale}`}
              defaultValue={
                (depth[bodyKey as keyof AboutTimelineDepthRow] as string) ?? ""
              }
              onBlur={(e) =>
                onUpdate(depth.id, bodyKey, e.target.value.trim())
              }
              disabled={savingId === depth.id}
              rows={3}
            />
          </div>
          <TimelineAttachmentsBlock
            t={t}
            depthEventId={depth.id}
            items={depth.attachments}
          />
        </CardContent>
      </Card>
    </div>
  )
}

function DepthEventsBlock({
  milestone,
  activeLocale,
  savingId,
  setSavingId,
  t,
}: {
  milestone: AboutTimelineMilestoneWithDepth
  activeLocale: string
  savingId: string | null
  setSavingId: (id: string | null) => void
  t: (key: string) => string
}) {
  const router = useRouter()
  const [orderedIds, setOrderedIds] = useState<string[]>(() =>
    milestone.depth_events.map((d) => d.id)
  )

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor)
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = orderedIds.indexOf(active.id as string)
    const newIndex = orderedIds.indexOf(over.id as string)
    if (oldIndex === -1 || newIndex === -1) return
    const newOrder = arrayMove(orderedIds, oldIndex, newIndex)
    setOrderedIds(newOrder)
    const result = await reorderDepthEventsAction(milestone.id, newOrder)
    if (result.error) {
      toast.error(result.error)
      setOrderedIds(orderedIds)
    } else {
      toast.success(t("saved"))
      router.refresh()
    }
  }

  const onUpdate = async (
    id: string,
    field:
      | "happened_on"
      | "ended_on"
      | "icon"
      | "title_en"
      | "title_uk"
      | "title_ja"
      | "body_en"
      | "body_uk"
      | "body_ja",
    value: string
  ) => {
    setSavingId(id)
    const updates: Record<string, string | null> = {}
    if (field === "ended_on" && value === "") {
      updates.ended_on = null
    } else {
      updates[field] = value
    }
    const result = await updateDepthEventAction(
      id,
      updates as Parameters<typeof updateDepthEventAction>[1]
    )
    setSavingId(null)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(t("saved"))
      router.refresh()
    }
  }

  const onDelete = async (id: string) => {
    const result = await deleteDepthEventAction(id)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(t("depthDeleted"))
      router.refresh()
    }
  }

  const handleAddDepth = async () => {
    const sortOrder = milestone.depth_events.length
    const result = await createDepthEventAction(milestone.id, {
      sort_order: sortOrder,
      happened_on: todayISODate(),
      ended_on: null,
      icon: "circle",
      title_en: t("newDepthTitle"),
      title_uk: "",
      title_ja: "",
      body_en: "",
      body_uk: "",
      body_ja: "",
    })
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(t("depthAdded"))
      router.refresh()
    }
  }

  return (
    <div className="space-y-3 border-t pt-4">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-medium">{t("depthSectionTitle")}</h4>
        <Button variant="outline" size="sm" type="button" onClick={handleAddDepth}>
          <PlusIcon className="mr-1 size-3.5" />
          {t("addDepthEvent")}
        </Button>
      </div>
      <DndContext
        id={`depth-dnd-${milestone.id}`}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <SortableContext
          items={orderedIds}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {orderedIds
              .map((id) => milestone.depth_events.find((d) => d.id === id))
              .filter((d): d is DepthEventWithAtt => d != null)
              .map((depth) => (
                <SortableDepthRow
                  key={depth.id}
                  depth={depth}
                  activeLocale={activeLocale}
                  savingId={savingId}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  t={t}
                />
              ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}

function SortableMilestoneCard({
  milestone,
  activeLocale,
  savingId,
  onUpdate,
  onDelete,
  skillCatalog,
  tagCatalog,
  onMilestoneMetaRefresh,
  t,
}: {
  milestone: AboutTimelineMilestoneWithDepth
  activeLocale: string
  savingId: string | null
  onUpdate: (
    id: string,
    field:
      | "happened_on"
      | "ended_on"
      | "icon"
      | "title_en"
      | "title_uk"
      | "title_ja"
      | "description_en"
      | "description_uk"
      | "description_ja",
    value: string
  ) => void
  onDelete: (id: string) => void
  skillCatalog: AboutTimelineSkillRow[]
  tagCatalog: AboutTimelineTagRow[]
  onMilestoneMetaRefresh: () => void
  t: (key: string) => string
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: milestone.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const titleKey =
    activeLocale === "en"
      ? "title_en"
      : activeLocale === "uk"
        ? "title_uk"
        : "title_ja"
  const descKey =
    activeLocale === "en"
      ? "description_en"
      : activeLocale === "uk"
        ? "description_uk"
        : "description_ja"

  const [localSaving, setLocalSaving] = useState<string | null>(null)
  const depthEventsSyncKey = milestone.depth_events
    .map((d) => d.id)
    .slice()
    .sort()
    .join(",")

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isDragging ? "opacity-50" : ""}
    >
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Button
              {...attributes}
              {...listeners}
              variant="ghost"
              size="icon"
              className="size-8 shrink-0 cursor-grab active:cursor-grabbing"
              aria-label={t("dragToReorder")}
              type="button"
            >
              <GripVerticalIcon className="size-4 text-muted-foreground" />
            </Button>
            <CardTitle className="flex-1 text-base">
              {activeLocale === "en"
                ? milestone.title_en
                : activeLocale === "uk"
                  ? milestone.title_uk
                  : milestone.title_ja}
            </CardTitle>
            <TimelineIconSelect
              value={milestone.icon}
              onValueChange={(v) => onUpdate(milestone.id, "icon", v ?? "")}
              className="w-44 sm:w-48"
            />
            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={() => onDelete(milestone.id)}
              aria-label={t("deleteMilestone")}
            >
              <Trash2Icon className="size-4" />
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-3 pl-10">
            <div className="min-w-[160px] flex-1">
              <Label className="text-xs">{t("dateStart")}</Label>
              <DatePicker
                value={milestone.happened_on}
                onValueChange={(v) => onUpdate(milestone.id, "happened_on", v)}
                disabled={savingId === milestone.id}
                locale={activeLocale}
                placeholder={t("dateStart")}
                aria-label={t("dateStart")}
              />
            </div>
            <div className="min-w-[160px] flex-1">
              <Label className="text-xs">{t("endDateLabel")}</Label>
              <DatePicker
                value={milestone.ended_on ?? ""}
                onValueChange={(v) => onUpdate(milestone.id, "ended_on", v ?? "")}
                disabled={savingId === milestone.id}
                locale={activeLocale}
                placeholder={t("endDateLabel")}
                aria-label={t("endDateLabel")}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>{t("milestoneTitle")}</Label>
            <Input
              key={`${milestone.id}-mt-${activeLocale}`}
              defaultValue={
                (milestone[titleKey as keyof typeof milestone] as string) ?? ""
              }
              onBlur={(e) =>
                onUpdate(milestone.id, titleKey, e.target.value.trim())
              }
              disabled={savingId === milestone.id}
            />
          </div>
          <div>
            <Label>{t("milestoneDescription")}</Label>
            <Textarea
              key={`${milestone.id}-md-${activeLocale}`}
              defaultValue={
                (milestone[descKey as keyof typeof milestone] as string) ?? ""
              }
              onBlur={(e) =>
                onUpdate(milestone.id, descKey, e.target.value.trim())
              }
              disabled={savingId === milestone.id}
              rows={3}
            />
          </div>
          <MilestoneSkillTagPickers
            milestone={milestone}
            skillCatalog={skillCatalog}
            tagCatalog={tagCatalog}
            activeLocale={activeLocale}
            t={t}
            onRefresh={onMilestoneMetaRefresh}
          />
          <TimelineAttachmentsBlock
            t={t}
            milestoneId={milestone.id}
            items={milestone.attachments}
          />
          <DepthEventsBlock
            key={depthEventsSyncKey}
            milestone={milestone}
            activeLocale={activeLocale}
            savingId={localSaving}
            setSavingId={setLocalSaving}
            t={t}
          />
        </CardContent>
      </Card>
    </div>
  )
}

interface AboutTimelineEditorProps {
  milestones: AboutTimelineMilestoneWithDepth[]
  skillCatalog: AboutTimelineSkillRow[]
  tagCatalog: AboutTimelineTagRow[]
}

type MilestoneFieldUpdate = (
  id: string,
  field:
    | "happened_on"
    | "ended_on"
    | "icon"
    | "title_en"
    | "title_uk"
    | "title_ja"
    | "description_en"
    | "description_uk"
    | "description_ja",
  value: string
) => void

function MilestonesDndSection({
  milestones,
  activeLocale,
  savingId,
  skillCatalog,
  tagCatalog,
  t,
  onMilestoneUpdate,
  onMilestoneDelete,
  onMilestoneMetaRefresh,
}: {
  milestones: AboutTimelineMilestoneWithDepth[]
  activeLocale: string
  savingId: string | null
  skillCatalog: AboutTimelineSkillRow[]
  tagCatalog: AboutTimelineTagRow[]
  t: (k: string) => string
  onMilestoneUpdate: MilestoneFieldUpdate
  onMilestoneDelete: (id: string) => void
  onMilestoneMetaRefresh: () => void
}) {
  const router = useRouter()
  const [orderedIds, setOrderedIds] = useState<string[]>(() =>
    milestones.map((m) => m.id)
  )

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor)
  )

  const handleMilestoneDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = orderedIds.indexOf(active.id as string)
    const newIndex = orderedIds.indexOf(over.id as string)
    if (oldIndex === -1 || newIndex === -1) return
    const newOrder = arrayMove(orderedIds, oldIndex, newIndex)
    setOrderedIds(newOrder)
    const result = await reorderMilestonesAction(newOrder)
    if (result.error) {
      toast.error(result.error)
      setOrderedIds(orderedIds)
    } else {
      toast.success(t("saved"))
      router.refresh()
    }
  }

  return (
    <DndContext
      id="milestone-dnd"
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={handleMilestoneDragEnd}
      sensors={sensors}
    >
      <SortableContext
        items={orderedIds}
        strategy={verticalListSortingStrategy}
      >
        {orderedIds
          .map((id) => milestones.find((m) => m.id === id))
          .filter((m): m is AboutTimelineMilestoneWithDepth => !!m)
          .map((milestone) => (
            <SortableMilestoneCard
              key={milestone.id}
              milestone={milestone}
              activeLocale={activeLocale}
              savingId={savingId}
              onUpdate={onMilestoneUpdate}
              onDelete={onMilestoneDelete}
              skillCatalog={skillCatalog}
              tagCatalog={tagCatalog}
              onMilestoneMetaRefresh={onMilestoneMetaRefresh}
              t={t}
            />
          ))}
      </SortableContext>
    </DndContext>
  )
}

export function AboutTimelineEditor({
  milestones,
  skillCatalog,
  tagCatalog,
}: AboutTimelineEditorProps) {
  const t = useTranslations("dashboard.aboutTimelinePage")
  const router = useRouter()
  const [activeLocale, setActiveLocale] = useState("en")
  const [savingId, setSavingId] = useState<string | null>(null)

  const milestoneSetKey = milestones
    .map((m) => m.id)
    .slice()
    .sort()
    .join(",")

  const handleUpdateMilestone = async (
    id: string,
    field:
      | "happened_on"
      | "ended_on"
      | "icon"
      | "title_en"
      | "title_uk"
      | "title_ja"
      | "description_en"
      | "description_uk"
      | "description_ja",
    value: string
  ) => {
    setSavingId(id)
    const updates: Record<string, string | null> = {}
    if (field === "ended_on" && value === "") {
      updates.ended_on = null
    } else {
      updates[field] = value
    }
    const result = await updateMilestoneAction(
      id,
      updates as Parameters<typeof updateMilestoneAction>[1]
    )
    setSavingId(null)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(t("saved"))
      router.refresh()
    }
  }

  const handleDeleteMilestone = async (id: string) => {
    const result = await deleteMilestoneAction(id)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(t("milestoneDeleted"))
      router.refresh()
    }
  }

  const handleAddMilestone = async () => {
    const sortOrder = nextMilestoneSortOrder(milestones)
    const result = await createMilestoneAction({
      sort_order: sortOrder,
      happened_on: todayISODate(),
      ended_on: null,
      icon: "circle",
      title_en: t("newMilestoneTitle"),
      title_uk: "",
      title_ja: "",
      description_en: "",
      description_uk: "",
      description_ja: "",
    })
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(t("milestoneAdded"))
      router.refresh()
    }
  }

  const localeOptions = LOCALES.filter((l) => routing.locales.includes(l.id))

  return (
    <div className="space-y-6">
      <TimelineSkillsTagsCatalog
        skills={skillCatalog}
        tags={tagCatalog}
        t={t}
      />
      <div
        className="inline-flex w-full max-w-md flex-wrap gap-1 rounded-lg border border-border bg-muted/50 p-1"
        role="tablist"
        aria-label="Locale"
      >
        {localeOptions.map((locale) => (
          <button
            key={locale.id}
            type="button"
            role="tab"
            aria-selected={activeLocale === locale.id}
            className={cn(
              "min-h-8 flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              activeLocale === locale.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setActiveLocale(locale.id)}
          >
            {locale.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <MilestonesDndSection
          key={milestoneSetKey}
          milestones={milestones}
          activeLocale={activeLocale}
          savingId={savingId}
          skillCatalog={skillCatalog}
          tagCatalog={tagCatalog}
          t={t}
          onMilestoneUpdate={handleUpdateMilestone}
          onMilestoneDelete={handleDeleteMilestone}
          onMilestoneMetaRefresh={() => router.refresh()}
        />

        <Button
          variant="outline"
          className="w-full"
          type="button"
          onClick={handleAddMilestone}
        >
          <PlusIcon className="mr-2 size-4" />
          {t("addMilestone")}
        </Button>
      </div>
    </div>
  )
}
