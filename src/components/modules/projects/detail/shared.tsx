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
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">
          {title}
        </h3>
      </div>
      <div className="p-8 md:p-10 rounded-[2.5rem] bg-white/3 border border-white/5 relative overflow-hidden">
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
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">
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
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
          {label}
        </span>
      </div>
      <span className="text-[10px] font-black text-white/80 uppercase tracking-tighter">
        {value}
      </span>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    pending_review: {
      label: "Pending",
      className:
        "border-amber-500/40 text-amber-500 bg-amber-500/10 shadow-[0_5px_15px_rgba(245,158,11,0.1)]",
    },
    active: {
      label: "Active",
      className:
        "border-blue-500/40 text-blue-500 bg-blue-500/10 shadow-[0_5px_15px_rgba(59,130,246,0.1)]",
    },
    in_progress: {
      label: "In Progress",
      className:
        "border-purple-500/40 text-purple-500 bg-purple-500/10 shadow-[0_5px_15px_rgba(168,85,247,0.1)]",
    },
    completed: {
      label: "Completed",
      className:
        "border-emerald-500/40 text-emerald-500 bg-emerald-500/10 shadow-[0_5px_15px_rgba(16,185,129,0.1)]",
    },
  };

  const config = statusConfig[status] ?? {
    label: (status || "Unknown").replace("_", " "),
    className: "border-white/20 text-white/70 bg-white/10",
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "uppercase text-[9px] tracking-[0.2em] font-black py-1 px-4 rounded-lg border-2 shadow-[0_5px_15px_rgba(0,0,0,0.2)]",
        config.className
      )}
    >
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            config.label === "Pending"
              ? "animate-pulse bg-amber-500"
              : "bg-current"
          )}
        />
        {config.label}
      </div>
    </Badge>
  );
}
