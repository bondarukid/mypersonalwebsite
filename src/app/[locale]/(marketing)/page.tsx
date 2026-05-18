import type { Metadata } from "next"
import { getLocale, getTranslations } from "next-intl/server"
import HeroSection from "@/components/hero-section"
import Features from "@/components/features-4"
import IntegrationsSection from "@/components/integrations-1"
import {
  getLandingFeatureSection,
  getLandingFeatureCards,
  getLandingTechStackSection,
  getLandingTechStackItems,
  getLandingTechStackCategories,
} from "@/content/landing"
import StatsSection from "@/components/stats"
import TestimonialsSection from "@/components/testimonials"
import { FAQSection } from "@/components/faq-section"
import { JsonLdPerson } from "@/components/seo/json-ld-person"
import { createMetadata } from "@/lib/seo/metadata"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = await getTranslations("metadata")
  return createMetadata({
    title: t("defaultTitle"),
    description: t("defaultDescription"),
    path: "",
    locale,
  })
}

export default async function Home() {
  const locale = await getLocale()
  const section = getLandingFeatureSection()
  const cards = getLandingFeatureCards()
  const featureFromDb =
    section && cards.length > 0 ? { section, cards } : null
  const techSection = getLandingTechStackSection()
  const techItems = getLandingTechStackItems()
  const techCategories = getLandingTechStackCategories()
  const techFromDb =
    techSection && techCategories.length > 0
      ? {
          section: techSection,
          items: techItems,
          categories: techCategories,
        }
      : null

  return (
    <div className="">
      <JsonLdPerson />
      <HeroSection />
      <Features locale={locale} fromDb={featureFromDb} />
      <IntegrationsSection fromDb={techFromDb} />
      <StatsSection />
      <TestimonialsSection />
      <FAQSection />
    </div>
  )
}
