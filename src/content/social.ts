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

import type { SocialLink } from "@/content/types"
import { CONTENT_TS } from "@/content/constants"

const allLinks: SocialLink[] = [
  {
    id: "soc-gh",
    platform: "github",
    url: "https://github.com/bondarukid",
    enabled: true,
    sort_order: 0,
    created_at: CONTENT_TS,
  },
  {
    id: "soc-li",
    platform: "linkedin",
    url: "https://www.linkedin.com/",
    enabled: true,
    sort_order: 1,
    created_at: CONTENT_TS,
  },
]

export function getSocialLinks(): SocialLink[] {
  return allLinks
    .filter((l) => l.enabled && l.url && l.url !== "#")
    .sort((a, b) => a.sort_order - b.sort_order)
}
