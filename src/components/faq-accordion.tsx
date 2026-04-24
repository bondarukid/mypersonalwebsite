"use client"

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

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { DynamicIcon, type IconName } from "lucide-react/dynamic"

export type FaqAccordionItem = {
  id: string
  question: string
  answer: string
  icon: string
}

export function FaqAccordion({ items }: { items: FaqAccordionItem[] }) {
  if (items.length === 0) return null

  return (
    <Accordion type="single" collapsible className="w-full space-y-2">
      {items.map((item) => (
        <AccordionItem
          key={item.id}
          value={item.id}
          className="bg-background shadow-xs rounded-lg border px-4 last:border-b"
        >
          <AccordionTrigger className="cursor-pointer items-center py-5 hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="flex size-6">
                <DynamicIcon
                  name={(item.icon || "help-circle") as IconName}
                  className="m-auto size-4"
                />
              </div>
              <span className="text-base">{item.question}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-5">
            <div className="px-9">
              <p className="text-base">{item.answer}</p>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
