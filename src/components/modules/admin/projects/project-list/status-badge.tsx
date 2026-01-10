"use client";

import { CircleDot } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig: Record<
    string,
    { label: string; color: string; bgColor: string }
  > = {
    draft: {
      label: "Draft",
      color: "text-zinc-400",
      bgColor: "bg-zinc-500/10 border-zinc-500/20",
    },
    pending_review: {
      label: "Pending",
      color: "text-amber-400",
      bgColor: "bg-amber-500/10 border-amber-500/20",
    },
    active: {
      label: "Active",
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10 border-emerald-500/20",
    },
    in_progress: {
      label: "In Progress",
      color: "text-blue-400",
      bgColor: "bg-blue-500/10 border-blue-500/20",
    },
    completed: {
      label: "Completed",
      color: "text-primary",
      bgColor: "bg-primary/10 border-primary/20",
    },
    archived: {
      label: "Archived",
      color: "text-zinc-500",
      bgColor: "bg-zinc-500/5 border-zinc-500/10",
    },
  };

  const config = statusConfig[status] || statusConfig.draft;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
        config.bgColor,
        config.color
      )}
    >
      <CircleDot className="h-2.5 w-2.5" />
      {config.label}
    </span>
  );
}
