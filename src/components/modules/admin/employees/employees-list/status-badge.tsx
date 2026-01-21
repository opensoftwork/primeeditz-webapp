"use client";

import { cn } from "@/lib/utils";

interface OnboardingBadgeProps {
  isComplete: boolean;
}

export function OnboardingBadge({ isComplete }: OnboardingBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
        isComplete
          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          isComplete ? "bg-emerald-400" : "bg-amber-400 animate-pulse"
        )}
      />
      {isComplete ? "Active" : "Pending"}
    </span>
  );
}
