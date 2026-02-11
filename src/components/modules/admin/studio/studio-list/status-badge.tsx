"use client";

import { CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  isComplete: boolean;
}

export function OnboardingBadge({ isComplete }: StatusBadgeProps) {
  const config = isComplete
    ? {
        label: "Onboarded",
        color: "text-emerald-400",
        bgColor: "bg-emerald-500/10 border-emerald-500/20",
        icon: CheckCircle2,
      }
    : {
        label: "Pending",
        color: "text-amber-400",
        bgColor: "bg-amber-500/10 border-amber-500/20",
        icon: Clock,
      };

  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
        config.bgColor,
        config.color,
      )}
    >
      <Icon className="h-2.5 w-2.5" />
      {config.label}
    </span>
  );
}
