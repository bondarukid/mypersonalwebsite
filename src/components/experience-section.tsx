/*
 * Copyright (C) 2026 Ivan Bondaruk (https://bondarukid.com)
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

"use client"

import { useTranslations } from "next-intl"
import { Briefcase, Code2, GraduationCap, Rocket } from "lucide-react"
import { Timeline, TimelineItem } from "@/components/ui/timeline"

const EXPERIENCES = [
  {
    date: "2025-09-01",
    titleKey: "experiences.1.title",
    descKey: "experiences.1.description",
    icon: Briefcase,
    status: "in-progress" as const,
  },
  {
    date: "2023-03-01",
    titleKey: "experiences.2.title",
    descKey: "experiences.2.description",
    icon: Code2,
    status: "completed" as const,
  },
  {
    date: "2021-01-01",
    titleKey: "experiences.3.title",
    descKey: "experiences.3.description",
    icon: GraduationCap,
    status: "completed" as const,
  },
  {
    date: "2019-06-01",
    titleKey: "experiences.4.title",
    descKey: "experiences.4.description",
    icon: Rocket,
    status: "completed" as const,
  },
] as const

export default function ExperienceSection() {
  const t = useTranslations("professional")
  return (
    <section className="space-y-8">
      <h2 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 md:text-3xl">
        {t("experience.heading")}
      </h2>
      <Timeline size="md" iconsize="md">
        {EXPERIENCES.map((exp, i) => (
          <TimelineItem
            key={i}
            date={exp.date}
            title={t(exp.titleKey)}
            description={t(exp.descKey)}
            icon={<exp.icon className="size-5" />}
            status={exp.status}
          />
        ))}
      </Timeline>
    </section>
  )
}
