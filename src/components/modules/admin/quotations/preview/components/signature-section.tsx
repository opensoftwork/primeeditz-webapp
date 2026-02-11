"use client";

import React from "react";

interface SignatureSectionProps {
  companyName: string;
}

export function SignatureSection({ companyName }: SignatureSectionProps) {
  return (
    <div className="pt-14 grid grid-cols-2 gap-24 break-inside-avoid page-break-inside-avoid">
      <div className="space-y-5">
        <div className="h-0.5 bg-slate-100 w-full" />
        <div className="space-y-1">
          <div className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
            Client Acceptance
          </div>
          <div className="text-[9px] text-slate-400 font-medium tracking-tight">
            Acknowledgement of scope & pricing
          </div>
        </div>
      </div>
      <div className="text-right space-y-5">
        <div className="h-0.5 bg-slate-950 w-full" />
        <div className="space-y-1">
          <div className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
            Authorized Signature
          </div>
          <div className="text-[9px] text-slate-400 font-bold uppercase italic">
            For {companyName}
          </div>
        </div>
      </div>
    </div>
  );
}
