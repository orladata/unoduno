import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { BentoSection } from "@/components/bento-section"
import { SocialProofSection } from "@/components/social-proof-section"
import { MagicSection } from "@/components/magic-section"
import { PricingSection } from "@/components/pricing-section"
import { FAQSection } from "@/components/faq-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <BentoSection />
      <SocialProofSection />
      <MagicSection />
      <FAQSection />
      <PricingSection />
      <Footer />
    </main>
  )
}
