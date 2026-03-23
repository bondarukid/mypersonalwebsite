/*
 * Copyright (C) 2026 Ivan Bondaruk (https://bondarukid.com)
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import type { Certificate } from "@/lib/supabase/certificates"
import { AwardIcon } from "lucide-react"

function getCertificateImageUrl(imagePath: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!base) return ""
  return `${base}/storage/v1/object/public/certificates/${imagePath}`
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr + "T00:00:00")
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  } catch {
    return dateStr
  }
}

interface CertificatesSectionProps {
  certificates: Certificate[]
}

export default function CertificatesSection({ certificates }: CertificatesSectionProps) {
  const t = useTranslations("professional.certificates")
  const [selected, setSelected] = useState<Certificate | null>(null)

  if (certificates.length === 0) {
    return (
      <section className="space-y-8">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 md:text-3xl">
          {t("heading")}
        </h2>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <AwardIcon />
            </EmptyMedia>
            <EmptyTitle>{t("emptyTitle")}</EmptyTitle>
            <EmptyDescription>{t("emptyDescription")}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent />
        </Empty>
      </section>
    )
  }

  return (
    <section className="space-y-8">
      <h2 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 md:text-3xl">
        {t("heading")}
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {certificates.map((cert) => {
          const src = getCertificateImageUrl(cert.image_path)
          return (
            <button
              key={cert.id}
              type="button"
              onClick={() => setSelected(cert)}
              className="group flex flex-col items-stretch text-left outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg overflow-hidden"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg border bg-muted">
                <Image
                  src={src}
                  alt={cert.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                  className="object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <p className="mt-2 font-medium text-sm text-foreground truncate">
                {cert.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDate(cert.date_obtained)}
              </p>
            </button>
          )
        })}
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selected?.name}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border bg-muted">
                <Image
                  src={getCertificateImageUrl(selected.image_path)}
                  alt={selected.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 600px"
                  className="object-contain"
                />
              </div>
              {selected.description && (
                <p className="text-sm text-muted-foreground">
                  {selected.description}
                </p>
              )}
              <p className="text-sm font-medium text-foreground">
                {t("dateObtained")}: {formatDate(selected.date_obtained)}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}
