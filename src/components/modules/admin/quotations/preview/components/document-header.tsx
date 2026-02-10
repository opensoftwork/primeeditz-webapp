"use client";

import { format } from "date-fns";
import { Calendar, Film, Mail, MapPin, Phone, ImageIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import type { CompanyInfo, QuotationData } from "../../types";
import { useAction } from "convex/react";
import { api } from "@convex/_generated/api";
import Image from "next/image";

interface DocumentHeaderProps {
  company: CompanyInfo;
  quotation: QuotationData;
}

export function DocumentHeader({ company, quotation }: DocumentHeaderProps) {
  const [resolvedLogoUrl, setResolvedLogoUrl] = useState<string | null>(null);
  const getSignedUrl = useAction(
    api.functions.storage.actions.getSignedFileUrl,
  );

  useEffect(() => {
    const fetchLogo = async () => {
      if (
        company.logoUrl &&
        (company.logoUrl.startsWith("system/") || company.logoUrl.includes("/"))
      ) {
        try {
          const url = await getSignedUrl({ storageKey: company.logoUrl });
          setResolvedLogoUrl(url);
        } catch (error) {
          console.error("Failed to fetch logo URL for document:", error);
          setResolvedLogoUrl(null);
        }
      } else {
        setResolvedLogoUrl(company.logoUrl || null);
      }
    };
    fetchLogo();
  }, [company.logoUrl, getSignedUrl]);

  return (
    <div className="flex flex-col md:flex-row justify-between items-start gap-8">
      <div className="space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden relative border border-slate-900">
            {resolvedLogoUrl ? (
              <Image
                src={resolvedLogoUrl}
                alt={company.name}
                fill
                className="object-contain p-2"
                unoptimized
              />
            ) : (
              <Film className="w-8 h-8 text-white/20" />
            )}
          </div>
          <div>
            <div className="font-black tracking-widest text-2xl text-slate-900 uppercase leading-none">
              {company.name}
            </div>
            {company.tagline && (
              <div className="text-[10px] font-black tracking-widest text-slate-400 uppercase mt-1.5 opacity-60">
                {company.tagline}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2 pt-1 ml-1">
          {company.address && (
            <div className="flex items-center gap-2.5 text-slate-500">
              <MapPin className="w-3 h-3 text-slate-300" />
              <span className="text-[10px] font-black uppercase tracking-wider">
                {company.address}
              </span>
            </div>
          )}
          <div className="flex gap-5">
            {company.phone && (
              <div className="flex items-center gap-2.5 text-slate-500">
                <Phone className="w-3 h-3 text-slate-300" />
                <span className="text-[10px] font-black uppercase tracking-wider">
                  {company.phone}
                </span>
              </div>
            )}
            {company.email && (
              <div className="flex items-center gap-2.5 text-slate-500">
                <Mail className="w-3 h-3 text-slate-300" />
                <span className="text-[10px] font-black uppercase tracking-wider">
                  {company.email}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="text-right space-y-6 md:min-w-[220px]">
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tighter text-slate-950 opacity-[0.03] leading-none -mb-6">
            PROPOSAL
          </h1>
          <div className="bg-slate-50 inline-block px-5 py-3 rounded-xl border border-slate-100 shadow-sm relative z-10">
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 opacity-60">
              QUOTATION CODE
            </div>
            <div className="text-base font-black text-slate-900 tracking-tight">
              {quotation.code}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <Calendar className="w-3 h-3 opacity-40" />
            <span>
              ISSUED: {format(quotation._creationTime, "MMM dd, yyyy")}
            </span>
          </div>
          {quotation.validUntil && (
            <div className="text-[9px] font-black uppercase tracking-widest text-amber-600 bg-amber-50/50 px-2 py-0.5 rounded-lg border border-amber-200/30">
              EXPIRY: {format(quotation.validUntil, "MMM dd, yyyy")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
