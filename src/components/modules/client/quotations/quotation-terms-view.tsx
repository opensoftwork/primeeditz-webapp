"use client";

import { ShieldCheck, Info } from "lucide-react";

interface QuotationTermsViewProps {
  terms?: string;
}

export function QuotationTermsView({ terms }: QuotationTermsViewProps) {
  if (!terms) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center">
          <ShieldCheck className="h-5 w-5 text-white/40" />
        </div>
        <div className="flex flex-col">
          <h3 className="text-sm font-black text-white uppercase tracking-widest">
            Terms & Conditions
          </h3>
          <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">
            Service agreement details
          </p>
        </div>
      </div>

      <div className="rounded-[2rem] border border-white/5 bg-white/2 p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-100 transition-opacity">
          <Info className="h-32 w-32 rotate-12" />
        </div>

        <div className="relative z-10 text-xs text-white/60 leading-relaxed whitespace-pre-wrap columns-1 md:columns-2 gap-12 text-justify font-medium">
          {terms}
        </div>
      </div>
    </div>
  );
}
