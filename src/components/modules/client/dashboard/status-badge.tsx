"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    pending_review: {
      label: "Pending",
      className: "border-amber-500/40 text-amber-500 bg-amber-500/10",
    },
    active: {
      label: "Active",
      className: "border-blue-500/40 text-blue-500 bg-blue-500/10",
    },
    in_progress: {
      label: "Process",
      className: "border-purple-500/40 text-purple-500 bg-purple-500/10",
    },
    completed: {
      label: "Done",
      className: "border-emerald-500/40 text-emerald-500 bg-emerald-500/10",
    },
  };

  const config = statusConfig[status] ?? {
    label: status.replace("_", " "),
    className: "border-white/20 text-white/70 bg-white/10",
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "uppercase text-[8px] tracking-[0.2em] font-black py-0.5 px-2 h-6 rounded-md border-2 whitespace-nowrap",
        config.className,
      )}
    >
      <div className="flex items-center gap-1.5">
        <div
          className={cn(
            "w-1 h-1 rounded-full",
            config.label === "Pending"
              ? "animate-pulse bg-amber-500"
              : "bg-current",
          )}
        />
        {config.label}
      </div>
    </Badge>
  );
}
