"use client";

import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { StatusBadge } from "./shared";

import { getStatusConfig } from "@/lib/status-display";

interface ProjectHeaderProps {
  code: string;
  eventName?: string;
  endClientName?: string;
  status: string;
}

export function ProjectHeader({
  code,
  eventName,
  endClientName,
  status,
}: ProjectHeaderProps) {
  const title = eventName || endClientName || "Untitled Project";
  const statusInfo = getStatusConfig(status);

  return (
    <div className="space-y-10">
      {/* Breadcrumb & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
          <Link
            href="/dashboard"
            className="hover:text-primary transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="h-3 w-3" />
            Dashboard
          </Link>
          <ChevronRight className="h-3 w-3 opacity-20" />
          <span className="text-white/60">Projects</span>
          <ChevronRight className="h-3 w-3 opacity-20" />
          <span className="text-primary truncate max-w-[200px]">{title}</span>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={status} />
          <div className="h-8 w-px bg-white/10 mx-2 hidden md:block" />
          <span className="font-mono text-[10px] font-black text-white/30 bg-white/2 px-3 py-1.5 rounded-lg border border-white/5">
            ID: {code}
          </span>
        </div>
      </div>

      {/* Hero Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-0.5 w-10 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary),0.6)]" />
          <span className="text-[11px] font-black uppercase tracking-[0.4em] text-primary">
            Project Overview
          </span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-white leading-[0.9] max-w-4xl">
          {title}
        </h1>
        <p className="text-[11px] font-bold text-white/50 uppercase tracking-[0.4em]">
          Production Queue Status •{" "}
          <span className="text-primary/80">{statusInfo.label}</span>
        </p>
      </div>
    </div>
  );
}
