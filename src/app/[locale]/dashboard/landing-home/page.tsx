/*
 * Copyright (C) 2026 Ivan Bondaruk (https://bondarukid.com)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 */

import { getTranslations } from "next-intl/server"
import { getLandingCompany } from "@/lib/supabase/companies"
import {
  getLandingFeatureSection,
  getLandingFeatureCards,
  getLandingTechStackSection,
  getLandingTechStackItems,
  getLandingTechStackCategories,
} from "@/lib/supabase/landing-home"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { LandingHomeEditor } from "./landing-home-editor-lazy"

export default async function DashboardLandingHomePage() {
  const t = await getTranslations("dashboard.landingHomePage")
  const landing = await getLandingCompany()
  if (!landing) {
    return (
      <div className="p-4">
        <Alert>
          <AlertTitle>{t("errorTitle")}</AlertTitle>
          <AlertDescription>{t("noLanding")}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const [fSection, fCards, tSection, tItems, tCategories] = await Promise.all([
    getLandingFeatureSection(landing.id),
    getLandingFeatureCards(landing.id),
    getLandingTechStackSection(landing.id),
    getLandingTechStackItems(landing.id),
    getLandingTechStackCategories(landing.id),
  ])

  if (!fSection || !tSection) {
    return (
      <div className="p-4 max-w-2xl space-y-2">
        <h1 className="text-2xl font-medium">{t("title")}</h1>
        <p className="text-muted-foreground text-sm">{t("description")}</p>
        <Alert variant="destructive">
          <AlertTitle>{t("missingDataTitle")}</AlertTitle>
          <AlertDescription>{t("missingData")}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-4xl space-y-4">
      <h1 className="text-2xl font-medium">{t("title")}</h1>
      <p className="text-muted-foreground text-sm max-w-2xl">{t("description")}</p>
      <LandingHomeEditor
        featureSection={fSection}
        featureCards={fCards}
        techSection={tSection}
        techItems={tItems}
        techCategories={tCategories}
      />
    </div>
  )
}
