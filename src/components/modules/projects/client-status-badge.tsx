"use client";

import { cn } from "@/lib/utils";
import { getClientStatusDisplay } from "@/lib/status-display";
import { CircleDot, AlertCircle } from "lucide-react";

interface ClientStatusBadgeProps {
  status: string;
  className?: string;
}

export function ClientStatusBadge({
  status,
  className,
}: ClientStatusBadgeProps) {
  const config = getClientStatusDisplay(status);

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div
        className={cn(
          "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300",
          config.isActionNeeded
            ? "bg-primary/10 border-primary/20 text-primary shadow-[0_0_15px_rgba(255,255,255,0.05)]"
            : "bg-white/5 border-white/10 text-white/60",
        )}
      >
        {config.isActionNeeded ? (
          <AlertCircle className="h-3 w-3 animate-pulse" />
        ) : (
          <CircleDot className="h-3 w-3" />
        )}
        {config.label}
      </div>

      {config.description && (
        <p className="text-[9px] font-bold text-white/30 uppercase tracking-tighter ml-1">
          {config.description}
        </p>
      )}
    </div>
  );
}
