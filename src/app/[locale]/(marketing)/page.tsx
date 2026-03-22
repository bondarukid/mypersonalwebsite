import HeroSection from "@/components/hero-section"
import Features from "@/components/features-4"
import IntegrationsSection from "@/components/integrations-1"
import StatsSection from "@/components/stats"
import TestimonialsSection from "@/components/testimonials"
import FooterSection from "@/components/footer"
import FAQsThree from "@/components/faqs-3"

export default function Home() {
  return (
    <div className="">
      <HeroSection />
      <Features />
      <IntegrationsSection />
      <StatsSection />
      <TestimonialsSection />
      <FAQsThree />
      <FooterSection />
    </div>
  )
}
