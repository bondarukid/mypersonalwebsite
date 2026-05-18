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

import type { Testimonial } from "@/content/types"
import { CONTENT_TS } from "@/content/constants"

const testimonials: Testimonial[] = [
  {
    id: "quote-honda-en",
    locale: "en",
    quote:
      'Success represents the 1% of your work which results from the 99% that is called failure.',
    author: "Soichiro Honda",
    role: "Founder, Honda Motor Company",
    avatar_url: null,
    avatar_initials: "SH",
    sort_order: 0,
    created_at: CONTENT_TS,
  },
  {
    id: "quote-honda-uk",
    locale: "uk",
    quote:
      "Успіх — це лише 1% вашої роботи, що народжується з 99% того, що називають невдачами.",
    author: "Соітіро Хонда",
    role: "Засновник Honda Motor Company",
    avatar_url: null,
    avatar_initials: "SH",
    sort_order: 0,
    created_at: CONTENT_TS,
  },
  {
    id: "quote-honda-ja",
    locale: "ja",
    quote: "「成功は99％の失敗に支えられた、1％の成果である。」",
    author: "本田宗一郎",
    role:
      "Seikō wa 99-pāsento no shippai ni sasaerareta, 1-pāsento no seika dearu.",
    avatar_url: null,
    avatar_initials: "SH",
    sort_order: 0,
    created_at: CONTENT_TS,
  },
]

export function getTestimonial(locale: string): Testimonial | null {
  const row = testimonials
    .filter((t) => t.locale === locale)
    .sort((a, b) => a.sort_order - b.sort_order)[0]
  return row ?? null
}
