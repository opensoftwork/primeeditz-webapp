"use client";

import { ArrowLeft, Briefcase } from "lucide-react";
import Link from "next/link";
import { getStatusConfig } from "@/lib/status-display";
import { StatusBadge } from "./shared";
import { Button } from "@/components/ui/button";

interface ProjectHeaderProps {
  code: string;
  endClientName?: string;
  status: string;
}

export function ProjectHeader({
  code,
  endClientName,
  status,
}: ProjectHeaderProps) {
  const title = endClientName || "Untitled Project";
  const statusInfo = getStatusConfig(status);

  return (
    <div className="flex flex-col gap-8">
      {/* Navigation & Core Identification Row */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            asChild
            className="h-9 w-9 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 border-white/10 shrink-0"
          >
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-125 group-hover:bg-primary/30 transition-all opacity-50" />
              <div className="relative w-12 h-12 rounded-xl bg-linear-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center group-hover:border-primary/40 transition-all shadow-xl shadow-primary/10">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
            </div>

            <div className="space-y-0">
              <div className="flex items-center gap-2">
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-primary/60">
                  Project Detail • ID: {code}
                </span>
              </div>
              <h1 className="text-2xl font-black uppercase tracking-tighter text-white leading-none">
                {title}
              </h1>
              <h4 className="text-[11px] font-black text-white/30 uppercase tracking-tight">
                Production Queue Status •{" "}
                <span className="text-primary/80">{statusInfo.label}</span>
              </h4>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={status} />
        </div>
      </div>
    </div>
  );
}
