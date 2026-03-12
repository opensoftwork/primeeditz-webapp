"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { VERSION_REQUEST_STATUS_CONFIG } from "./constants";
import { VersionRequestStatus } from "./types";

interface VersionStatusBadgeProps {
  status?: VersionRequestStatus | string;
  className?: string;
}

/**
 * Shared status badge for version requests.
 * Used in Admin, Studio, and Employee portals.
 */
export function VersionStatusBadge({
  status,
  className,
}: VersionStatusBadgeProps) {
  if (!status) return null;

  const config = VERSION_REQUEST_STATUS_CONFIG[status];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        "px-2 py-0.5 text-[9px] font-black uppercase tracking-widest gap-1.5",
        config.bg,
        config.text,
        config.border,
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
