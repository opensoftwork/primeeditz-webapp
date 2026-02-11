"use client";

import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Eye,
  type LucideIcon,
  RefreshCw,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";

type QuotationStatus =
  | "sent"
  | "viewed"
  | "approved"
  | "changes_requested"
  | "rejected"
  | "expired"
  | "superseded"
  | "draft";

interface QuotationStatusBadgeProps {
  status: QuotationStatus;
  className?: string;
}

const statusConfig: Record<
  QuotationStatus,
  {
    label: string;
    icon: LucideIcon;
    color: string;
    bgColor: string;
    borderColor: string;
    glowColor: string;
  }
> = {
  draft: {
    label: "Draft",
    icon: Clock,
    color: "text-white/60",
    bgColor: "bg-white/5",
    borderColor: "border-white/20",
    glowColor: "bg-white/5",
  },
  sent: {
    label: "Awaiting Response",
    icon: Send,
    color: "text-amber-400",
    bgColor: "bg-amber-400/10",
    borderColor: "border-amber-400/20",
    glowColor: "bg-amber-400/10",
  },
  viewed: {
    label: "Viewed",
    icon: Eye,
    color: "text-amber-400",
    bgColor: "bg-amber-400/10",
    borderColor: "border-amber-400/20",
    glowColor: "bg-amber-400/10",
  },
  approved: {
    label: "Accepted",
    icon: CheckCircle2,
    color: "text-green-400",
    bgColor: "bg-green-400/10",
    borderColor: "border-green-400/20",
    glowColor: "bg-green-400/10",
  },
  changes_requested: {
    label: "Revisions Requested",
    icon: RefreshCw,
    color: "text-indigo-400",
    bgColor: "bg-indigo-400/10",
    borderColor: "border-indigo-400/20",
    glowColor: "bg-indigo-400/10",
  },
  rejected: {
    label: "Rejected",
    icon: AlertCircle,
    color: "text-red-400",
    bgColor: "bg-red-400/10",
    borderColor: "border-red-400/20",
    glowColor: "bg-red-400/10",
  },
  expired: {
    label: "Expired",
    icon: AlertCircle,
    color: "text-red-400/80",
    bgColor: "bg-red-500/5",
    borderColor: "border-red-500/10",
    glowColor: "bg-red-500/5",
  },
  superseded: {
    label: "Superseded",
    icon: Clock,
    color: "text-white/40",
    bgColor: "bg-white/3",
    borderColor: "border-white/10",
    glowColor: "bg-white/5",
  },
};

export function QuotationStatusBadge({
  status,
  className,
}: QuotationStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.draft;
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "relative flex w-fit items-center gap-1.5 px-3 py-1 rounded-full border transition-all duration-300 group",
        config.bgColor,
        config.borderColor,
        config.color,
        className,
      )}
    >
      {/* Subtle Glow */}
      <div
        className={cn(
          "absolute inset-0 blur-md opacity-0 group-hover:opacity-100 transition-opacity rounded-full",
          config.glowColor,
        )}
      />

      <Icon className="h-3 w-3 relative z-10" />
      <span className="text-[10px] font-black uppercase tracking-widest leading-[1.2] mt-0.5 relative z-10">
        {config.label}
      </span>
    </div>
  );
}
