/*
 * Copyright (C) 2026 Ivan Bondaruk (https://bondarukid.com)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 */

export * from "./landing-stats-content-i18n"

import { createClient } from "./server"
import type { UpsertLandingStatsContentInput } from "./landing-stats-content-i18n"
import type { LandingStatsContentRow } from "./landing-stats-content-i18n"

export async function getLandingStatsContent(
  companyId: string
): Promise<LandingStatsContentRow | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("landing_stats_content")
    .select("*")
    .eq("company_id", companyId)
    .maybeSingle()

  if (error || !data) return null
  return data as LandingStatsContentRow
}

export async function upsertLandingStatsContent(
  companyId: string,
  input: UpsertLandingStatsContentInput
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.from("landing_stats_content").upsert(
    {
      company_id: companyId,
      ...input,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "company_id" }
  )
  if (error) return { error: error.message }
  return {}
}
