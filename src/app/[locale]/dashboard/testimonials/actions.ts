"use server"

import { revalidatePath } from "next/cache"
import { getTranslations } from "next-intl/server"
import { updateTestimonial } from "@/lib/supabase/testimonials"
import { routing } from "@/i18n/routing"

const TESTIMONIAL_FIELDS = ["quote", "author", "role"] as const
type TestimonialField = (typeof TESTIMONIAL_FIELDS)[number]

function isTestimonialField(v: string): v is TestimonialField {
  return TESTIMONIAL_FIELDS.includes(v as TestimonialField)
}

export async function updateTestimonialFieldAction(
  testimonialId: string,
  field: string,
  value: string
): Promise<{ error?: string; success?: string }> {
  const t = await getTranslations("dashboard.testimonialsPage")

  if (!isTestimonialField(field)) {
    return { error: "Invalid field" }
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return { error: t("fieldsRequired") }
  }

  const { error } = await updateTestimonial(testimonialId, { [field]: trimmed })
  if (error) {
    return { error }
  }

  revalidatePath("/")
  for (const locale of routing.locales) {
    if (locale !== routing.defaultLocale) {
      revalidatePath(`/${locale}`)
    }
  }

  return { success: t("saved") }
}
