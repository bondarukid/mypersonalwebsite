import type { Metadata } from "next"
import { getLocale, getTranslations } from "next-intl/server"
import HeroSection from "@/components/hero-section"
import Features from "@/components/features-4"
import IntegrationsSection from "@/components/integrations-1"
import StatsSection from "@/components/stats"
import TestimonialsSection from "@/components/testimonials"
import FooterSection from "@/components/footer"
import FAQsThree from "@/components/faqs-3"
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

  return (
    <div className="">
      <JsonLdPerson />
      <HeroSection />
      <Features />
      <IntegrationsSection />
      <StatsSection />
      <TestimonialsSection />
      <FAQsThree />
      <FooterSection socialLinks={socialLinks} />
    </div>
  )
}
