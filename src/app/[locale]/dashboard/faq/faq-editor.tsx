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
import type { FaqSet, FaqItem } from "@/lib/supabase/faq"
import {
  createFaqItemAction,
  updateFaqItemAction,
  deleteFaqItemAction,
  reorderFaqItemsAction,
} from "./actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PlusIcon, Trash2Icon, GripVerticalIcon } from "lucide-react"
import { routing } from "@/i18n/routing"

const LOCALES = [
  { id: "en", label: "English" },
  { id: "uk", label: "Ukrainian" },
  { id: "ja", label: "日本語" },
] as const

const ICON_OPTIONS = [
  "help-circle",
  "clock",
  "credit-card",
  "truck",
  "globe",
  "package",
  "settings",
  "user",
  "mail",
  "message-circle",
] as const

interface FaqEditorProps {
  faqSet: FaqSet
  items: FaqItem[]
}

type FaqItemsDndPanelProps = {
  faqSet: FaqSet
  items: FaqItem[]
  activeLocale: string
  savingId: string | null
  t: (k: string) => string
  onUpdateItem: (
    itemId: string,
    field: "question" | "answer" | "icon",
    value: string
  ) => void
  onDeleteItem: (itemId: string) => void
}

function FaqItemsDndPanel({
  faqSet: _faqSet,
  items,
  activeLocale,
  savingId,
  onUpdateItem,
  onDeleteItem,
  t,
}: FaqItemsDndPanelProps) {
  const router = useRouter()
  const [orderedIds, setOrderedIds] = useState(() => items.map((i) => i.id))

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
    const result = await reorderFaqItemsAction(_faqSet.id, newOrder)
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
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
      <SortableContext
        items={orderedIds}
        strategy={verticalListSortingStrategy}
      >
        {orderedIds
          .map((id) => items.find((i) => i.id === id))
          .filter((i): i is FaqItem => !!i)
          .map((item) => (
            <SortableFaqCard
              key={item.id}
              item={item}
              activeLocale={activeLocale}
              savingId={savingId}
              onUpdate={onUpdateItem}
              onDelete={onDeleteItem}
              t={t}
            />
          ))}
      </SortableContext>
    </DndContext>
  )
}

function SortableFaqCard({
  item,
  activeLocale,
  savingId,
  onUpdate,
  onDelete,
  t,
}: {
  item: FaqItem
  activeLocale: string
  savingId: string | null
  onUpdate: (id: string, field: "question" | "answer" | "icon", value: string) => void
  onDelete: (id: string) => void
  t: (k: string) => string
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? "opacity-50" : ""}>
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
          >
            <GripVerticalIcon className="size-4 text-muted-foreground" />
          </Button>
          <CardTitle className="flex-1 text-base">
            {activeLocale === "en"
              ? item.question_en
              : activeLocale === "uk"
                ? item.question_uk
                : item.question_ja}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select
              value={item.icon}
              onValueChange={(v) => onUpdate(item.id, "icon", v ?? "")}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ICON_OPTIONS.map((ico) => (
                  <SelectItem key={ico} value={ico}>
                    {ico}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(item.id)}
              aria-label={t("deleteItem")}
            >
              <Trash2Icon className="size-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>{t("question")}</Label>
          <Input
            key={`${item.id}-q-${activeLocale}`}
            defaultValue={
              activeLocale === "en"
                ? item.question_en
                : activeLocale === "uk"
                  ? item.question_uk
                  : item.question_ja
            }
            placeholder={t("questionPlaceholder")}
            onBlur={(e) => onUpdate(item.id, "question", e.target.value.trim())}
            disabled={savingId === item.id}
          />
        </div>
        <div>
          <Label>{t("answer")}</Label>
          <Textarea
            key={`${item.id}-a-${activeLocale}`}
            defaultValue={
              activeLocale === "en"
                ? item.answer_en
                : activeLocale === "uk"
                  ? item.answer_uk
                  : item.answer_ja
            }
            placeholder={t("answerPlaceholder")}
            onBlur={(e) => onUpdate(item.id, "answer", e.target.value.trim())}
            disabled={savingId === item.id}
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
    </div>
  )
}

export function FaqEditor({ faqSet, items }: FaqEditorProps) {
  const t = useTranslations("dashboard.faqPage")
  const router = useRouter()
  const [activeLocale, setActiveLocale] = useState("en")
  const [adding, setAdding] = useState(false)
  const [savingId, setSavingId] = useState<string | null>(null)

  const itemIdsKey = items
    .map((i) => i.id)
    .slice()
    .sort()
    .join(",")

  const handleUpdateItem = async (
    itemId: string,
    field: "question" | "answer" | "icon",
    value: string
  ) => {
    setSavingId(itemId)
    const updates: Record<string, string> = {}
    if (field === "question") {
      updates[`question_${activeLocale}`] = value
    } else if (field === "answer") {
      updates[`answer_${activeLocale}`] = value
    } else if (field === "icon") {
      updates.icon = value
    }
    const result = await updateFaqItemAction(itemId, faqSet.id, updates)
    setSavingId(null)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(t("saved"))
      router.refresh()
    }
  }

  const handleAddItem = async () => {
    setAdding(true)
    const result = await createFaqItemAction(faqSet.id, {
      question_en: t("newQuestionPlaceholder"),
      answer_en: t("newAnswerPlaceholder"),
      icon: "help-circle",
    })
    setAdding(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(t("itemAdded"))
      router.refresh()
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    const result = await deleteFaqItemAction(itemId, faqSet.id)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(t("itemDeleted"))
      router.refresh()
    }
  }

  const localeOptions = LOCALES.filter((l) => routing.locales.includes(l.id))

  return (
    <div className="space-y-6">
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
        <FaqItemsDndPanel
          key={itemIdsKey}
          faqSet={faqSet}
          items={items}
          activeLocale={activeLocale}
          savingId={savingId}
          t={t}
          onUpdateItem={handleUpdateItem}
          onDeleteItem={handleDeleteItem}
        />

        <Button
          variant="outline"
          className="w-full"
          onClick={handleAddItem}
          disabled={adding}
        >
          <PlusIcon className="mr-2 size-4" />
          {t("addItem")}
        </Button>
      </div>
    </div>
  )
}
