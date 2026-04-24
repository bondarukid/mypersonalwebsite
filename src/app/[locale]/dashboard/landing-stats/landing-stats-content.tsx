"use client"

import { useActionState } from "react"
import { useLocale, useTranslations } from "next-intl"
import {
  syncStatsAction,
  addAppAction,
  updateAppAction,
  saveCredentialsAction,
} from "./actions"
import { formatActiveUsers } from "@/lib/stats-display"
import type { App } from "@/lib/supabase/apps"
import type { LandingStatsSnapshot } from "@/lib/supabase/landing-stats-snapshot"
import type { LandingStatsContentRow } from "@/lib/supabase/landing-stats-content-i18n"
import { getLocalizedLandingStatsContent } from "@/lib/supabase/landing-stats-content-i18n"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { LandingStatsSectionEditor } from "./landing-stats-section-editor"
import type { Stats } from "@/lib/stats"

export function LandingStatsContent({
  companyId,
  apps,
  snapshot,
  hasCredentials,
  statsContent,
  displayStatsForSection,
}: {
  companyId: string
  apps: App[]
  snapshot: LandingStatsSnapshot | null
  hasCredentials: boolean
  statsContent: LandingStatsContentRow | null
  displayStatsForSection: Stats
}) {
  const t = useTranslations("dashboard.landingStatsPage")
  const tStats = useTranslations("stats")
  const loc = useLocale()
  const labels = statsContent
    ? getLocalizedLandingStatsContent(statsContent, loc)
    : null
  const stars = displayStatsForSection.stars
  const activeUsers = displayStatsForSection.activeUsers
  const poweredApps = displayStatsForSection.poweredApps
  const [syncState, syncFormAction, syncPending] = useActionState(
    syncStatsAction,
    null
  )
  const [addState, addFormAction, addPending] = useActionState(addAppAction, null)
  const [updateState, updateFormAction, updatePending] = useActionState(
    updateAppAction,
    null
  )
  const [credState, credFormAction, credPending] = useActionState(
    saveCredentialsAction,
    null
  )

  return (
    <div className="space-y-8">
      {statsContent ? (
        <LandingStatsSectionEditor initial={statsContent} />
      ) : (
        <Alert>
          <AlertTitle>{t("title")}</AlertTitle>
          <AlertDescription>{t("missingStatsContent")}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium">{t("apiCredentials")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("apiCredentialsDescription")}
          </p>
        </CardHeader>
        <CardContent>
          <form action={credFormAction} className="flex flex-col gap-4 max-w-md">
            <input type="hidden" name="companyId" value={companyId} />
            <input type="hidden" name="hasCredentials" value={hasCredentials ? "1" : "0"} />
            <div className="space-y-2">
              <Label htmlFor="gaClientEmail">{t("gaClientEmail")}</Label>
              <Input
                id="gaClientEmail"
                name="gaClientEmail"
                type="text"
                placeholder={hasCredentials ? "••••••••" : "your-sa@project.iam.gserviceaccount.com"}
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gaPrivateKey">{t("gaPrivateKey")}</Label>
              <Input
                id="gaPrivateKey"
                name="gaPrivateKey"
                type="password"
                placeholder={hasCredentials ? "••••••••" : "Paste private key"}
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="githubToken">{t("githubToken")}</Label>
              <Input
                id="githubToken"
                name="githubToken"
                type="password"
                placeholder={hasCredentials ? "••••••••" : "ghp_xxx"}
                autoComplete="off"
              />
            </div>
            <Button type="submit" disabled={credPending}>
              {credPending ? t("saving") : t("saveCredentials")}
            </Button>
            {(credState?.success || credState?.error) && (
              <p
                className={`text-sm ${
                  credState?.error ? "text-destructive" : "text-green-600"
                }`}
              >
                {credState?.success ?? credState?.error}
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium">{t("preview")}</h2>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">
                {labels?.labelStars ?? tStats("starsOnGithub")}
              </p>
              <p className="text-2xl font-bold">+{stars.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {labels?.labelActive ?? tStats("activeUsers")}
              </p>
              <p className="text-2xl font-bold">
                {formatActiveUsers(activeUsers)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {labels?.labelPowered ?? tStats("poweredApps")}
              </p>
              <p className="text-2xl font-bold">
                +{poweredApps.toLocaleString()}
              </p>
            </div>
          </div>
          <form action={syncFormAction} className="mt-4">
            <input type="hidden" name="companyId" value={companyId} />
            <Button type="submit" disabled={syncPending} variant="outline">
              {syncPending ? t("syncing") : t("syncNow")}
            </Button>
          </form>
          {(syncState?.success || syncState?.error) && (
            <p
              className={`mt-2 text-sm ${
                syncState?.error ? "text-destructive" : "text-green-600"
              }`}
            >
              {syncState?.success ?? syncState?.error}
            </p>
          )}
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-medium mb-4">{t("addApp")}</h2>
        <form action={addFormAction} className="flex flex-col gap-4 max-w-md">
          <input type="hidden" name="companyId" value={companyId} />
          <div className="space-y-2">
            <Label htmlFor="appName">{t("appName")}</Label>
            <Input
              id="appName"
              name="appName"
              required
              placeholder="My App"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gaPropertyId">{t("gaPropertyId")}</Label>
            <Input
              id="gaPropertyId"
              name="gaPropertyId"
              placeholder="123456789"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="githubUsername">{t("githubUsername")}</Label>
            <Input
              id="githubUsername"
              name="githubUsername"
              placeholder="username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="githubRepo">{t("githubRepo")}</Label>
            <Input
              id="githubRepo"
              name="githubRepo"
              placeholder="username/repo"
            />
          </div>
          <Button type="submit" disabled={addPending}>
            {addPending ? t("saving") : t("addApp")}
          </Button>
          {addState?.error && (
            <p className="text-sm text-destructive">{addState.error}</p>
          )}
          {addState?.success && (
            <p className="text-sm text-green-600">{addState.success}</p>
          )}
        </form>
      </div>

      <div>
        <h2 className="text-lg font-medium mb-4">Apps</h2>
        {apps.length === 0 ? (
          <p className="text-muted-foreground">{t("noApps")}</p>
        ) : (
          <div className="space-y-4">
            {apps.map((app) => (
              <form
                key={app.id}
                action={updateFormAction}
                className="flex flex-wrap items-end gap-4 rounded-lg border p-4"
              >
                <input type="hidden" name="appId" value={app.id} />
                <div className="flex-1 min-w-[120px] space-y-2">
                  <Label>Name</Label>
                  <Input
                    name="appName"
                    defaultValue={app.name}
                    required
                  />
                </div>
                <div className="flex-1 min-w-[120px] space-y-2">
                  <Label>GA4 Property ID</Label>
                  <Input
                    name="gaPropertyId"
                    defaultValue={app.ga_property_id ?? ""}
                  />
                </div>
                <div className="flex-1 min-w-[120px] space-y-2">
                  <Label>GitHub</Label>
                  <Input
                    name="githubUsername"
                    defaultValue={app.github_username ?? ""}
                    placeholder="username"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`enabled-${app.id}`}
                    name="enabledForLanding"
                    defaultChecked={app.enabled_for_landing}
                    value="on"
                    className="size-4"
                  />
                  <Label htmlFor={`enabled-${app.id}`}>
                    {t("enabledForLanding")}
                  </Label>
                </div>
                <Button type="submit" size="sm" disabled={updatePending}>
                  Save
                </Button>
              </form>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
