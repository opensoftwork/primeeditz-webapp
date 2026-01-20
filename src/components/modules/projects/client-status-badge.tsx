"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { getStatusConfig } from "@/lib/status-display";

interface ClientStatusBadgeProps {
  status: string;
  className?: string;
}

export function ClientStatusBadge({
  status,
  className,
}: ClientStatusBadgeProps) {
  const config = getStatusConfig(status);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Badge
        variant="outline"
        className={cn(
          "uppercase text-[9px] tracking-[0.2em] font-black py-1 px-4 rounded-lg border-2 shadow-[0_5px_15px_rgba(0,0,0,0.2)]",
          config.bgColor,
          config.color,
        )}
      >
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              status === "awaiting_quotation" || status === "awaiting_review"
                ? "animate-pulse bg-amber-500"
                : "bg-current",
            )}
          />
          {config.label}
        </div>
      </Badge>
    </div>
  );
}
