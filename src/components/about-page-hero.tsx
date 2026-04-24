/*
 * Copyright (C) 2026 Ivan Bondaruk (https://bondarukid.com)
 *
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

import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/routing"
import { buttonVariants } from "@/components/ui/button-variants"
import { cn } from "@/lib/utils"

export async function AboutPageHero() {
  const t = await getTranslations("aboutPage.hero")

  return (
    <section className="relative overflow-hidden bg-black">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="max-w-3xl">
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-zinc-50 md:text-5xl lg:text-6xl">
            {t("title")}
          </h1>
          <p className="mt-6 max-w-2xl text-pretty text-lg text-zinc-400 md:text-xl">
            {t("subtitle")}
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/projects"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-11 px-6 text-base"
              )}
            >
              {t("ctaProjects")}
            </Link>
            <Link
              href="/contact"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-11 px-6 text-base"
              )}
            >
              {t("ctaContact")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
