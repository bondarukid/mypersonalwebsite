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

import type { FaqItem, FaqSet } from "@/lib/faq-i18n"
import { CONTENT_TS } from "@/content/constants"

const landingFaqSet: FaqSet = {
  id: "faq-set-landing",
  slug: "landing",
  project_id: null,
  title_en: "Frequently Asked Questions",
  title_uk: "Часті запитання",
  title_ja: "よくある質問",
  support_blurb_en: "Can't find what you're looking for? Contact our",
  support_blurb_uk: "Не знайшли відповідь? Напишіть у",
  support_blurb_ja: "他にご質問があれば、",
  support_link: "/contact",
  support_link_text_en: "contact page",
  support_link_text_uk: "контакти",
  support_link_text_ja: "お問い合わせ",
  created_at: CONTENT_TS,
  updated_at: CONTENT_TS,
}

const landingFaqItems: FaqItem[] = [
  {
    id: "faq-item-1",
    faq_set_id: landingFaqSet.id,
    sort_order: 0,
    question_en: "What stack do you use?",
    question_uk: "Який стек ви використовуєте?",
    question_ja: "どんな技術スタックを使っていますか？",
    answer_en:
      "I build with React, Next.js, TypeScript, Tailwind CSS, and shadcn/ui on the web.",
    answer_uk:
      "Для вебу використовую React, Next.js, TypeScript, Tailwind CSS та shadcn/ui.",
    answer_ja:
      "Web では React、Next.js、TypeScript、Tailwind CSS、shadcn/ui をよく使います。",
    icon: "help-circle",
    created_at: CONTENT_TS,
  },
  {
    id: "faq-item-2",
    faq_set_id: landingFaqSet.id,
    sort_order: 1,
    question_en: "Are you open to work?",
    question_uk: "Ви відкриті до пропозицій?",
    question_ja: "お仕事の依頼は受け付けていますか？",
    answer_en: "Yes—reach out via the contact page with details about your project.",
    answer_uk: "Так — напишіть на сторінці контактів з деталями проєкту.",
    answer_ja: "はい。プロジェクトの内容をお問い合わせページからご連絡ください。",
    icon: "briefcase",
    created_at: CONTENT_TS,
  },
]

const projectFaqSet: FaqSet = {
  id: "faq-set-portfolio",
  slug: "project-portfolio-website",
  project_id: "11111111-1111-1111-1111-111111111111",
  title_en: "About this project",
  title_uk: "Про цей проєкт",
  title_ja: "このプロジェクトについて",
  support_blurb_en: "Questions? Visit",
  support_blurb_uk: "Питання? Перейдіть на",
  support_blurb_ja: "ご質問は",
  support_link: "/contact",
  support_link_text_en: "contact",
  support_link_text_uk: "контакти",
  support_link_text_ja: "お問い合わせ",
  created_at: CONTENT_TS,
  updated_at: CONTENT_TS,
}

const projectFaqItems: FaqItem[] = [
  {
    id: "faq-p-1",
    faq_set_id: projectFaqSet.id,
    sort_order: 0,
    question_en: "Is this site open source?",
    question_uk: "Цей сайт у відкритому доступі?",
    question_ja: "このサイトはオープンソースですか？",
    answer_en: "Source availability is described in the repository README if published.",
    answer_uk: "Наявність коду залежить від того, чи опубліковано репозиторій.",
    answer_ja: "リポジトリを公開している場合は README をご覧ください。",
    icon: "github",
    created_at: CONTENT_TS,
  },
]

const setsWithItems: { set: FaqSet; items: FaqItem[] }[] = [
  { set: landingFaqSet, items: landingFaqItems },
  { set: projectFaqSet, items: projectFaqItems },
]

const itemsBySetId = new Map<string, FaqItem[]>()
const setById = new Map<string, FaqSet>()
for (const { set, items } of setsWithItems) {
  setById.set(set.id, set)
  itemsBySetId.set(
    set.id,
    [...items].sort((a, b) => a.sort_order - b.sort_order)
  )
}

export function getLandingFaqSet(): FaqSet | null {
  return landingFaqSet
}

export function getFaqSetById(id: string): FaqSet | null {
  return setById.get(id) ?? null
}

export function getFaqItems(faqSetId: string): FaqItem[] {
  return itemsBySetId.get(faqSetId) ?? []
}

export function getFaqSetByProjectId(projectId: string): FaqSet | null {
  const found = setsWithItems.find((x) => x.set.project_id === projectId)
  return found?.set ?? null
}
