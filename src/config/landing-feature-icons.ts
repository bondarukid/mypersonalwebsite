/*
 * Copyright (C) 2026 Ivan Bondaruk (https://bondarukid.com)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 */

import type { LucideIcon } from "lucide-react"
import {
  Bot,
  Brain,
  Code,
  Cpu,
  Fingerprint,
  Globe,
  Lightbulb,
  Pencil,
  Rocket,
  Settings2,
  Sparkles,
  Wrench,
  Zap,
} from "lucide-react"

/**
 * Keystore must match `lucide dynamic` / lucide-react icon names (kebab-case in DB is normalized here).
 */
export const LANDING_FEATURE_LUCIDE_MAP: Record<string, LucideIcon> = {
  zap: Zap,
  cpu: Cpu,
  fingerprint: Fingerprint,
  pencil: Pencil,
  "settings-2": Settings2,
  sparkles: Sparkles,
  bot: Bot,
  code: Code,
  globe: Globe,
  lightbulb: Lightbulb,
  rocket: Rocket,
  wrench: Wrench,
  brain: Brain,
}

export const LANDING_FEATURE_LUCIDE_KEYS = Object.keys(
  LANDING_FEATURE_LUCIDE_MAP
) as (keyof typeof LANDING_FEATURE_LUCIDE_MAP)[]

export function normalizeFeatureLucideKey(raw: string): string {
  return raw.trim().toLowerCase()
}

export function isLandingFeatureLucideKey(
  s: string
): s is keyof typeof LANDING_FEATURE_LUCIDE_MAP {
  const k = normalizeFeatureLucideKey(s) as keyof typeof LANDING_FEATURE_LUCIDE_MAP
  return k in LANDING_FEATURE_LUCIDE_MAP
}

export function getLandingFeatureIcon(lucideKey: string): LucideIcon | null {
  const k = normalizeFeatureLucideKey(lucideKey)
  if (k in LANDING_FEATURE_LUCIDE_MAP) {
    return LANDING_FEATURE_LUCIDE_MAP[k as keyof typeof LANDING_FEATURE_LUCIDE_MAP]
  }
  return null
}
