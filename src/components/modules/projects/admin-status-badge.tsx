"use client";

import { cn } from "@/lib/utils";
import { getStatusConfig, getPhaseConfig } from "@/lib/status-display";
import { User, ShieldCheck } from "lucide-react";

interface AdminStatusBadgeProps {
  status: string;
  phase: string;
  awaitingActorRole?: string;
  className?: string;
}

export function AdminStatusBadge({
  status,
  phase,
  awaitingActorRole,
  className,
}: AdminStatusBadgeProps) {
  const statusConfig = getStatusConfig(status);
  const phaseConfig = getPhaseConfig(phase);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Phase Indicator */}
      <div
        className={cn(
          "px-3 py-1 rounded-lg border text-[9px] font-black uppercase tracking-[0.2em] shadow-sm",
          phaseConfig.bgColor,
          phaseConfig.color,
        )}
      >
        {phaseConfig.label}
      </div>

      {/* Action State Indicator */}
      <div
        className={cn(
          "px-3 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest bg-white/5 border-white/10 text-white/80",
        )}
      >
        {statusConfig.label}
      </div>

      {/* Actor Indicator */}
      {awaitingActorRole && (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary/5 border border-primary/10">
          {awaitingActorRole === "admin" ? (
            <ShieldCheck className="h-3 w-3 text-primary/60" />
          ) : (
            <User className="h-3 w-3 text-white/40" />
          )}
          <span className="text-[9px] font-black uppercase tracking-tighter text-white/60">
            {awaitingActorRole} NEEDED
          </span>
        </div>
      )}
    </div>
  );
}
