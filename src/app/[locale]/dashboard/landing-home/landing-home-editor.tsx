"use client"

/*
 * Copyright (C) 2026 Ivan Bondaruk (https://bondarukid.com)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 */

import { useCallback, useEffect, useState } from "react"
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
import { LANDING_FEATURE_LUCIDE_KEYS } from "@/config/landing-feature-icons"
import { TECH_STACK_ICON_SLUGS } from "@/config/tech-stack-icons"
import type { LandingFeatureCardRow } from "@/lib/supabase/landing-home-i18n"
import type { LandingFeatureSectionRow } from "@/lib/supabase/landing-home-i18n"
import type { LandingTechStackCategoryRow } from "@/lib/supabase/landing-home-i18n"
import type { LandingTechStackItemRow } from "@/lib/supabase/landing-home-i18n"
import type { LandingTechStackSectionRow } from "@/lib/supabase/landing-home-i18n"
import { groupTechStackItemsByCategory } from "@/lib/supabase/landing-home-i18n"
import {
  saveFeatureSectionAction,
  createFeatureCardAction,
  updateFeatureCardAction,
  deleteFeatureCardAction,
  reorderFeatureCardsAction,
  saveTechStackSectionAction,
  createTechCategoryAction,
  updateTechCategoryAction,
  deleteTechCategoryAction,
  reorderTechCategoriesAction,
  createTechItemAction,
  updateTechItemAction,
  deleteTechItemAction,
  reorderTechItemsInCategoryAction,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusIcon, Trash2Icon, GripVerticalIcon } from "lucide-react"
import { routing } from "@/i18n/routing"

const LOCALES = [
  { id: "en", label: "English" },
  { id: "uk", label: "Ukrainian" },
  { id: "ja", label: "日本語" },
] as const

type LandingHomeEditorProps = {
  featureSection: LandingFeatureSectionRow
  featureCards: LandingFeatureCardRow[]
  techSection: LandingTechStackSectionRow
  techItems: LandingTechStackItemRow[]
  techCategories: LandingTechStackCategoryRow[]
}

