import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getLocale, getTranslations } from "next-intl/server"
import { getTestimonial } from "@/lib/supabase/testimonials"

const DEFAULT_AVATAR = "https://tailus.io/images/reviews/shekinah.webp"

function resolveAvatarUrl(avatarUrl: string | null): string {
  if (!avatarUrl) return DEFAULT_AVATAR
  if (avatarUrl.startsWith("http")) return avatarUrl
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  return base ? `${base}/storage/v1/object/public/${avatarUrl}` : DEFAULT_AVATAR
}

export default async function TestimonialsSection() {
  const locale = await getLocale()
  const t = await getTranslations("testimonials")
  const testimonial = await getTestimonial(locale)

  const quote = testimonial?.quote ?? t("quote")
  const author = testimonial?.author ?? t("author")
  const role = testimonial?.role ?? t("role")
  const avatarUrl = resolveAvatarUrl(testimonial?.avatar_url ?? null)
  const avatarFallback = author.slice(0, 2).toUpperCase()

  return (
    <section className="py-16 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <blockquote>
            <p className="text-lg font-medium sm:text-xl md:text-3xl">{quote}</p>

            <div className="mt-12 flex items-center justify-center gap-6">
              <Avatar className="size-12">
                <AvatarImage
                  src={avatarUrl}
                  alt={author}
                  height="400"
                  width="400"
                  loading="lazy"
                />
                <AvatarFallback>{avatarFallback}</AvatarFallback>
              </Avatar>

              <div className="space-y-1 border-l pl-6">
                <cite className="font-medium">{author}</cite>
                <span className="text-muted-foreground block text-sm">{role}</span>
              </div>
            </div>
          </blockquote>
        </div>
      </div>
    </section>
  )
}
