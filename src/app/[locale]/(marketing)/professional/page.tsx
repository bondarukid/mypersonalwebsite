import type { Metadata } from "next"
import { getLocale, getTranslations } from "next-intl/server"
import ProfessionalIntroSection from "@/components/professional-intro-section"
import CertificatesSection from "@/components/certificates-section"
import ExperienceSection from "@/components/experience-section"
import { getCertificatesForLocale } from "@/lib/supabase/certificates"
import { createMetadata } from "@/lib/seo/metadata"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = await getTranslations("metadata")
  return createMetadata({
    title: t("professionalTitle"),
    description: t("professionalDescription"),
    path: "professional",
    locale,
  })
}

export default async function ProfessionalPage() {
  const locale = await getLocale()
  const t = await getTranslations("common")
  const certificates = await getCertificatesForLocale(locale)

  return (
    <div className="mx-auto flex flex-1 flex-col px-6 py-16 md:max-w-4xl">
      <ProfessionalIntroSection />
      <CertificatesSection certificates={certificates} />
      <ExperienceSection />
    </div>
  )
}
