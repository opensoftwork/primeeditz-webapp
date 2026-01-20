"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ============================================================================
// Shared Project Detail Components
// ============================================================================

export function DetailSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary">
          {icon}
        </div>
        <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white/60">
          {title}
        </h3>
      </div>
      <div className="p-10 md:p-14 rounded-[2.5rem] bg-white/3 border border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.005] bg-size-[40px_40px]" />
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
}

export function DetailItem({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="space-y-2 group">
      <div className="flex items-center gap-2">
        {icon && <span className="text-primary/40 scale-75">{icon}</span>}
        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/90">
          {label}
        </span>
      </div>
      <p className="text-[14px] font-black uppercase tracking-tight text-white group-hover:text-primary transition-colors">
        {value}
      </p>
    </div>
  );
}

export function SidebarItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-1 group">
      <div className="flex items-center gap-2.5">
        <div className="text-white/20 p-1 rounded bg-white/5 group-hover:text-primary group-hover:bg-primary/10 transition-all">
          {icon}
        </div>
        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/80">
          {label}
        </span>
      </div>
      <span className="text-[10px] font-black text-white/80 uppercase tracking-tighter">
        {value}
      </span>
    </div>
  );
}

import { getStatusConfig, getPhaseConfig } from "@/lib/status-display";

export function StatusBadge({
  status,
  phase,
  showPhase = false,
}: {
  status: string;
  phase?: string;
  showPhase?: boolean;
}) {
  const config = getStatusConfig(status);
  const phaseConfig = phase ? getPhaseConfig(phase) : null;

  return (
    <div className="flex items-center gap-2">
      {showPhase && phaseConfig && (
        <Badge
          variant="outline"
          className={cn(
            "uppercase text-[9px] tracking-[0.2em] font-black py-1 px-4 rounded-lg border-2 shadow-[0_5px_15px_rgba(0,0,0,0.2)]",
            phaseConfig.bgColor,
            phaseConfig.color,
          )}
        >
          {phaseConfig.label}
        </Badge>
      )}
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
