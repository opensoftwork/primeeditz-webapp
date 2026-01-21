'use client'

import { Hero } from "@/components/modules/landing/hero";
import { Leva } from "leva";

export default function Home() {
  return (
    <div className="overflow-x-hidden">
      <div className="relative z-10 min-h-screen">
        <main className="max-w-full mx-auto relative overflow-visible">
          <Hero />
          <Leva hidden />
        </main>
      </div>
    </div>
  );
}

