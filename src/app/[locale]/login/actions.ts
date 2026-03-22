"use server"

import { headers } from "next/headers"
import { redirect } from "@/i18n/routing"
import { createClient } from "@/lib/supabase/server"
import { getTranslations } from "next-intl/server"
import { routing } from "@/i18n/routing"

export async function signInAction(
  _prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | null> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email?.trim() || !password) {
    const t = await getTranslations("login")
    return { error: t("accessDenied") }
  }

  const supabase = await createClient()
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  })

  if (signInError) {
    return { error: signInError.message }
  }

  const redirectTo = (formData.get("redirectTo") as string) || undefined
  const result = await checkWhitelistAndRedirect(redirectTo)

  if (result && !result.ok) {
    await supabase.auth.signOut()
    return { error: result.error ?? "Access denied." }
  }

  return null
}

export async function checkWhitelistAndRedirect(redirectTo?: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const t = await getTranslations("login")

  if (!user?.email) {
    return { ok: false, error: t("notAuthenticated") }
  }

  const allowedEmails = (process.env.ALLOWED_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)

  if (allowedEmails.length === 0) {
    return { ok: false, error: t("whitelistNotConfigured") }
  }

  const emailLower = user.email.toLowerCase()
  if (!allowedEmails.includes(emailLower)) {
    await supabase.auth.signOut()
    return {
      ok: false,
      error: t("emailNotWhitelisted"),
    }
  }

  const headersList = await headers()
  const locale =
    headersList.get("x-next-intl-locale") ?? routing.defaultLocale

  redirect({ href: redirectTo ?? "/dashboard", locale })
}
