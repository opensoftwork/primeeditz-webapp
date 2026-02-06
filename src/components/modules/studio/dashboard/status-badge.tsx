"use client";

import { Badge } from "@/components/ui/badge";
import { getStatusConfig } from "@/lib/status-display";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }) {
  const statusInfo = getStatusConfig(status);

  const statusColors: Record<string, string> = {
    awaiting_quotation: "border-amber-500/40 text-amber-500 bg-amber-500/10",
    quotation_sent: "border-amber-500/40 text-amber-500 bg-amber-500/10",
    awaiting_onboarding: "border-amber-500/40 text-amber-500 bg-amber-500/10",
    awaiting_uploads: "border-amber-500/40 text-amber-500 bg-amber-500/10",
    work_in_progress: "border-purple-500/40 text-purple-500 bg-purple-500/10",
    completed: "border-emerald-500/40 text-emerald-500 bg-emerald-500/10",
    delivered: "border-emerald-500/40 text-emerald-500 bg-emerald-500/10",
  };

  const className =
    statusColors[status] || "border-blue-500/40 text-blue-500 bg-blue-500/10";

  return (
    <Badge
      variant="outline"
      className={cn(
        "uppercase text-[8px] tracking-[0.2em] font-black py-0.5 px-2 h-6 rounded-md border-2 whitespace-nowrap",
        className,
      )}
    >
      <div className="flex items-center gap-1.5">
        <div
          className={cn(
            "w-1 h-1 rounded-full",
            statusInfo.label === "Pending"
              ? "animate-pulse bg-amber-500"
              : "bg-current",
          )}
        />
        {statusInfo.label}
      </div>
    </Badge>
  );
}
