"use client"

/*
 * Copyright (C) 2026 Ivan Bondaruk (https://bondarukid.com)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 */

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import type { LandingStatsContentRow } from "@/lib/supabase/landing-stats-content-i18n"
import { saveLandingStatsContentAction } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { routing } from "@/i18n/routing"

const LOCALE_TABS = [
  { id: "en", label: "English" },
  { id: "uk", label: "Ukrainian" },
  { id: "ja", label: "日本語" },
] as const

type FormState = {
  heading_en: string
  heading_uk: string
  heading_ja: string
  description_en: string
  description_uk: string
  description_ja: string
  label_stars_en: string
  label_stars_uk: string
  label_stars_ja: string
  label_active_en: string
  label_active_uk: string
  label_active_ja: string
  label_powered_en: string
  label_powered_uk: string
  label_powered_ja: string
  use_manual_totals: boolean
  manual_stars: number
  manual_active_users: number
  manual_powered_apps: number
}

function toForm(row: LandingStatsContentRow): FormState {
  return {
    heading_en: row.heading_en,
    heading_uk: row.heading_uk,
    heading_ja: row.heading_ja,
    description_en: row.description_en,
    description_uk: row.description_uk,
    description_ja: row.description_ja,
    label_stars_en: row.label_stars_en,
    label_stars_uk: row.label_stars_uk,
    label_stars_ja: row.label_stars_ja,
    label_active_en: row.label_active_en,
    label_active_uk: row.label_active_uk,
    label_active_ja: row.label_active_ja,
    label_powered_en: row.label_powered_en,
    label_powered_uk: row.label_powered_uk,
    label_powered_ja: row.label_powered_ja,
    use_manual_totals: row.use_manual_totals,
    manual_stars: row.manual_stars,
    manual_active_users: row.manual_active_users,
    manual_powered_apps: row.manual_powered_apps,
  }
}

function LandingStatsSectionForm({
  initial,
}: {
  initial: LandingStatsContentRow
}) {
  const t = useTranslations("dashboard.landingStatsPage")
  const router = useRouter()
  const [activeLocale, setActiveLocale] = useState("en")
  const [saving, setSaving] = useState(false)
  const [f, setF] = useState<FormState>(() => toForm(initial))

  const locale = activeLocale
  const headingKey = `heading_${locale === "en" ? "en" : locale === "uk" ? "uk" : "ja"}` as
    | "heading_en"
    | "heading_uk"
    | "heading_ja"
  const descKey = `description_${locale === "en" ? "en" : locale === "uk" ? "uk" : "ja"}` as
    | "description_en"
    | "description_uk"
    | "description_ja"
  const lStars = `label_stars_${locale === "en" ? "en" : locale === "uk" ? "uk" : "ja"}` as const
  const lActive = `label_active_${locale === "en" ? "en" : locale === "uk" ? "uk" : "ja"}` as const
  const lPowered = `label_powered_${locale === "en" ? "en" : locale === "uk" ? "uk" : "ja"}` as const

  const setKey = (key: keyof FormState, v: string | number | boolean) => {
    setF((p) => ({ ...p, [key]: v }))
  }

  const onSave = async () => {
    setSaving(true)
    const r = await saveLandingStatsContentAction(f)
    setSaving(false)
    if (r.error) {
      toast.error(r.error)
    } else {
      toast.success(t("saved"))
      router.refresh()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("sectionCopyTitle")}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {t("sectionCopyDescription")}
        </p>
      </CardHeader>
      <CardContent className="space-y-4 max-w-2xl">
        <div
          className="inline-flex w-full max-w-md flex-wrap gap-1 rounded-lg border border-border bg-muted/50 p-1"
          role="tablist"
        >
          {LOCALE_TABS.filter((l) => routing.locales.includes(l.id)).map(
            (loc) => (
              <button
                key={loc.id}
                type="button"
                role="tab"
                className={cn(
                  "min-h-8 flex-1 rounded-md px-3 py-1.5 text-sm font-medium",
                  activeLocale === loc.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground"
                )}
                onClick={() => setActiveLocale(loc.id)}
              >
                {loc.label}
              </button>
            )
          )}
        </div>
        <div>
          <Label htmlFor="st-h">{t("sectionHeading")}</Label>
          <Input
            id="st-h"
            value={f[headingKey]}
            onChange={(e) => setKey(headingKey, e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="st-d">{t("sectionDescription")}</Label>
          <Textarea
            id="st-d"
            value={f[descKey]}
            onChange={(e) => setKey(descKey, e.target.value)}
            rows={3}
          />
        </div>
        <div>
          <Label htmlFor="st-s">{t("labelStars")}</Label>
          <Input
            id="st-s"
            value={f[lStars]}
            onChange={(e) => setKey(lStars, e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="st-a">{t("labelActive")}</Label>
          <Input
            id="st-a"
            value={f[lActive]}
            onChange={(e) => setKey(lActive, e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="st-p">{t("labelPowered")}</Label>
          <Input
            id="st-p"
            value={f[lPowered]}
            onChange={(e) => setKey(lPowered, e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
          <div className="space-y-0.5">
            <Label htmlFor="man">{t("useManualTotals")}</Label>
            <p className="text-xs text-muted-foreground">
              {t("useManualTotalsHelp")}
            </p>
          </div>
          <Switch
            id="man"
            checked={f.use_manual_totals}
            onCheckedChange={(v) => setKey("use_manual_totals", v)}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <Label className={!f.use_manual_totals ? "text-muted-foreground" : ""}>
              {t("manualStars")}
            </Label>
            <Input
              type="number"
              min={0}
              value={f.manual_stars}
              onChange={(e) =>
                setKey("manual_stars", parseInt(e.target.value, 10) || 0)
              }
              disabled={!f.use_manual_totals}
            />
          </div>
          <div>
            <Label className={!f.use_manual_totals ? "text-muted-foreground" : ""}>
              {t("manualActiveUsers")}
            </Label>
            <Input
              type="number"
              min={0}
              value={f.manual_active_users}
              onChange={(e) =>
                setKey(
                  "manual_active_users",
                  parseInt(e.target.value, 10) || 0
                )
              }
              disabled={!f.use_manual_totals}
            />
          </div>
          <div>
            <Label className={!f.use_manual_totals ? "text-muted-foreground" : ""}>
              {t("manualPoweredApps")}
            </Label>
            <Input
              type="number"
              min={0}
              value={f.manual_powered_apps}
              onChange={(e) =>
                setKey(
                  "manual_powered_apps",
                  parseInt(e.target.value, 10) || 0
                )
              }
              disabled={!f.use_manual_totals}
            />
          </div>
        </div>

        <Button type="button" onClick={onSave} disabled={saving}>
          {saving ? t("saving") : t("saveSectionCopy")}
        </Button>
      </CardContent>
    </Card>
  )
}

export function LandingStatsSectionEditor({
  initial,
}: {
  initial: LandingStatsContentRow
}) {
  return <LandingStatsSectionForm key={initial.updated_at} initial={initial} />
}
