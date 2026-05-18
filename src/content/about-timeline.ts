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

import type { AboutTimelineMilestoneWithDepth } from "@/lib/about-timeline-types"
import { CONTENT_TS } from "@/content/constants"

const milestones: AboutTimelineMilestoneWithDepth[] = [
  {
    id: "ms-milestone-1",
    sort_order: 0,
    happened_on: "2020-01-15",
    ended_on: null,
    icon: "rocket",
    title_en: "Started shipping software",
    title_uk: "Почав поставляти софт",
    title_ja: "ソフトウェアを届け始めた",
    description_en:
      "Began collaborating on mobile and web products for real users. Extend this list in src/content/about-timeline.ts.",
    description_uk:
      "Розпочав роботу над мобільними та веб-продуктами для реальних користувачів. Розширюйте список у src/content/about-timeline.ts.",
    description_ja:
      "実ユーザー向けのモバイルと Web プロダクトの開発に関わり始めました。src/content/about-timeline.ts で追記できます。",
    created_at: CONTENT_TS,
    updated_at: CONTENT_TS,
    depth_events: [],
    skills: [],
    tags: [],
    attachments: [],
  },
]

export function getTimelineMilestonesWithDepth(): AboutTimelineMilestoneWithDepth[] {
  return [...milestones].sort((a, b) => a.sort_order - b.sort_order)
}
