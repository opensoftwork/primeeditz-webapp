"use client";

import { Leva } from "leva";
import { AnimatedSection } from "@/components/modules/landing/animated-section";
import { Hero } from "@/components/modules/landing/hero";
import {
  CTABannerSection,
  FAQSection,
  FeaturesShowcaseSection,
  FooterSection,
  PricingSection,
  ProblemSolutionSection,
  TestimonialsSection,
  WhoItsForSection,
  WorkflowDemoSection,
} from "@/components/modules/landing/sections";

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
