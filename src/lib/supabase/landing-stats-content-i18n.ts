/*
 * Copyright (C) 2026 Ivan Bondaruk (https://bondarukid.com)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * No server imports — safe for Client Components.
 */

export type LandingStatsContentRow = {
  company_id: string
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
  created_at: string
  updated_at: string
}

function pick(
  row: Record<string, unknown>,
  keyPrefix: string,
  locale: string
): string {
  const key = `${keyPrefix}_${locale}` as const
  const v = row[key] ?? row[`${keyPrefix}_en`]
  return typeof v === "string" ? v : ""
}

export function getLocalizedLandingStatsContent(
  row: LandingStatsContentRow,
  locale: string
): {
  heading: string
  description: string
  labelStars: string
  labelActive: string
  labelPowered: string
} {
  const o = row as unknown as Record<string, unknown>
  return {
    heading: pick(o, "heading", locale),
    description: pick(o, "description", locale),
    labelStars: pick(o, "label_stars", locale),
    labelActive: pick(o, "label_active", locale),
    labelPowered: pick(o, "label_powered", locale),
  }
}

export type UpsertLandingStatsContentInput = {
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
