"use client"

import { useLocale } from "next-intl"
import { usePathname, useRouter } from "@/i18n/routing"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const localeLabels: Record<string, string> = {
  en: "EN",
  uk: "UA",
  ja: "日本語",
}

export function LocaleSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const handleChange = (value: string | null) => {
    if (value) router.replace(pathname, { locale: value })
  }

  return (
    <Select value={locale} onValueChange={handleChange}>
      <SelectTrigger className="w-[100px] h-8">
        <SelectValue>{localeLabels[locale] ?? locale}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">{localeLabels.en}</SelectItem>
        <SelectItem value="uk">{localeLabels.uk}</SelectItem>
        <SelectItem value="ja">{localeLabels.ja}</SelectItem>
      </SelectContent>
    </Select>
  )
}
