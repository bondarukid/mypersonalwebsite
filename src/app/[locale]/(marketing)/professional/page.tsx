import type { Metadata } from "next"
import { getLocale, getTranslations } from "next-intl/server"
import ProfessionalIntroSection from "@/components/professional-intro-section"
import CertificatesSection from "@/components/certificates-section"
import ExperienceSection from "@/components/experience-section"
import { getCertificatesForLocale } from "@/lib/supabase/certificates"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata")
  return {
    title: t("professionalTitle"),
    description: t("professionalDescription"),
  }
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
