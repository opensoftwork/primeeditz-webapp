"use client";

import { CircleDot, Clock, RotateCcw, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmployeeStatusBadgeProps {
  status: string;
  className?: string;
}

const EMPLOYEE_STATUS_MAP: Record<
  string,
  { label: string; icon: any; color: string; bgColor: string }
> = {
  assigned: {
    label: "New Assignment",
    icon: CircleDot,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10 border-blue-500/20",
  },
  work_in_progress: {
    label: "In Progress",
    icon: Clock,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10 border-blue-500/20",
  },
  versions_requested: {
    label: "Versions Needed",
    icon: RotateCcw,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10 border-amber-500/20",
  },
  deliverables_ready: {
    label: "In QC Review",
    icon: Search,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10 border-purple-500/20",
  },
};

export function EmployeeStatusBadge({
  status,
  className,
}: EmployeeStatusBadgeProps) {
  const config = EMPLOYEE_STATUS_MAP[status] || {
    label: status.replace("_", " "),
    icon: CircleDot,
    color: "text-zinc-400",
    bgColor: "bg-white/5 border-white/10",
  };

  const Icon = config.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest transition-all duration-300",
        config.bgColor,
        config.color,
        className,
      )}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </div>
  );
}