export function LandingHomeEditor({
  featureSection: initialFS,
  featureCards: initialCards,
  techSection: initialTS,
  techItems: initialItems,
  techCategories: initialCategories,
}: LandingHomeEditorProps) {
  const t = useTranslations("dashboard.landingHomePage")
  const router = useRouter()
  const [activeLocale, setActiveLocale] = useState("en")

  const [feat, setFeat] = useState(() => ({
    heading_en: initialFS.heading_en,
    heading_uk: initialFS.heading_uk,
    heading_ja: initialFS.heading_ja,
    intro_en: initialFS.intro_en,
    intro_uk: initialFS.intro_uk,
    intro_ja: initialFS.intro_ja,
  }))

  const [tech, setTech] = useState(() => ({
    heading_en: initialTS.heading_en,
    heading_uk: initialTS.heading_uk,
    heading_ja: initialTS.heading_ja,
    subcopy_en: initialTS.subcopy_en,
    subcopy_uk: initialTS.subcopy_uk,
    subcopy_ja: initialTS.subcopy_ja,
    learn_more_en: initialTS.learn_more_en,
    learn_more_uk: initialTS.learn_more_uk,
    learn_more_ja: initialTS.learn_more_ja,
  }))

  const [savingF, setSavingF] = useState(false)
  const [savingT, setSavingT] = useState(false)

  const onSaveFeatureSection = async () => {
    setSavingF(true)
    const r = await saveFeatureSectionAction(feat)
    setSavingF(false)
    if (r.error) {
      toast.error(r.error)
    } else {
      toast.success(t("saved"))
      router.refresh()
    }
  }

  const onSaveTechSection = async () => {
    setSavingT(true)
    const r = await saveTechStackSectionAction(tech)
    setSavingT(false)
    if (r.error) {
      toast.error(r.error)
    } else {
      toast.success(t("saved"))
      router.refresh()
    }
  }

  const [orderedFeatureIds, setOrderedFeatureIds] = useState(() =>
    initialCards.map((c) => c.id)
  )
  const cards = initialCards
  const cardsById = new Map(cards.map((c) => [c.id, c]))

  useEffect(() => {
    setOrderedFeatureIds(initialCards.map((c) => c.id))
  }, [initialCards.map((c) => c.id).join(",")])

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    }),
    useSensor(KeyboardSensor)
  )

  const onDragEndFeatures = useCallback(
    async (e: DragEndEvent) => {
      const { active, over } = e
      if (!over || active.id === over.id) return
      const oldI = orderedFeatureIds.indexOf(active.id as string)
      const newI = orderedFeatureIds.indexOf(over.id as string)
      if (oldI === -1 || newI === -1) return
      const prev = orderedFeatureIds
      const next = arrayMove(orderedFeatureIds, oldI, newI)
      setOrderedFeatureIds(next)
      const r = await reorderFeatureCardsAction(next)
      if (r.error) {
        toast.error(r.error)
        setOrderedFeatureIds(prev)
      } else {
        toast.success(t("saved"))
        router.refresh()
      }
    },
    [orderedFeatureIds, t, router]
  )

  const featureHeadingKey: keyof typeof feat =
    activeLocale === "en"
      ? "heading_en"
      : activeLocale === "uk"
        ? "heading_uk"
        : "heading_ja"
  const featureIntroKey: keyof typeof feat =
    activeLocale === "en"
      ? "intro_en"
      : activeLocale === "uk"
        ? "intro_uk"
        : "intro_ja"

  const updateFeat = (k: keyof typeof feat, v: string) => {
    setFeat((f) => ({ ...f, [k]: v }))
  }

  useEffect(() => {
    setFeat({
      heading_en: initialFS.heading_en,
      heading_uk: initialFS.heading_uk,
      heading_ja: initialFS.heading_ja,
      intro_en: initialFS.intro_en,
      intro_uk: initialFS.intro_uk,
      intro_ja: initialFS.intro_ja,
    })
  }, [initialFS.updated_at])

  useEffect(() => {
    setTech({
      heading_en: initialTS.heading_en,
      heading_uk: initialTS.heading_uk,
      heading_ja: initialTS.heading_ja,
      subcopy_en: initialTS.subcopy_en,
      subcopy_uk: initialTS.subcopy_uk,
      subcopy_ja: initialTS.subcopy_ja,
      learn_more_en: initialTS.learn_more_en,
      learn_more_uk: initialTS.learn_more_uk,
      learn_more_ja: initialTS.learn_more_ja,
    })
  }, [initialTS.updated_at])

  const [orderedCategoryIds, setOrderedCategoryIds] = useState(() =>
    initialCategories.map((c) => c.id)
  )
  const categories = initialCategories
  const categoryById = new Map(categories.map((c) => [c.id, c]))
  useEffect(() => {
    setOrderedCategoryIds(initialCategories.map((c) => c.id))
  }, [initialCategories.map((c) => c.id).join(",")])

  const onDragEndCategories = useCallback(
    async (e: DragEndEvent) => {
      const { active, over } = e
      if (!over || active.id === over.id) return
      const oldI = orderedCategoryIds.indexOf(active.id as string)
      const newI = orderedCategoryIds.indexOf(over.id as string)
      if (oldI === -1 || newI === -1) return
      const prev = orderedCategoryIds
      const next = arrayMove(orderedCategoryIds, oldI, newI)
      setOrderedCategoryIds(next)
      const r = await reorderTechCategoriesAction(next)
      if (r.error) {
        toast.error(r.error)
        setOrderedCategoryIds(prev)
      } else {
        toast.success(t("saved"))
        router.refresh()
      }
    },
    [orderedCategoryIds, t, router]
  )

  const updateTechField = (k: keyof typeof tech, v: string) => {
    setTech((x) => ({ ...x, [k]: v }))
  }

  const onUpdateFeatureCard = async (
    id: string,
    field: string,
    value: string
  ) => {
    const u: Record<string, string> = {}
    u[field] = value
    const r = await updateFeatureCardAction({ id, ...u } as {
      id: string
    } & Record<string, string>)
    if (r.error) {
      toast.error(r.error)
    } else {
      toast.success(t("saved"))
      router.refresh()
    }
  }

  const onAddFeatureCard = async () => {
    const r = await createFeatureCardAction({
      lucide_icon: "zap",
      title_en: t("newCardTitle"),
      title_uk: "",
      title_ja: "",
      body_en: "",
      body_uk: "",
      body_ja: "",
    })
    if (r.error) toast.error(r.error)
    else {
      toast.success(t("itemAdded"))
      router.refresh()
    }
  }

  const onDeleteFeature = async (id: string) => {
    const r = await deleteFeatureCardAction(id)
    if (r.error) toast.error(r.error)
    else {
      toast.success(t("itemDeleted"))
      router.refresh()
    }
  }

  const localeOptions = LOCALES.filter((l) => routing.locales.includes(l.id))

  const grouped = groupTechStackItemsByCategory(initialItems)

  const onAddCategory = async () => {
    const label = t("newCategoryLabel")
    const r = await createTechCategoryAction({
      label_en: label,
      label_uk: label,
      label_ja: label,
    })
    if (r.error) toast.error(r.error)
    else {
      toast.success(t("categoryAdded"))
      router.refresh()
    }
  }

  const onUpdateCategory = async (id: string, field: string, value: string) => {
    const r = await updateTechCategoryAction({
      id,
      [field]: value,
    } as { id: string; label_en?: string; label_uk?: string; label_ja?: string })
    if (r.error) toast.error(r.error)
    else {
      toast.success(t("saved"))
      router.refresh()
    }
  }

  const onDeleteCategory = async (id: string) => {
    const r = await deleteTechCategoryAction(id)
    if (r.error) toast.error(r.error)
    else {
      toast.success(t("categoryDeleted"))
      router.refresh()
    }
  }

  const firstCategoryId = orderedCategoryIds[0] ?? ""

  return (
    <div className="space-y-8">
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("featureSectionTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 max-w-2xl">
          <div>
            <Label htmlFor="fh">{t("featureHeading")}</Label>
            <Input
              id="fh"
              value={feat[featureHeadingKey] ?? ""}
              onChange={(e) => updateFeat(featureHeadingKey, e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="fi">{t("featureIntro")}</Label>
            <Textarea
              id="fi"
              value={feat[featureIntroKey] ?? ""}
              onChange={(e) => updateFeat(featureIntroKey, e.target.value)}
              rows={4}
            />
          </div>
          <Button
            type="button"
            onClick={onSaveFeatureSection}
            disabled={savingF}
          >
            {savingF ? t("saving") : t("saveSection")}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">{t("featureCards")}</h3>
        <DndContext
          id="landing-dnd-feature-cards"
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={onDragEndFeatures}
        >
          <SortableContext
            items={orderedFeatureIds}
            strategy={verticalListSortingStrategy}
          >
            {orderedFeatureIds.map((id) => {
              const c = cardsById.get(id)
              if (!c) return null
              return (
                <SortableFeatureRow
                  key={id}
                  id={id}
                  card={c}
                  activeLocale={activeLocale}
                  onUpdate={onUpdateFeatureCard}
                  onDelete={onDeleteFeature}
                  t={t}
                />
              )
            })}
          </SortableContext>
        </DndContext>
        <Button variant="outline" size="sm" onClick={onAddFeatureCard}>
          <PlusIcon className="size-4 mr-1" />
          {t("addFeatureCard")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {t("techStackSectionTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 max-w-2xl">
          {(["heading", "subcopy", "learn_more"] as const).map((prefix) => {
            const su =
              activeLocale === "en" ? "en" : activeLocale === "uk" ? "uk" : "ja"
            const k = `${prefix}_${su}` as keyof typeof tech
            return (
              <div key={k}>
                <Label>{t(`field_${prefix}` as "field_heading")}</Label>
                <Input
                  value={String(tech[k] ?? "")}
                  onChange={(e) =>
                    updateTechField(
                      k,
                      e.target.value
                    )
                  }
                />
              </div>
            )
          })}
          <Button
            type="button"
            onClick={onSaveTechSection}
            disabled={savingT}
          >
            {savingT ? t("saving") : t("saveSection")}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">{t("techStackCategories")}</h3>
        <p className="text-muted-foreground text-xs max-w-xl">
          {t("techStackCategoriesHelp")}
        </p>
        <DndContext
          id="landing-dnd-tech-categories"
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={onDragEndCategories}
        >
          <SortableContext
            items={orderedCategoryIds}
            strategy={verticalListSortingStrategy}
          >
            {orderedCategoryIds.map((id) => {
              const cat = categoryById.get(id)
              if (!cat) return null
              return (
                <SortableCategoryRow
                  key={id}
                  id={id}
                  category={cat}
                  activeLocale={activeLocale}
                  onUpdate={onUpdateCategory}
                  onDelete={onDeleteCategory}
                  t={t}
                />
              )
            })}
          </SortableContext>
        </DndContext>
        <Button variant="outline" size="sm" type="button" onClick={onAddCategory}>
          <PlusIcon className="size-4 mr-1" />
          {t("addCategory")}
        </Button>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium">{t("techStackItems")}</h3>
        {firstCategoryId ? (
          <Tabs
            key={orderedCategoryIds.join("-")}
            defaultValue={firstCategoryId}
            className="w-full"
          >
            <TabsList className="flex w-full max-w-2xl flex-wrap h-auto min-h-9 p-1">
              {orderedCategoryIds.map((cid) => {
                const cat = categoryById.get(cid)
                if (!cat) return null
                const su =
                  activeLocale === "en"
                    ? "en"
                    : activeLocale === "uk"
                      ? "uk"
                      : "ja"
                const label =
                  su === "en"
                    ? cat.label_en
                    : su === "uk"
                      ? cat.label_uk
                      : cat.label_ja
                return (
                  <TabsTrigger key={cid} value={cid} className="shrink-0">
                    {label || "—"}
                  </TabsTrigger>
                )
              })}
            </TabsList>
            {orderedCategoryIds.map((tabCid) => {
              const cat = categoryById.get(tabCid)
              if (!cat) return null
              return (
                <TabsContent key={tabCid} value={tabCid} className="pt-4">
                  <TechTabList
                    categoryId={tabCid}
                    items={grouped.get(tabCid) ?? []}
                    activeLocale={activeLocale}
                    t={t}
                    router={router}
                    sensors={sensors}
                  />
                </TabsContent>
              )
            })}
          </Tabs>
        ) : (
          <p className="text-muted-foreground text-sm">{t("addCategoryFirst")}</p>
        )}
      </div>
    </div>
  )
}

function SortableCategoryRow({
  id,
  category,
  activeLocale,
  onUpdate,
  onDelete,
  t,
}: {
  id: string
  category: LandingTechStackCategoryRow
  activeLocale: string
  onUpdate: (id: string, field: string, value: string) => void
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
  } = useSortable({ id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  const tKey =
    activeLocale === "en" ? "en" : activeLocale === "uk" ? "uk" : "ja"
  const labelField = `label_${tKey}` as const
  const label = category[labelField]
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("mb-3", isDragging ? "opacity-50" : "")}
    >
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2">
            <Button
              {...attributes}
              {...listeners}
              variant="ghost"
              size="icon"
              className="size-8 shrink-0 cursor-grab"
              type="button"
            >
              <GripVerticalIcon className="size-4 text-muted-foreground" />
            </Button>
            <div className="min-w-0 flex-1 space-y-1">
              <Label>{t("categoryLabel")}</Label>
              <Input
                key={`${id}-label-${tKey}`}
                defaultValue={label}
                onBlur={(e) => {
                  if (e.target.value !== label) {
                    onUpdate(id, labelField, e.target.value.trim())
                  }
                }}
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={() => onDelete(id)}
            >
              <Trash2Icon className="size-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function SortableFeatureRow({
  id,
  card,
  activeLocale,
  onUpdate,
  onDelete,
  t,
}: {
  id: string
  card: LandingFeatureCardRow
  activeLocale: string
  onUpdate: (id: string, field: string, value: string) => void
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
  } = useSortable({ id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const tKey =
    activeLocale === "en" ? "en" : activeLocale === "uk" ? "uk" : "ja"
  const titleField = `title_${tKey}` as const
  const bodyField = `body_${tKey}` as const
  const title = card[titleField]
  const body = card[bodyField]

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("mb-3", isDragging ? "opacity-50" : "")}
    >
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Button
              {...attributes}
              {...listeners}
              variant="ghost"
              size="icon"
              className="size-8 shrink-0 cursor-grab"
              type="button"
            >
              <GripVerticalIcon className="size-4 text-muted-foreground" />
            </Button>
            <CardTitle className="flex-1 text-sm">{title || "—"}</CardTitle>
            <Select
              value={card.lucide_icon}
              onValueChange={(v) => onUpdate(id, "lucide_icon", v ?? "")}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANDING_FEATURE_LUCIDE_KEYS.map((ico) => (
                  <SelectItem key={ico} value={String(ico)}>
                    {String(ico)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={() => onDelete(id)}
            >
              <Trash2Icon className="size-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <Label>{t("titleField")}</Label>
            <Input
              key={`${id}-title-${tKey}`}
              defaultValue={title}
              onBlur={(e) => {
                if (e.target.value !== title) {
                  onUpdate(id, titleField, e.target.value.trim())
                }
              }}
            />
          </div>
          <div>
            <Label>{t("bodyField")}</Label>
            <Textarea
              key={`${id}-body-${tKey}`}
              defaultValue={body}
              rows={3}
              onBlur={(e) => {
                if (e.target.value !== body) {
                  onUpdate(id, bodyField, e.target.value.trim())
                }
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function TechTabList({
  categoryId,
  items,
  activeLocale,
  t,
  router,
  sensors,
}: {
  categoryId: string
  items: LandingTechStackItemRow[]
  activeLocale: string
  t: (k: string) => string
  router: ReturnType<typeof useRouter>
  sensors: ReturnType<typeof useSensors>
}) {
  const [order, setOrder] = useState(() => items.map((i) => i.id))
  useEffect(() => {
    setOrder(items.map((i) => i.id))
  }, [items.map((i) => i.id).join(",")])
  const byId = new Map(items.map((i) => [i.id, i]))

  const onDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldI = order.indexOf(active.id as string)
    const newI = order.indexOf(over.id as string)
    if (oldI === -1 || newI === -1) return
    const prev = order
    const next = arrayMove(order, oldI, newI)
    setOrder(next)
    const r = await reorderTechItemsInCategoryAction(categoryId, next)
    if (r.error) {
      toast.error(r.error)
      setOrder(prev)
    } else {
      toast.success(t("saved"))
      router.refresh()
    }
  }

  const onUpdate = async (id: string, field: string, value: string) => {
    const u: Record<string, string> = { [field]: value }
    const r = await updateTechItemAction({ id, ...u } as {
      id: string
    } & Record<string, string>)
    if (r.error) toast.error(r.error)
    else {
      toast.success(t("saved"))
      router.refresh()
    }
  }

  const onAdd = async () => {
    const r = await createTechItemAction({
      category_id: categoryId,
      simple_icon_slug: "nextdotjs",
      title_en: t("newTechItemTitle"),
      title_uk: "",
      title_ja: "",
      desc_en: "",
      desc_uk: "",
      desc_ja: "",
    })
    if (r.error) toast.error(r.error)
    else {
      toast.success(t("itemAdded"))
      router.refresh()
    }
  }

  const onDelete = async (id: string) => {
    const r = await deleteTechItemAction(id)
    if (r.error) toast.error(r.error)
    else {
      toast.success(t("itemDeleted"))
      router.refresh()
    }
  }

  const tKey = activeLocale === "en" ? "en" : activeLocale === "uk" ? "uk" : "ja"
  const titleSuf = `title_${tKey}` as const
  const descSuf = `desc_${tKey}` as const

  return (
    <div className="space-y-2">
      <DndContext
        id={`landing-dnd-tech-items-${categoryId}`}
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={onDragEnd}
      >
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          {order.map((id) => {
            const row = byId.get(id)
            if (!row) return null
            return (
              <SortableTechRow
                key={id}
                id={id}
                item={row}
                titleSuf={titleSuf}
                descSuf={descSuf}
                onUpdate={onUpdate}
                onDelete={onDelete}
                t={t}
              />
            )
          })}
        </SortableContext>
      </DndContext>
      <Button variant="outline" size="sm" onClick={onAdd}>
        <PlusIcon className="size-4 mr-1" />
        {t("addTechItem")}
      </Button>
    </div>
  )
}

function SortableTechRow({
  id,
  item,
  titleSuf,
  descSuf,
  onUpdate,
  onDelete,
  t,
}: {
  id: string
  item: LandingTechStackItemRow
  titleSuf: "title_en" | "title_uk" | "title_ja"
  descSuf: "desc_en" | "desc_uk" | "desc_ja"
  onUpdate: (id: string, f: string, v: string) => void
  onDelete: (id: string) => void
  t: (k: string) => string
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  const title = item[titleSuf]
  const desc = item[descSuf]
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("mb-3", isDragging ? "opacity-50" : "")}
    >
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Button
              {...attributes}
              {...listeners}
              variant="ghost"
              size="icon"
              className="size-8 shrink-0 cursor-grab"
              type="button"
            >
              <GripVerticalIcon className="size-4" />
            </Button>
            <span className="text-sm font-medium flex-1">{title || "—"}</span>
            <Select
              value={item.simple_icon_slug}
              onValueChange={(v) => onUpdate(id, "simple_icon_slug", v ?? "")}
            >
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TECH_STACK_ICON_SLUGS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" onClick={() => onDelete(id)}>
              <Trash2Icon className="size-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <Label>{t("titleField")}</Label>
            <Input
              defaultValue={title}
              onBlur={(e) => {
                if (e.target.value !== title) {
                  onUpdate(id, titleSuf, e.target.value.trim())
                }
              }}
            />
          </div>
          <div>
            <Label>{t("descriptionField")}</Label>
            <Textarea
              defaultValue={desc}
              rows={2}
              onBlur={(e) => {
                if (e.target.value !== desc) {
                  onUpdate(id, descSuf, e.target.value.trim())
                }
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
