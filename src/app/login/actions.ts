"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function checkWhitelistAndRedirect(redirectTo?: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email) {
    return { ok: false, error: "Not authenticated." }
  }

  const allowedEmails = (process.env.ALLOWED_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)

  if (allowedEmails.length === 0) {
    return { ok: false, error: "Whitelist not configured." }
  }

  const emailLower = user.email.toLowerCase()
  if (!allowedEmails.includes(emailLower)) {
    await supabase.auth.signOut()
    return {
      ok: false,
      error: "Access denied. Your email is not in the whitelist.",
    }
  }

  redirect(redirectTo ?? "/dashboard")
}
