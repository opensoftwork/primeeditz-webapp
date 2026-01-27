"use client";

import { Check } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";

const PHASES = [
  { key: "setup", label: "Setup" },
  { key: "onboarding", label: "Onboarding" },
  { key: "production", label: "Production" },
  { key: "review", label: "Review" },
  { key: "delivery", label: "Delivery" },
  { key: "completed", label: "Complete" },
];

interface PhaseProgressProps {
  currentPhase: string;
  compact?: boolean;
}

export function PhaseProgress({
  currentPhase,
  compact = false,
}: PhaseProgressProps) {
  const currentIndex = PHASES.findIndex((p) => p.key === currentPhase);

  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
          {currentIndex + 1} OF {PHASES.length}
        </span>
        <div className="flex gap-1">
          {PHASES.map((phase, index) => (
            <div
              key={phase.key}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-all duration-500",
                index < currentIndex
                  ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                  : index === currentIndex
                    ? "bg-primary animate-pulse"
                    : "bg-white/10",
              )}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 py-4 overflow-x-auto no-scrollbar">
      {PHASES.map((phase, index) => (
        <React.Fragment key={phase.key}>
          <div className="flex items-center gap-2 group shrink-0">
            <div
              className={cn(
                "w-8 h-8 rounded-xl border flex items-center justify-center transition-all duration-500",
                index < currentIndex
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                  : index === currentIndex
                    ? "bg-primary/10 border-primary/20 text-primary animate-pulse"
                    : "bg-white/5 border-white/10 text-white/20",
              )}
            >
              {index < currentIndex ? (
                <Check className="h-4 w-4" />
              ) : (
                <span className="text-[10px] font-black">{index + 1}</span>
              )}
            </div>
            <div className="flex flex-col">
              <span
                className={cn(
                  "text-[10px] font-black uppercase tracking-widest transition-colors duration-500",
                  index <= currentIndex ? "text-white" : "text-white/20",
                )}
              >
                {phase.label}
              </span>
              {index === currentIndex && (
                <span className="text-[8px] font-bold text-primary uppercase tracking-tighter animate-in fade-in slide-in-from-left-2">
                  CURRENT
                </span>
              )}
            </div>
          </div>
          {index < PHASES.length - 1 && (
            <div
              className={cn(
                "w-8 h-px transition-colors duration-1000",
                index < currentIndex ? "bg-emerald-500/30" : "bg-white/5",
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
