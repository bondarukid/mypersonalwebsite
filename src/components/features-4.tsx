import { getTranslations } from "next-intl/server"
import { getLandingFeatureIcon } from "@/config/landing-feature-icons"
import type {
  LandingFeatureCardRow,
  LandingFeatureSectionRow,
} from "@/lib/supabase/landing-home"
import { getLocalizedFeatureCard, getLocalizedSectionHeadingIntro } from "@/lib/supabase/landing-home"
import { Cpu, Fingerprint, Pencil, Settings2, Sparkles, Zap } from "lucide-react"
import type { LucideIcon } from "lucide-react"

const DEFAULT_ICONS: LucideIcon[] = [Zap, Cpu, Fingerprint, Pencil, Settings2, Sparkles]

const DEFAULT_I18N_KEYS: { title: string; body: string }[] = [
  { title: "fast", body: "fastDesc" },
  { title: "powerful", body: "powerfulDesc" },
  { title: "security", body: "securityDesc" },
  { title: "customization", body: "customizationDesc" },
  { title: "control", body: "controlDesc" },
  { title: "builtForAi", body: "builtForAiDesc" },
]

type FeaturesProps = {
  locale: string
  fromDb: {
    section: LandingFeatureSectionRow
    cards: LandingFeatureCardRow[]
  } | null
}

export default async function Features({ locale, fromDb }: FeaturesProps) {
  if (fromDb) {
    const { heading, intro } = getLocalizedSectionHeadingIntro(fromDb.section, locale)
    return (
      <section className="py-12 md:py-20">
        <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
          <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center md:space-y-12">
            <h2 className="text-balance text-4xl font-medium lg:text-5xl">
              {heading}
            </h2>
            <p>{intro}</p>
          </div>

          <div className="relative mx-auto grid max-w-4xl divide-x divide-y border *:p-12 sm:grid-cols-2 lg:grid-cols-3">
            {fromDb.cards.map((card) => {
              const { title, body, lucide_icon } = getLocalizedFeatureCard(card, locale)
              const Icon = getLandingFeatureIcon(lucide_icon) ?? Zap
              return (
                <div key={card.id} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Icon className="size-4" />
                    <h3 className="text-sm font-medium">{title}</h3>
                  </div>
                  <p className="text-sm">{body}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    )
  }

  return <FeaturesI18nFallback />
}

/** Static copy from next-intl when the database has no landing feature section. */
async function FeaturesI18nFallback() {
  const t = await getTranslations("features")
  return (
    <section className="py-12 md:py-20">
      <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
        <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center md:space-y-12">
          <h2 className="text-balance text-4xl font-medium lg:text-5xl">
            {t("heading")}
          </h2>
          <p>{t("intro")}</p>
        </div>

        <div className="relative mx-auto grid max-w-4xl divide-x divide-y border *:p-12 sm:grid-cols-2 lg:grid-cols-3">
          {DEFAULT_I18N_KEYS.map((keys, i) => {
            const Icon = DEFAULT_ICONS[i] ?? Sparkles
            return (
              <div key={keys.title} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Icon className="size-4" />
                  <h3 className="text-sm font-medium">{t(keys.title)}</h3>
                </div>
                <p className="text-sm">{t(keys.body)}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
