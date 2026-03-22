"use server"

import { getTranslations } from "next-intl/server"
import { updateSocialLink } from "@/lib/supabase/social-links"

export async function updateSocialLinkAction(
  _prevState: { error?: string; success?: string } | null,
  formData: FormData
): Promise<{ error?: string; success?: string } | null> {
  const t = await getTranslations("dashboard.socialPage")

  const ids = formData.getAll("linkId") as string[]
  if (ids.length === 0) return null

  for (const id of ids) {
    const enabled = formData.get(`enabled-${id}`) === "on"
    const url = (formData.get(`url-${id}`) as string)?.trim() || "#"
    const { error } = await updateSocialLink(id, { enabled, url })
    if (error) {
      return { error }
    }
  }

  return { success: t("saved") }
}
