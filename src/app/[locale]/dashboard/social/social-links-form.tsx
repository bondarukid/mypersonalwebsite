"use client"

import { useActionState } from "react"
import { useTranslations } from "next-intl"
import { updateSocialLinkAction } from "./actions"
import type { SocialLink } from "@/lib/supabase/social-links"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const PLATFORM_LABELS: Record<string, string> = {
  twitter: "X / Twitter",
  linkedin: "LinkedIn",
  facebook: "Facebook",
  threads: "Threads",
  instagram: "Instagram",
  tiktok: "TikTok",
}

export function SocialLinksForm({ links }: { links: SocialLink[] }) {
  const t = useTranslations("dashboard.socialPage")
  const [state, formAction, isPending] = useActionState(updateSocialLinkAction, null)

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div
          role="alert"
          className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {state.error}
        </div>
      )}
      {state?.success && (
        <div
          role="status"
          className="rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-600 dark:text-green-400"
        >
          {state.success}
        </div>
      )}
      <div className="space-y-4">
        {links.map((link) => (
          <div
            key={link.id}
            className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:gap-6"
          >
            <div className="flex min-w-[140px] items-center gap-2">
              <input
                type="checkbox"
                id={`enabled-${link.id}`}
                name={`enabled-${link.id}`}
                defaultChecked={link.enabled}
                value="on"
                className="size-4 rounded border-input"
              />
              <Label
                htmlFor={`enabled-${link.id}`}
                className="text-sm font-medium"
              >
                {PLATFORM_LABELS[link.platform] ?? link.platform}
              </Label>
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor={`url-${link.id}`} className="text-sm">
                URL
              </Label>
              <Input
                id={`url-${link.id}`}
                name={`url-${link.id}`}
                type="url"
                defaultValue={link.url === "#" ? "" : link.url}
                placeholder="https://..."
              />
            </div>
            <input type="hidden" name="linkId" value={link.id} />
          </div>
        ))}
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? t("saving") : t("save")}
      </Button>
    </form>
  )
}
