"use client";

import { format } from "date-fns";
import { Calendar, Film, Mail, MapPin, Phone } from "lucide-react";
import React from "react";
import type { CompanyInfo, QuotationData } from "../../types";

interface DocumentHeaderProps {
  company: CompanyInfo;
  quotation: QuotationData;
}

export function DocumentHeader({ company, quotation }: DocumentHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start gap-8">
      <div className="space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-950 rounded-xl flex items-center justify-center shadow-lg">
            <Film className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="font-black tracking-[0.2em] text-xl text-slate-900 uppercase">
              {company.name}
            </div>
            <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
              {company.tagline}
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-2.5 text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-[11px] font-medium">{company.address}</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-500">
            <Phone className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-[11px] font-medium">{company.phone}</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-500">
            <Mail className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-[11px] font-medium">{company.email}</span>
          </div>
        </div>
      </div>

      <div className="text-right space-y-5 md:min-w-[220px]">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter text-slate-950 mb-2 opacity-10 leading-none">
            PROPOSAL
          </h1>
          <div className="bg-slate-50 inline-block px-4 py-2.5 rounded-lg border border-slate-100">
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
              Reference No.
            </div>
            <div className="text-sm font-black text-slate-900">
              #{quotation.code}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Date: {format(quotation._creationTime, "dd MMMM yyyy")}</span>
          </div>
          {quotation.validUntil && (
            <div className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/50">
              Valid Until: {format(quotation.validUntil, "dd MMM yyyy")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
