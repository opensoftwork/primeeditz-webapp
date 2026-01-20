"use client";

import { CircleDot } from "lucide-react";
import { cn } from "@/lib/utils";

import { getStatusConfig } from "@/lib/status-display";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = getStatusConfig(status);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
        config.bgColor,
        config.color,
      )}
    >
      <CircleDot className="h-2.5 w-2.5" />
      {config.label}
    </span>
  );
}
