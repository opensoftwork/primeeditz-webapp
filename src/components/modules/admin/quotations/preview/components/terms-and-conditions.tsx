"use client";

import { ShieldCheck } from "lucide-react";
import React from "react";

interface TermsAndConditionsProps {
  terms?: string;
}

export function TermsAndConditions({ terms }: TermsAndConditionsProps) {
  if (!terms) return null;

  return (
    <div className="pt-10 break-inside-avoid page-break-inside-avoid relative block overflow-visible">
      <div className="flex items-center gap-3 mb-5">
        <ShieldCheck className="w-4 h-4 text-slate-900" />
        <div className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">
          Terms & Conditions
        </div>
        <div className="flex-1 h-px bg-slate-100" />
      </div>
      <div className="text-[10px] text-slate-500 leading-relaxed whitespace-pre-wrap text-justify columns-2 gap-10">
        {terms}
      </div>
    </div>
  );
}
