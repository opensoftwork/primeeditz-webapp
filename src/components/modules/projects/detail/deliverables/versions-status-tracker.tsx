"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Clock, Loader2, CheckCircle, RotateCcw } from "lucide-react";

interface VersionStatusTrackerProps {
  status?: "pending" | "in_progress" | "resolved";
  className?: string;
}

export function VersionStatusTracker({
  status,
  className,
}: VersionStatusTrackerProps) {
  if (!status) return null;

  const configs = {
    pending: {
      label: "Changes Requested",
      icon: RotateCcw,
      className: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    },
    in_progress: {
      label: "In Progress",
      icon: Loader2,
      className: "bg-blue-500/10 text-blue-500 border-blue-500/20 icon-spin",
    },
    resolved: {
      label: "Resolved",
      icon: CheckCircle,
      className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    },
  };

  const config = configs[status];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        "px-2 py-0.5 text-[9px] font-black uppercase tracking-widest gap-1.5",
        config.className,
        className,
      )}
    >
      <Icon
        className={cn("h-3 w-3", status === "in_progress" && "animate-spin")}
      />
      {config.label}
    </Badge>
  );
}
