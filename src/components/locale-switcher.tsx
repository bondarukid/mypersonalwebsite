"use client"

import { useLocale } from "next-intl"
import { routing, usePathname, useRouter } from "@/i18n/routing"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

function getPathWithoutLocale(
  path: string,
  locales: readonly string[]
): string {
  const pattern = new RegExp(`^/(${locales.join("|")})(/.*|$)`)
  const match = path.match(pattern)
  return match ? (match[2] || "/") : path || "/"
}

const localeConfig: Record<
  string,
  { label: string; flag: string }
> = {
  en: { label: "EN", flag: "🇬🇧" },
  uk: { label: "UA", flag: "🇺🇦" },
  ja: { label: "日本語", flag: "🇯🇵" },
}

export function LocaleSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const handleChange = (value: string | null) => {
    if (value) {
      const pathWithoutLocale = getPathWithoutLocale(
        pathname ?? "",
        routing.locales
      )
      router.replace(pathWithoutLocale, { locale: value })
    }
  }

  return (
    <Select value={locale} onValueChange={handleChange}>
      <SelectTrigger className="w-[120px] h-8">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">
          <span className="flex items-center gap-2">
            <span aria-hidden>{localeConfig.en.flag}</span>
            {localeConfig.en.label}
          </span>
        </SelectItem>
        <SelectItem value="uk">
          <span className="flex items-center gap-2">
            <span aria-hidden>{localeConfig.uk.flag}</span>
            {localeConfig.uk.label}
          </span>
        </SelectItem>
        <SelectItem value="ja">
          <span className="flex items-center gap-2">
            <span aria-hidden>{localeConfig.ja.flag}</span>
            {localeConfig.ja.label}
          </span>
        </SelectItem>
      </SelectContent>
    </Select>
  )
}
