'use client'

import { Hero } from "@/components/modules/landing/hero";
import { Leva } from "leva";

import { 
  ProblemSolutionSection, 
  FeaturesShowcaseSection, 
  WorkflowDemoSection,
  WhoItsForSection,
  PricingSection,
  FAQSection,
  CTABannerSection,
  FooterSection,
  TestimonialsSection
} from "@/components/modules/landing/sections";

import { AnimatedSection } from "@/components/modules/landing/animated-section";

export default function Home() {
  return (
    <div className="overflow-x-hidden bg-background">
      <div className="relative z-10 min-h-screen">
        <main className="max-w-full mx-auto relative overflow-visible">
          <Hero />
          
          <AnimatedSection id="problems">
            <ProblemSolutionSection />
          </AnimatedSection>

          <AnimatedSection id="workflow">
            <WorkflowDemoSection />
          </AnimatedSection>
          
          <AnimatedSection id="features">
            <FeaturesShowcaseSection />
          </AnimatedSection>

          <AnimatedSection id="audience">
            <WhoItsForSection />
          </AnimatedSection>

          <AnimatedSection id="testimonials">
            <TestimonialsSection />
          </AnimatedSection>

          <AnimatedSection id="pricing">
            <PricingSection />
          </AnimatedSection>

          <AnimatedSection id="faq">
            <FAQSection />
          </AnimatedSection>

          <AnimatedSection>
            <CTABannerSection />
          </AnimatedSection>

          <FooterSection />
          <Leva hidden />
        </main>
      </div>
    </div>
  );
}

