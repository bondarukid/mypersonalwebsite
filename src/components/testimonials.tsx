import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getLocale, getTranslations } from "next-intl/server"
import { getTestimonial } from "@/content/testimonials"
import { publicImageUrl } from "@/lib/public-asset-url"

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop"

function resolveAvatarUrl(avatarUrl: string | null): string {
  if (!avatarUrl) return DEFAULT_AVATAR
  if (avatarUrl.startsWith("http")) return avatarUrl
  const path = publicImageUrl("avatars", avatarUrl)
  return path || DEFAULT_AVATAR
}

function initialsFromAuthor(author: string): string {
  const parts = author.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    const a = parts[0]![0] ?? ""
    const b = parts[parts.length - 1]![0] ?? ""
    return (a + b).toUpperCase()
  }
  return author.slice(0, 2).toUpperCase()
}

export default async function TestimonialsSection() {
  const locale = await getLocale()
  const t = await getTranslations("testimonials")
  const testimonial = getTestimonial(locale)

  const quote = testimonial?.quote ?? t("quote")
  const author = testimonial?.author ?? t("author")
  const role = testimonial?.role ?? t("role")
  const usePhoto =
    Boolean(testimonial?.avatar_url?.trim()) &&
    !testimonial?.avatar_initials?.trim()
  const avatarUrl = usePhoto
    ? resolveAvatarUrl(testimonial!.avatar_url)
    : null
  const avatarFallback =
    testimonial?.avatar_initials?.trim() ||
    t("initials") ||
    initialsFromAuthor(author) ||
    author.slice(0, 2).toUpperCase()

  return (
    <section className="py-16 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <blockquote>
            <p className="text-lg font-medium sm:text-xl md:text-3xl">{quote}</p>

            <div className="mt-12 flex items-center justify-center gap-6">
              <Avatar className="size-12">
                {usePhoto && avatarUrl ? (
                  <AvatarImage
                    src={avatarUrl}
                    alt={author}
                    height="400"
                    width="400"
                    loading="lazy"
                  />
                ) : null}
                <AvatarFallback className="text-xs font-semibold">
                  {avatarFallback}
                </AvatarFallback>
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
