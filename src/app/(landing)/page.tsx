'use client'

import { Hero } from "@/components/modules/landing/hero";
import { Leva } from "leva";

import { 
  ProblemSolutionSection, 
  FeaturesShowcaseSection, 
  WorkflowDemoSection,
  WhoItsForSection
} from "@/components/modules/landing/sections";

export default function Home() {
  return (
    <div className="overflow-x-hidden bg-background">
      <div className="relative z-10 min-h-screen">
        <main className="max-w-full mx-auto relative overflow-visible">
          <Hero />
          <ProblemSolutionSection />
          <WorkflowDemoSection />
          <FeaturesShowcaseSection />

          <WhoItsForSection />
          <Leva hidden />
        </main>
      </div>
    </div>
  );
}

