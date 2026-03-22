import { getTranslations } from "next-intl/server"
import { getAllTestimonialsForAdmin } from "@/lib/supabase/testimonials"
import { TestimonialsEditor } from "./testimonials-editor"

export default async function TestimonialsPage() {
  const t = await getTranslations("dashboard.testimonialsPage")
  const testimonials = await getAllTestimonialsForAdmin()

  return (
    <div className="flex flex-col gap-6 py-6 px-4 md:py-8 md:px-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("title")}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {t("description")}
        </p>
      </header>
      <TestimonialsEditor testimonials={testimonials} />
    </div>
  )
}
