"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import type { Testimonial } from "@/lib/supabase/testimonials"
import { updateTestimonialFieldAction } from "./actions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Loader2 } from "lucide-react"
import { routing } from "@/i18n/routing"

const LOCALES = [
  { id: "en", label: "English", flag: "🇬🇧" },
  { id: "uk", label: "Ukrainian", flag: "🇺🇦" },
  { id: "ja", label: "日本語", flag: "🇯🇵" },
] as const

const FIELDS = [
  { key: "quote", labelKey: "quote", textarea: true },
  { key: "author", labelKey: "author", textarea: false },
  { key: "role", labelKey: "role", textarea: false },
] as const

type FieldKey = (typeof FIELDS)[number]["key"]

function getProgress(t: Testimonial | undefined): number {
  if (!t) return 0
  const filled = [t.quote?.trim(), t.author?.trim(), t.role?.trim()].filter(
    Boolean
  ).length
  return Math.round((filled / 3) * 100)
}

interface TestimonialsEditorProps {
  testimonials: Testimonial[]
}

export function TestimonialsEditor({ testimonials }: TestimonialsEditorProps) {
  const t = useTranslations("dashboard.testimonialsPage")
  const tKeys = useTranslations("dashboard.localization.keys")
  const router = useRouter()
  const [activeLocale, setActiveLocale] = useState(
    () => routing.locales[0] ?? "en"
  )
  const [savingId, setSavingId] = useState<string | null>(null)

  const enTestimonial = testimonials.find((t) => t.locale === "en")
  const currentTestimonial = testimonials.find((t) => t.locale === activeLocale)
  const isEditingEn = activeLocale === "en"

  const handleBlur = async (
    testimonialId: string,
    field: FieldKey,
    value: string
  ) => {
    const trimmed = value.trim()
    if (!trimmed || !testimonialId) return

    setSavingId(`${testimonialId}-${field}`)
    const result = await updateTestimonialFieldAction(
      testimonialId,
      field,
      trimmed
    )
    setSavingId(null)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(result.success ?? t("saved"))
      router.refresh()
    }
  }

  if (testimonials.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <p className="text-center text-muted-foreground">{t("noTestimonials")}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs
        value={activeLocale}
        onValueChange={setActiveLocale}
        className="w-full"
      >
        <TabsList className="grid w-full max-w-md grid-cols-3">
          {LOCALES.filter((l) => routing.locales.includes(l.id)).map(
            (locale) => {
              const testimonial = testimonials.find(
                (t) => t.locale === locale.id
              )
              const progress = getProgress(testimonial)
              return (
                <TabsTrigger
                  key={locale.id}
                  value={locale.id}
                  className="flex flex-col gap-1 py-3"
                >
                  <span className="flex items-center gap-2">
                    {locale.flag && <span aria-hidden>{locale.flag}</span>}
                    {locale.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {progress}%
                  </span>
                </TabsTrigger>
              )
            }
          )}
        </TabsList>

        {routing.locales.map((locale) => (
          <TabsContent
            key={locale}
            value={locale}
            className="mt-6 focus-visible:outline-none"
          >
            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {isEditingEn && locale === "en"
                      ? t("editingDefault")
                      : t("editingTranslation", {
                          locale:
                            LOCALES.find((l) => l.id === locale)?.label ??
                            locale,
                        })}
                  </CardTitle>
                  <CardDescription>{t("editingHint")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {FIELDS.map(({ key, labelKey, textarea }) => {
                    const testimonial = locale === "en" ? enTestimonial : testimonials.find((t) => t.locale === locale)
                    const defaultValue = enTestimonial?.[key] ?? ""
                    const currentValue = testimonial?.[key] ?? ""
                    const isPending =
                      savingId === `${testimonial?.id}-${key}`

                    return (
                      <div key={key} className="space-y-2">
                        <Label htmlFor={`${locale}-${key}`}>
                          {tKeys(labelKey)}
                        </Label>
                        {locale === "en" ? (
                          textarea ? (
                            <Textarea
                              id={`${locale}-${key}`}
                              key={`${testimonial?.id}-${key}-${locale}`}
                              defaultValue={defaultValue}
                              rows={4}
                              disabled={isPending}
                              onBlur={(e) =>
                                testimonial &&
                                handleBlur(
                                  testimonial.id,
                                  key,
                                  e.currentTarget.value
                                )
                              }
                              className="resize-y"
                              placeholder={
                                textarea
                                  ? t("placeholderQuote")
                                  : key === "author"
                                    ? t("placeholderAuthor")
                                    : t("placeholderRole")
                              }
                            />
                          ) : (
                            <Input
                              id={`${locale}-${key}`}
                              key={`${testimonial?.id}-${key}-${locale}`}
                              defaultValue={defaultValue}
                              disabled={isPending}
                              onBlur={(e) =>
                                testimonial &&
                                handleBlur(
                                  testimonial.id,
                                  key,
                                  e.currentTarget.value
                                )
                              }
                              placeholder={
                                textarea
                                  ? t("placeholderQuote")
                                  : key === "author"
                                    ? t("placeholderAuthor")
                                    : t("placeholderRole")
                              }
                            />
                          )
                        ) : (
                          <div className="space-y-3">
                            <div className="rounded-lg border bg-muted/40 px-3 py-2.5 text-sm">
                              {defaultValue || "—"}
                            </div>
                            <Label
                              htmlFor={`${locale}-${key}`}
                              className="text-muted-foreground"
                            >
                              {t("translation")}
                            </Label>
                            {testimonial ? (
                              textarea ? (
                                <Textarea
                                  id={`${locale}-${key}`}
                                  key={`${testimonial.id}-${key}-${locale}`}
                                  defaultValue={currentValue}
                                  rows={4}
                                  disabled={isPending}
                                  onBlur={(e) =>
                                    handleBlur(
                                      testimonial.id,
                                      key,
                                      e.currentTarget.value
                                    )
                                  }
                                  className="resize-y"
                                  placeholder={
                                textarea
                                  ? t("placeholderQuote")
                                  : key === "author"
                                    ? t("placeholderAuthor")
                                    : t("placeholderRole")
                              }
                                />
                              ) : (
                                <Input
                                  id={`${locale}-${key}`}
                                  key={`${testimonial.id}-${key}-${locale}`}
                                  defaultValue={currentValue}
                                  disabled={isPending}
                                  onBlur={(e) =>
                                    handleBlur(
                                      testimonial.id,
                                      key,
                                      e.currentTarget.value
                                    )
                                  }
                                  placeholder={
                                textarea
                                  ? t("placeholderQuote")
                                  : key === "author"
                                    ? t("placeholderAuthor")
                                    : t("placeholderRole")
                              }
                                />
                              )
                            ) : (
                              <div className="rounded-lg border border-dashed px-3 py-2.5 text-sm text-muted-foreground">
                                —
                              </div>
                            )}
                          </div>
                        )}
                        {isPending && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Loader2 className="size-3 animate-spin" />
                            {t("saving")}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              <Card className="h-fit lg:sticky lg:top-6">
                <CardHeader>
                  <CardTitle className="text-sm">{t("preview")}</CardTitle>
                  <CardDescription>{t("previewHint")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <TestimonialPreview
                    quote={
                      (testimonials.find((t) => t.locale === locale)?.quote ??
                        enTestimonial?.quote) ||
                      ""
                    }
                    author={
                      (testimonials.find((t) => t.locale === locale)?.author ??
                        enTestimonial?.author) ||
                      ""
                    }
                    role={
                      (testimonials.find((t) => t.locale === locale)?.role ??
                        enTestimonial?.role) ||
                      ""
                    }
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

function TestimonialPreview({
  quote,
  author,
  role,
}: {
  quote: string
  author: string
  role: string
}) {
  const fallback = author.slice(0, 2).toUpperCase() || "?"
  return (
    <blockquote className="border-l-2 border-muted-foreground/30 pl-4">
      <p className="text-sm leading-relaxed">
        {quote || <span className="text-muted-foreground">Quote…</span>}
      </p>
      <div className="mt-4 flex items-center gap-3">
        <Avatar className="size-10">
          <AvatarFallback className="text-xs">{fallback}</AvatarFallback>
        </Avatar>
        <div>
          <cite className="block text-sm font-medium not-italic">
            {author || "Author"}
          </cite>
          <span className="text-xs text-muted-foreground">{role || "Role"}</span>
        </div>
      </div>
    </blockquote>
  )
}
