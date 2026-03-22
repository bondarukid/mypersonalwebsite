"use client"

import { useActionState } from "react"
import { useTranslations } from "next-intl"
import {
  syncStatsAction,
  addAppAction,
  updateAppAction,
} from "./actions"
import type { App } from "@/lib/supabase/apps"
import type { LandingStatsSnapshot } from "@/lib/supabase/landing-stats-snapshot"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

function formatActiveUsers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1e6).toFixed(1)} Million`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return new Intl.NumberFormat().format(n)
}

export function LandingStatsContent({
  companyId,
  apps,
  snapshot,
}: {
  companyId: string
  apps: App[]
  snapshot: LandingStatsSnapshot | null
}) {
  const t = useTranslations("dashboard.landingStatsPage")
  const [syncState, syncFormAction, syncPending] = useActionState(
    syncStatsAction,
    null
  )
  const [addState, addFormAction, addPending] = useActionState(addAppAction, null)
  const [updateState, updateFormAction, updatePending] = useActionState(
    updateAppAction,
    null
  )

  const stars = snapshot?.stars ?? 0
  const activeUsers = snapshot?.active_users ?? 0
  const poweredApps = snapshot?.powered_apps ?? 0

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium">{t("preview")}</h2>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Stars on GitHub</p>
              <p className="text-2xl font-bold">+{stars.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Users</p>
              <p className="text-2xl font-bold">
                {formatActiveUsers(activeUsers)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Powered Apps</p>
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
