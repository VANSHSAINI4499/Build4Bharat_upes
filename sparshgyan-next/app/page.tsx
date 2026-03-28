import { Hero } from '@/components/sections/Hero'
import { FeatureGrid } from '@/components/sections/FeatureGrid'
import { HowItWorks } from '@/components/sections/HowItWorks'
import { CtaSection } from '@/components/sections/CtaSection'

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeatureGrid />
      <HowItWorks />
      <CtaSection />
    </>
  )
}
