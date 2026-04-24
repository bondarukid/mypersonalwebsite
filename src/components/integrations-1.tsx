"use client"

/*
 * Copyright (C) 2026 Ivan Bondaruk (https://bondarukid.com)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 */

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getTechStackIcon, TECH_STACK_ICON_MAP } from "@/config/tech-stack-icons"
import { ChevronRight } from "lucide-react"
import { Link } from "@/i18n/routing"
import { useLocale, useTranslations } from "next-intl"
import { useMemo } from "react"
import type { LegacyTechStackTabId } from "@/lib/supabase/landing-home-i18n"
import {
  groupTechStackItemsByCategory,
  getLocalizedCategoryLabel,
  getLocalizedTechItem,
  getLocalizedTechStackSection,
  type LandingTechStackCategoryRow,
  type LandingTechStackItemRow,
  type LandingTechStackSectionRow,
} from "@/lib/supabase/landing-home-i18n"
import { SiNextdotjs } from "@icons-pack/react-simple-icons"

const TAB_IDS = ["mobile", "web", "ides", "robotics"] as const

/** Fallback items when the database is empty (i18n keys for title/desc). */
const LEGACY_TAB_I18N_KEYS: Record<
  (typeof TAB_IDS)[number],
  { titleKey: string; descKey: string; iconSlug: keyof typeof TECH_STACK_ICON_MAP }[]
> = {
  mobile: [
    { iconSlug: "kotlin", titleKey: "kotlin", descKey: "kotlinDesc" },
    { iconSlug: "swift", titleKey: "swift", descKey: "swiftDesc" },
    { iconSlug: "swiftui", titleKey: "swiftui", descKey: "swiftuiDesc" },
    { iconSlug: "xcode", titleKey: "xcode", descKey: "xcodeDesc" },
    { iconSlug: "androidstudio", titleKey: "androidStudio", descKey: "androidStudioDesc" },
  ],
  web: [
    { iconSlug: "nextdotjs", titleKey: "nextjs", descKey: "nextjsDesc" },
    { iconSlug: "react", titleKey: "react", descKey: "reactDesc" },
    { iconSlug: "shadcnui", titleKey: "shadcnui", descKey: "shadcnuiDesc" },
    { iconSlug: "tailwindcss", titleKey: "tailwindcss", descKey: "tailwindcssDesc" },
  ],
  ides: [
    { iconSlug: "vscodium", titleKey: "vsCode", descKey: "vsCodeDesc" },
    { iconSlug: "webstorm", titleKey: "webstorm", descKey: "webstormDesc" },
  ],
  robotics: [
    { iconSlug: "arduino", titleKey: "arduino", descKey: "arduinoDesc" },
  ],
}

const I18N_TAB_LABEL_KEYS: Record<(typeof TAB_IDS)[number], string> = {
  mobile: "tabMobile",
  web: "tabWeb",
  ides: "tabIDEs",
  robotics: "tabRobotics",
}

export type IntegrationsFromDb = {
  section: LandingTechStackSectionRow
  items: LandingTechStackItemRow[]
  categories: LandingTechStackCategoryRow[]
} | null

type IntegrationsSectionProps = {
  fromDb: IntegrationsFromDb
}

