"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface HeatBarProps {
  current: number;
  max: number;
  className?: string;
}

export function HeatBar({ current, max, className }: HeatBarProps) {
  const percentage = Math.min((current / max) * 100, 100);

  // Decide color based on percentage
  const getColor = () => {
    if (percentage < 40)
      return "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]";
    if (percentage < 80)
      return "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]";
    return "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]";
  };

  const getLabel = () => {
    if (percentage < 40) return "Available";
    if (percentage < 80) return "Steady";
    return "Near Capacity";
  };

  return (
    <div className={cn("flex flex-col gap-2 w-32", className)}>
      <div className="flex justify-between items-center px-1">
        <span
          className={cn(
            "text-[9px] font-black uppercase tracking-widest",
            percentage < 40
              ? "text-emerald-500/80"
              : percentage < 80
                ? "text-amber-500/80"
                : "text-rose-500/80",
          )}
        >
          {getLabel()}
        </span>
        <span className="text-[9px] font-bold text-white/30 uppercase tracking-tighter">
          {current}/{max} Projects
        </span>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={cn(
            "h-full rounded-full transition-all duration-500",
            getColor(),
          )}
        />
      </div>
    </div>
  );
}
