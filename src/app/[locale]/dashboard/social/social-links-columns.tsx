"use client"

import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { SocialPlatformIcon } from "@/components/social-platform-icons"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldContent,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { SocialLink } from "@/lib/supabase/social-links"

const PLATFORM_LABELS: Record<string, string> = {
  twitter: "X / Twitter",
  linkedin: "LinkedIn",
  facebook: "Facebook",
  threads: "Threads",
  instagram: "Instagram",
  tiktok: "TikTok",
}

function SocialLinkEnabledCheckbox({ link }: { link: SocialLink }) {
  const [enabled, setEnabled] = useState(link.enabled)

  return (
    <Field orientation="horizontal" className="w-fit">
      <FieldLabel
        htmlFor={`enabled-${link.id}`}
        className="flex cursor-pointer items-center gap-2 font-normal"
      >
        <Checkbox
          id={`enabled-${link.id}`}
          name={`enabled-${link.id}`}
          checked={enabled}
          onCheckedChange={setEnabled}
          value="on"
          aria-label={`${enabled ? "Enabled" : "Disabled"} - ${link.platform}`}
        />
      </FieldLabel>
    </Field>
  )
}

export const socialLinksColumns: ColumnDef<SocialLink>[] = [
  {
    accessorKey: "platform",
    header: "Platform",
    cell: ({ row }) => {
      const platform = row.original.platform
      return (
        <div className="flex items-center gap-3">
          <SocialPlatformIcon
            platform={platform}
            className="size-5 text-muted-foreground shrink-0"
          />
          <span className="font-medium">
            {PLATFORM_LABELS[platform] ?? platform}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "url",
    header: "URL",
    cell: ({ row }) => {
      const link = row.original
      const displayUrl = (link.url === "#" ? "" : link.url) ?? ""
      return (
        <Field key={link.id} orientation="vertical" className="min-w-[200px]">
          <FieldLabel className="sr-only">URL</FieldLabel>
          <FieldContent>
            <Input
              name={`url-${link.id}`}
              type="url"
              defaultValue={displayUrl}
              placeholder="https://..."
              className="min-w-[200px]"
            />
          </FieldContent>
        </Field>
      )
    },
  },
  {
    accessorKey: "enabled",
    header: "Enabled",
    cell: ({ row }) => (
      <SocialLinkEnabledCheckbox
        key={`${row.original.id}-${row.original.enabled}`}
        link={row.original}
      />
    ),
  },
]
