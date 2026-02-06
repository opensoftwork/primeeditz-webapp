"use client";

import React from "react";
import type { QuotationData } from "../../types";

interface ClientInfoProps {
  studioName?: string;
  projectName?: string;
  quotation: QuotationData;
}

export function ClientInfo({
  studioName,
  projectName,
  quotation,
}: ClientInfoProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-slate-50/50 p-7 rounded-xl border border-slate-100">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-4 bg-slate-950 rounded-full" />
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Client
          </div>
        </div>
        <div className="pl-4">
          <div className="font-black text-lg text-slate-900">
            {studioName || quotation.studioId || "—"}
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Post-Production Engagement
          </div>
        </div>
      </div>

      <div className="space-y-3 border-l border-slate-200 pl-10">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-4 bg-slate-950 rounded-full" />
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Project
          </div>
        </div>
        <div className="pl-4">
          <div className="font-bold text-sm text-slate-800 italic leading-relaxed">
            {projectName || "Creative Production Services"}
          </div>
        </div>
      </div>
    </div>
  );
}
