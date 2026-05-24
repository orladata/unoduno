import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { Footer } from "@/components/footer"
import dynamic from "next/dynamic"

// Lazy load below-the-fold sections to improve initial page load performance (LCP/FCP)
const BentoSection = dynamic(() => import("@/components/bento-section").then(mod => mod.BentoSection), { ssr: true })
const SocialProofSection = dynamic(() => import("@/components/social-proof-section").then(mod => mod.SocialProofSection), { ssr: true })
const MagicSection = dynamic(() => import("@/components/magic-section").then(mod => mod.MagicSection), { ssr: true })
const FAQSection = dynamic(() => import("@/components/faq-section").then(mod => mod.FAQSection), { ssr: true })
const PricingSection = dynamic(() => import("@/components/pricing-section").then(mod => mod.PricingSection), { ssr: true })

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
