"use client";

import { CircleDot } from "lucide-react";
import { cn } from "@/lib/utils";

import { getStatusConfig } from "@/lib/status-display";

interface StatusBadgeProps {
  status: string;
  source?: "studio_request" | "admin_init";
  deliveryLabel?: string;
}

export function StatusBadge({
  status,
  source,
  deliveryLabel,
}: StatusBadgeProps) {
  const config = getStatusConfig(status, deliveryLabel);

  return (
    <div className="flex flex-col gap-1">
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border self-start",
          config.bgColor,
          config.color,
        )}
      >
        <CircleDot className="h-2.5 w-2.5" />
        {config.label}
      </span>
      {status === "draft" && source && (
        <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.15em] px-1">
          {source === "admin_init" ? "Admin Initiated" : "Client Request"}
        </span>
      )}
    </div>
  );
}
