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

import { getLocale } from "next-intl/server"
import { Link } from "@/i18n/routing"
import { FaqAccordion } from "@/components/faq-accordion"
import {
  getLandingFaqSet,
  getFaqSetById,
  getFaqItems,
  getFaqSetTitle,
  getFaqSetSupportBlurb,
  getFaqSetSupportLinkText,
  getFaqItemQuestion,
  getFaqItemAnswer,
} from "@/lib/supabase/faq"

interface FAQSectionProps {
  /** When null/undefined, uses landing FAQ. When set, uses that faq_set ID. */
  faqSetId?: string | null
}

export async function FAQSection({ faqSetId }: FAQSectionProps) {
  const locale = await getLocale()
  const faqSet = faqSetId
    ? await getFaqSetById(faqSetId)
    : await getLandingFaqSet()

  if (!faqSet) return null

  const items = await getFaqItems(faqSet.id)
  const accordionItems = items.map((item) => ({
    id: item.id,
    question: getFaqItemQuestion(item, locale),
    answer: getFaqItemAnswer(item, locale),
    icon: item.icon,
  }))

  const title = getFaqSetTitle(faqSet, locale)
  const supportBlurb = getFaqSetSupportBlurb(faqSet, locale)
  const supportLinkText = getFaqSetSupportLinkText(faqSet, locale)
  const supportLink = faqSet.support_link || "#"

  return (
    <section className="bg-muted dark:bg-background py-20">
      <div className="mx-auto max-w-5xl px-4 md:px-6">
        <div className="flex flex-col gap-10 md:flex-row md:gap-16">
          <div className="md:w-1/3">
            <div className="sticky top-20">
              <h2 className="mt-4 text-3xl font-bold">{title}</h2>
              {supportBlurb && (
                <p className="text-muted-foreground mt-4">
                  {supportBlurb}{" "}
                  <Link
                    href={supportLink}
                    className="text-primary font-medium hover:underline"
                  >
                    {supportLinkText}
                  </Link>
                </p>
              )}
            </div>
          </div>
          <div className="md:w-2/3">
            <FaqAccordion items={accordionItems} />
          </div>
        </div>
      </div>
    </section>
  )
}
