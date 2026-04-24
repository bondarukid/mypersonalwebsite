"use client"

import { useMemo, useState } from "react"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

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
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewLocale, setPreviewLocale] = useState(
    () => routing.locales[0] ?? "en"
  )

  const enTestimonial = testimonials.find((t) => t.locale === "en")
  const currentTestimonial = testimonials.find((t) => t.locale === activeLocale)
  const isEditingEn = activeLocale === "en"

  const previewStrings = useMemo(() => {
    const loc = previewLocale
    return {
      quote:
        (testimonials.find((t) => t.locale === loc)?.quote ??
          enTestimonial?.quote) ||
        "",
      author:
        (testimonials.find((t) => t.locale === loc)?.author ??
          enTestimonial?.author) ||
        "",
      role:
        (testimonials.find((t) => t.locale === loc)?.role ??
          enTestimonial?.role) ||
        "",
    }
  }, [previewLocale, testimonials, enTestimonial])

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
            <div className="grid gap-6">
              <Card>
                <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1.5">
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
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="shrink-0"
                    onClick={() => setPreviewOpen(true)}
                  >
                    {t("showPreview")}
                  </Button>
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
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <Dialog
        open={previewOpen}
        onOpenChange={(open) => {
          setPreviewOpen(open)
          if (open) setPreviewLocale(activeLocale)
        }}
      >
        <DialogContent
          overlayClassName="bg-black/80 backdrop-blur-sm"
          className={cn(
            "fixed inset-0 left-0 top-0 z-50 flex h-[100dvh] max-h-[100dvh] w-[100vw] max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none border-0 bg-background p-0 shadow-none sm:max-w-none",
            "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-100",
            "data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-100"
          )}
        >
          <DialogHeader className="shrink-0 border-b px-6 py-4 text-left sm:px-8 sm:py-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
              <div className="min-w-0 space-y-1.5">
                <DialogTitle>{t("preview")}</DialogTitle>
                <DialogDescription>{t("previewHint")}</DialogDescription>
              </div>
              <div className="flex shrink-0 flex-col gap-1.5 sm:items-end">
                <span className="text-xs font-medium text-muted-foreground">
                  {t("previewLanguage")}
                </span>
                <Select
                  value={previewLocale}
                  onValueChange={(v) => {
                    if (v) setPreviewLocale(v)
                  }}
                >
                  <SelectTrigger
                    className="w-full min-w-[12rem] sm:w-[min(100%,220px)]"
                    aria-label={t("previewLanguage")}
                  >
                    <SelectValue>
                      {(() => {
                        const cfg = LOCALES.find((l) => l.id === previewLocale)
                        return (
                          <span className="flex items-center gap-2">
                            {cfg?.flag && (
                              <span aria-hidden>{cfg.flag}</span>
                            )}
                            {cfg?.label ?? previewLocale}
                          </span>
                        )
                      })()}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {LOCALES.filter((l) => routing.locales.includes(l.id)).map(
                      (locale) => (
                        <SelectItem key={locale.id} value={locale.id}>
                          <span className="flex items-center gap-2">
                            {locale.flag && (
                              <span aria-hidden>{locale.flag}</span>
                            )}
                            {locale.label}
                          </span>
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DialogHeader>
          <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-8 sm:px-10 md:px-16">
            <div className="w-full max-w-3xl">
              <TestimonialPreview
                quote={previewStrings.quote}
                author={previewStrings.author}
                role={previewStrings.role}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
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
    <blockquote className="border-l-4 border-muted-foreground/30 pl-6 md:pl-8">
      <p className="text-lg font-medium leading-relaxed sm:text-xl md:text-2xl lg:text-3xl">
        {quote || <span className="text-muted-foreground">Quote…</span>}
      </p>
      <div className="mt-8 flex items-center gap-4 md:mt-10 md:gap-5">
        <Avatar className="size-12 md:size-14">
          <AvatarFallback className="text-sm md:text-base">{fallback}</AvatarFallback>
        </Avatar>
        <div>
          <cite className="block text-base font-medium not-italic md:text-lg">
            {author || "Author"}
          </cite>
          <span className="text-sm text-muted-foreground md:text-base">
            {role || "Role"}
          </span>
        </div>
      </div>
    </blockquote>
  )
}
