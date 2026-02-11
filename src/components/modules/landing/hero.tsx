"use client";

// import { Maximize2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GL } from "./gl";

import { DashboardPreview } from "./modules/dashboard-preview";
import { Pill } from "./pill";
import { TransitionLink } from "./transition-link";

export function Hero() {
  const [hovering, setHovering] = useState(false);
  return (
    <div className="flex flex-col min-h-screen justify-center pt-36 sm:pt-40 md:pt-44 lg:pt-48 xl:pt-36">
      <GL hovering={hovering} />

      <div className="pb-20 md:pb-32 relative z-20 px-4 sm:px-6 md:px-8">
        <div className="max-w-full mx-auto">
          {/* Envelope Container - Wraps both Hero Card and Dashboard Preview */}
          <div className="backdrop-blur-sm bg-background/5 border border-foreground/15 shadow-2xl rounded-xl md:rounded-2xl lg:rounded-3xl p-6 sm:p-8 md:p-10 lg:p-12 xl:p-16 overflow-visible">
            {/* Side-by-side layout: Hero Card (left 1/3) and Dashboard Preview (right 2/3) */}
            <div className="flex flex-col lg:flex-row gap-8 md:gap-10 lg:gap-12 xl:gap-16 items-stretch lg:items-center min-h-[500px] md:min-h-[600px] lg:min-h-[700px]">
              {/* Hero Content Card - Left Section (1/3 on desktop) */}
              <div className="w-full lg:w-1/3 shrink-0 flex flex-col justify-center">
                <Pill className="mb-6 sm:mb-7 md:mb-8">BETA RELEASE</Pill>
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-6xl font-sentient leading-[1.1] tracking-tight mb-4 sm:mb-5 md:mb-6 text-white text-balance">
                  Unlock your <br />
                  Next efficiency hit
                </h1>
                <p className="font-mono text-sm sm:text-base md:text-lg lg:text-xl text-foreground/80 text-balance leading-relaxed max-w-xl">
                  A comprehensive post-production system that enables teams and
                  studios to manage their entire workflow—from client management
                  to team collaboration.
                </p>

                <div className="relative z-30 mt-10 sm:mt-12 md:mt-14 lg:mt-16">
                  <TransitionLink className="contents" href="/contact">
                    <Button
                      onMouseEnter={() => setHovering(true)}
                      onMouseLeave={() => setHovering(false)}
                      className="text-sm sm:text-base md:text-lg px-6 sm:px-8 md:px-10 py-3 md:py-4 w-full"
                    >
                      [Contact Us]
                    </Button>
                  </TransitionLink>
                </div>
              </div>

              {/* Dashboard Preview - Right Section (2/3 on desktop) */}
              <div className="w-full lg:w-2/3 shrink-0 flex flex-col justify-center">
                <div className="mb-5 sm:mb-6 md:mb-8 flex items-center justify-between lg:justify-start gap-3">
                  <p className="text-[10px] sm:text-[11px] font-black text-cyan-400 uppercase tracking-[0.3em]">
                    Platform Preview
                  </p>
                  {/* Mobile View Button - Commented out for now */}
                  {/* <button
                    onClick={() => {
                      const event = new CustomEvent('openDashboardModal');
                      window.dispatchEvent(event);
                    }}
                    className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary text-xs sm:text-sm font-mono uppercase tracking-wider transition-all duration-200 hover:scale-105 active:scale-95"
                    aria-label="View full image"
                  >
                    <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>View</span>
                  </button> */}
                </div>
                <div className="flex-1 flex items-center px-5">
                  <DashboardPreview />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
