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

import type { LandingStatsContentRow } from '@/lib/landing-stats-content-i18n'

/** Fallback values when CMS row is missing */
const FALLBACK = {
  stars: 1200,
  activeUsers: 22_000_000,
  poweredApps: 500,
} as const

export type Stats = {
  stars: number
  activeUsers: number
  poweredApps: number
}

export { formatActiveUsers } from '@/lib/stats-display'

export async function getStatsForLandingDisplay(
  content: LandingStatsContentRow | null
): Promise<Stats> {
  if (content?.use_manual_totals) {
    return {
      stars: content.manual_stars,
      activeUsers: content.manual_active_users,
      poweredApps: content.manual_powered_apps,
    }
  }
  return {
    stars: FALLBACK.stars,
    activeUsers: FALLBACK.activeUsers,
    poweredApps: FALLBACK.poweredApps,
  }
}
