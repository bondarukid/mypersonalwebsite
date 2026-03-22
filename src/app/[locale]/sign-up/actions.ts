"use server"

import { redirect } from "@/i18n/routing"
import { createClient } from "@/lib/supabase/server"
import { getTranslations } from "next-intl/server"
import { routing } from "@/i18n/routing"

export async function signUpAction(
  _prevState: { error?: string; success?: string } | null,
  formData: FormData
): Promise<{ error?: string; success?: string } | null> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const firstName = formData.get("firstname") as string
  const lastName = formData.get("lastname") as string

  if (!email?.trim() || !password) {
    const t = await getTranslations("signUp")
    return { error: t("fillRequired") }
  }

  const supabase = await createClient()
  const { error: signUpError } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: {
        first_name: firstName?.trim() || "",
        last_name: lastName?.trim() || "",
      },
    },
  })

  if (signUpError) {
    return { error: signUpError.message }
  }

  const t = await getTranslations("signUp")
  return { success: t("checkEmail") }
}
