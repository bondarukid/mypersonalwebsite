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
    id: "test-en",
    locale: "en",
    quote:
      "Ivan delivers thoughtful UI, clean architecture, and communicates progress clearly.",
    author: "Product lead",
    role: "Anonymous reference",
    avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop",
    sort_order: 0,
    created_at: CONTENT_TS,
  },
  {
    id: "test-uk",
    locale: "uk",
    quote:
      "Акуратний код, зрозумілі естімації і приємна взаємодія протягом усього спринту.",
    author: "Техлід",
    role: "Анонімний відгук",
    avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop",
    sort_order: 0,
    created_at: CONTENT_TS,
  },
  {
    id: "test-ja",
    locale: "ja",
    quote:
      "進捗の共有が丁寧で、設計と実装のバランスが取れた開発でした。",
    author: "プロダクトマネージャー",
    role: "匿名の声",
    avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop",
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
