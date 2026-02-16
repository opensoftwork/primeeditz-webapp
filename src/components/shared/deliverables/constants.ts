import { RotateCcw, Loader2, CheckCircle, LucideIcon } from "lucide-react";

export interface StatusConfig {
  label: string;
  icon: LucideIcon;
  bg: string;
  border: string;
  text: string;
}

export const VERSION_REQUEST_STATUS_CONFIG: Record<string, StatusConfig> = {
  pending: {
    label: "Changes Requested",
    icon: RotateCcw,
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    text: "text-amber-500",
  },
  in_progress: {
    label: "In Progress",
    icon: Loader2,
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    text: "text-blue-500",
  },
  resolved: {
    label: "Resolved",
    icon: CheckCircle,
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    text: "text-emerald-500",
  },
};