export default function IntegrationsSection({ fromDb }: IntegrationsSectionProps) {
  const t = useTranslations("integrations")
  const locale = useLocale()

  const l = fromDb
    ? getLocalizedTechStackSection(fromDb.section, locale)
    : null

  const byCategory = useMemo(
    () => (fromDb ? groupTechStackItemsByCategory(fromDb.items) : null),
    [fromDb]
  )

  const heading = l?.heading ?? t("heading")
  const subcopy = l?.subcopy ?? t("subcopy")
  const learnMore = l?.learnMore ?? t("learnMore")

  const hasDynamic = Boolean(
    fromDb && fromDb.categories && fromDb.categories.length > 0
  )

  return (
    <section>
      <div className="py-32">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <h2 className="text-balance text-3xl font-semibold md:text-4xl">
              {heading}
            </h2>
            <p className="text-muted-foreground mt-6">{subcopy}</p>
          </div>

          {hasDynamic && fromDb && byCategory ? (
            <Tabs
              key={fromDb.categories.map((c) => c.id).join("-")}
              defaultValue={fromDb.categories[0].id}
              className="mt-12"
            >
              <TabsList className="mb-8 flex h-auto min-h-10 w-full flex-wrap justify-center gap-1 p-1">
                {fromDb.categories.map((cat) => (
                  <TabsTrigger key={cat.id} value={cat.id} className="shrink-0">
                    {getLocalizedCategoryLabel(cat, locale) || "—"}
                  </TabsTrigger>
                ))}
              </TabsList>
              {fromDb.categories.map((cat) => (
                <TabsContent key={cat.id} value={cat.id}>
                  <IntegrationsGridFromDb
                    learnMore={learnMore}
                    items={byCategory.get(cat.id) ?? []}
                    locale={locale}
                  />
                </TabsContent>
              ))}
            </Tabs>
          ) : fromDb && !hasDynamic ? (
            <p className="text-muted-foreground mt-12 text-center text-sm">
              {t("noTechCategories")}
            </p>
          ) : (
            <Tabs defaultValue={TAB_IDS[0]} className="mt-12">
              <TabsList className="mb-8 grid w-full grid-cols-2 sm:grid-cols-4">
                {TAB_IDS.map((id) => (
                  <TabsTrigger key={id} value={id}>
                    {t(I18N_TAB_LABEL_KEYS[id] as "tabMobile")}
                  </TabsTrigger>
                ))}
              </TabsList>

              {TAB_IDS.map((tabId) => (
                <TabsContent key={tabId} value={tabId}>
                  <IntegrationsGridI18nLegacy
                    tabId={tabId}
                    learnMore={learnMore}
                  />
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>
      </div>
    </section>
  )
}

function IntegrationsGridFromDb({
  items,
  locale,
  learnMore,
}: {
  items: LandingTechStackItemRow[]
  locale: string
  learnMore: string
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((row) => {
        const { title, description, simple_icon_slug } = getLocalizedTechItem(
          row,
          locale
        )
        const Icon = getTechStackIcon(simple_icon_slug) ?? SiNextdotjs
        return (
          <IntegrationCard
            key={row.id}
            title={title}
            description={description}
            learnMore={learnMore}
          >
            <Icon
              size={40}
              color="currentColor"
              className="text-foreground"
            />
          </IntegrationCard>
        )
      })}
    </div>
  )
}

function IntegrationsGridI18nLegacy({
  tabId,
  learnMore,
}: {
  tabId: LegacyTechStackTabId
  learnMore: string
}) {
  const t = useTranslations("integrations")
  const rows = LEGACY_TAB_I18N_KEYS[tabId]
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map(({ iconSlug, titleKey, descKey }) => {
        const Icon = TECH_STACK_ICON_MAP[iconSlug] ?? SiNextdotjs
        return (
          <IntegrationCard
            key={`${tabId}-${titleKey}`}
            title={t(titleKey as "kotlin")}
            description={t(descKey as "kotlinDesc")}
            learnMore={learnMore}
          >
            <Icon size={40} color="currentColor" className="text-foreground" />
          </IntegrationCard>
        )
      })}
    </div>
  )
}

function IntegrationCard({
  title,
  description,
  learnMore,
  children,
  link = "#",
}: {
  title: string
  description: string
  learnMore: string
  children: React.ReactNode
  link?: string
}) {
  return (
    <Card className="p-6">
      <div className="relative">
        <div className="*:size-10">{children}</div>
        <div className="space-y-2 py-6">
          <h3 className="text-base font-medium">{title}</h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {description}
          </p>
        </div>
        <div className="flex gap-3 border-t border-dashed pt-6">
          <Button
            variant="secondary"
            size="sm"
            className="gap-1 pr-2 shadow-none"
            render={<Link href={link} />}
            nativeButton={false}
          >
            {learnMore}
            <ChevronRight className="ml-0 !size-3.5 opacity-50" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
