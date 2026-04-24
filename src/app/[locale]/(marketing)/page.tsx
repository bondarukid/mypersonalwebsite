import type { Metadata } from "next"
import { getLocale, getTranslations } from "next-intl/server"
import HeroSection from "@/components/hero-section"
import Features from "@/components/features-4"
import IntegrationsSection from "@/components/integrations-1"
import { getLandingCompany } from "@/lib/supabase/companies"
import {
  getLandingFeatureSection,
  getLandingFeatureCards,
  getLandingTechStackSection,
  getLandingTechStackItems,
  getLandingTechStackCategories,
} from "@/lib/supabase/landing-home"
import StatsSection from "@/components/stats"
import TestimonialsSection from "@/components/testimonials"
import FooterSection from "@/components/footer"
import { FAQSection } from "@/components/faq-section"
import { JsonLdPerson } from "@/components/seo/json-ld-person"
import { getSocialLinks } from "@/lib/supabase/social-links"
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
  const socialLinks = await getSocialLinks()
  const locale = await getLocale()
  const landing = await getLandingCompany()
  const featureFromDb = landing
    ? await (async () => {
        const section = await getLandingFeatureSection(landing.id)
        if (!section) return null
        const cards = await getLandingFeatureCards(landing.id)
        return { section, cards }
      })()
    : null
  const techFromDb = landing
    ? await (async () => {
        const section = await getLandingTechStackSection(landing.id)
        if (!section) return null
        const [items, categories] = await Promise.all([
          getLandingTechStackItems(landing.id),
          getLandingTechStackCategories(landing.id),
        ])
        return { section, items, categories }
      })()
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
      <FooterSection socialLinks={socialLinks} />
    </div>
  )
}
