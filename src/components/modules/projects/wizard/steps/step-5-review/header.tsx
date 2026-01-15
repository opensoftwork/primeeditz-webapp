"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";

interface Step5HeaderProps {
  projectCode: string | null;
}

export function Step5Header({ projectCode }: Step5HeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-0.5 w-12 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">
          Review Information
        </span>
      </div>
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black uppercase tracking-tight text-white flex items-center gap-4">
          Project Review
          <Badge
            variant="outline"
            className="border-primary/20 text-primary uppercase text-[10px] tracking-widest font-black py-0.5"
          >
            Stage 05
          </Badge>
        </h2>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">
            Project ID
          </span>
          <span className="font-mono text-xl font-black tracking-tighter text-white/50">
            {projectCode}
          </span>
        </div>
      </div>
    </div>
  );
}
