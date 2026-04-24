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

import { getTranslations } from "next-intl/server"
import {
  Bot,
  BrainCircuit,
  Code2,
  Cpu,
  GraduationCap,
  Smartphone,
  type LucideIcon,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const INTRO_FOCUS_ITEMS: {
  titleKey:
    | "badgeTeaching"
    | "badgeRobotics"
    | "badgeWeb"
    | "badgeIoT"
    | "badgeMobile"
    | "badgeAI"
  descKey:
    | "badgeTeachingDesc"
    | "badgeRoboticsDesc"
    | "badgeWebDesc"
    | "badgeIoTDesc"
    | "badgeMobileDesc"
    | "badgeAIDesc"
  Icon: LucideIcon
}[] = [
  {
    titleKey: "badgeTeaching",
    descKey: "badgeTeachingDesc",
    Icon: GraduationCap,
  },
  {
    titleKey: "badgeRobotics",
    descKey: "badgeRoboticsDesc",
    Icon: Bot,
  },
  { titleKey: "badgeWeb", descKey: "badgeWebDesc", Icon: Code2 },
  { titleKey: "badgeIoT", descKey: "badgeIoTDesc", Icon: Cpu },
  {
    titleKey: "badgeMobile",
    descKey: "badgeMobileDesc",
    Icon: Smartphone,
  },
  {
    titleKey: "badgeAI",
    descKey: "badgeAIDesc",
    Icon: BrainCircuit,
  },
]

export async function AboutPageIntro() {
  const t = await getTranslations("aboutPage.intro")

  return (
    <section className="bg-black py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-3xl font-semibold tracking-tight text-zinc-50 md:text-4xl">
          {t("heading")}
        </h2>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {INTRO_FOCUS_ITEMS.map(({ titleKey, descKey, Icon }) => (
            <Card
              key={titleKey}
              className="border-zinc-800/90 bg-zinc-950/70 p-6 shadow-sm"
            >
              <div className="relative">
                <div className="flex size-10 items-center justify-center [&_svg]:size-10">
                  <Icon
                    className="text-zinc-100"
                    aria-hidden
                    strokeWidth={1.5}
                  />
                </div>
                <div className="space-y-2 py-6">
                  <h3 className="text-base font-medium text-zinc-50">
                    {t(titleKey)}
                  </h3>
                  <p className="line-clamp-3 text-sm text-zinc-400">
                    {t(descKey)}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="mt-10 border-zinc-800/90 bg-zinc-950/70 shadow-sm">
          <CardContent className="space-y-4 pt-6 text-zinc-400">
            <p className="text-base leading-relaxed text-zinc-100">{t("p1")}</p>
            <p className="text-base leading-relaxed text-zinc-300">{t("p2")}</p>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
