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

import type { LandingStatsContentRow } from "@/lib/landing-stats-content-i18n"
import { CONTENT_TS } from "@/content/constants"

const landingStatsContent: LandingStatsContentRow = {
  heading_en: "By the numbers",
  heading_uk: "У цифрах",
  heading_ja: "数字で見る",
  description_en: "Snapshot metrics you can update anytime in src/content/stats.ts.",
  description_uk: "Оновіть цифри у src/content/stats.ts у будь-який час.",
  description_ja: "数値は src/content/stats.ts でいつでも編集できます。",
  label_stars_en: "Stars on GitHub",
  label_stars_uk: "Зірки на GitHub",
  label_stars_ja: "GitHub スター",
  label_active_en: "Active users (30d)",
  label_active_uk: "Активні користувачі (30 дн.)",
  label_active_ja: "アクティブユーザー（30日）",
  label_powered_en: "Products tracked",
  label_powered_uk: "Продуктів у обліку",
  label_powered_ja: "追跡中のプロダクト",
  use_manual_totals: true,
  manual_stars: 1200,
  manual_active_users: 22000000,
  manual_powered_apps: 3,
  created_at: CONTENT_TS,
  updated_at: CONTENT_TS,
}

export function getLandingStatsContent(): LandingStatsContentRow | null {
  return landingStatsContent
}
