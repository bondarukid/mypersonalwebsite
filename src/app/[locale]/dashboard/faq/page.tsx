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
import { getLandingFaqSet, getFaqItems } from "@/lib/supabase/faq"
import { createClient } from "@/lib/supabase/server"
import { ensureUserInLanding } from "@/lib/supabase/companies"
import { ensureLandingFaqSetAction } from "./actions"
import { FaqEditor } from "./faq-editor"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default async function DashboardFaqPage() {
  const t = await getTranslations("dashboard.faqPage")
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let bootstrapError: string | undefined
  if (user) {
    const r = await ensureUserInLanding(user.id)
    bootstrapError = r.error
  }

  let faqSet = await getLandingFaqSet()
  let ensureError: string | undefined
  if (!faqSet && user) {
    const ensureResult = await ensureLandingFaqSetAction()
    ensureError = ensureResult.error
    faqSet = await getLandingFaqSet()
  }

  const diagnostic = bootstrapError ?? ensureError
  const items = faqSet ? await getFaqItems(faqSet.id) : []

  return (
    <div className="flex flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("title")}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {t("description")}
        </p>
      </header>
      {faqSet ? (
        <FaqEditor faqSet={faqSet} items={items} />
      ) : (
        <div className="flex flex-col gap-3">
          {diagnostic ? (
            <Alert variant="destructive">
              <AlertTitle>Could not load landing FAQ</AlertTitle>
              <AlertDescription className="whitespace-pre-wrap font-mono text-xs">
                {diagnostic}
              </AlertDescription>
            </Alert>
          ) : null}
          <p className="text-sm text-muted-foreground">{t("noFaqSet")}</p>
        </div>
      )}
    </div>
  )
}
