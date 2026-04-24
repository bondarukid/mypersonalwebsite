"use client"

import * as React from "react"
import { format } from "date-fns"
import { enUS, ja, uk } from "date-fns/locale"
import type { Locale } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const LOCALE_BY_ID: Record<string, Locale> = {
  en: enUS,
  uk,
  ja,
}

function dateFnsLocale(id: string): Locale {
  return LOCALE_BY_ID[id] ?? enUS
}

function parseYmd(value: string | null | undefined): Date | undefined {
  if (value == null || value === "") return undefined
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined
  const y = Number(value.slice(0, 4))
  const m = Number(value.slice(5, 7))
  const d = Number(value.slice(8, 10))
  if ([y, m, d].some((n) => Number.isNaN(n))) return undefined
  return new Date(y, m - 1, d)
}

function toYmd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export function DatePicker({
  value,
  onValueChange,
  disabled,
  className,
  "aria-label": ariaLabel,
  id,
  placeholder = "—",
  locale: localeId = "en",
}: {
  value: string
  onValueChange: (v: string) => void
  disabled?: boolean
  className?: string
  "aria-label"?: string
  id?: string
  placeholder?: string
  locale?: string
}) {
  const [open, setOpen] = React.useState(false)
  const df = dateFnsLocale(localeId)
  const selected = parseYmd(value)
  const now = new Date()
  const endYear = now.getFullYear() + 10

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className={cn(
              "h-9 w-full min-w-0 justify-start text-left font-normal",
              !selected && "text-muted-foreground",
              className
            )}
            id={id}
            disabled={disabled}
            aria-label={ariaLabel}
          />
        }
      >
        <CalendarIcon data-icon="inline-start" />
        {selected ? (
          format(selected, "PPP", { locale: df })
        ) : (
          <span className="truncate">{placeholder}</span>
        )}
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        align="start"
        side="bottom"
        sideOffset={4}
      >
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(d) => {
            if (d) {
              onValueChange(toYmd(d))
              setOpen(false)
            }
          }}
          defaultMonth={selected ?? now}
          locale={df}
          captionLayout="dropdown"
          startMonth={new Date(1950, 0)}
          endMonth={new Date(endYear, 11)}
        />
      </PopoverContent>
    </Popover>
  )
}
