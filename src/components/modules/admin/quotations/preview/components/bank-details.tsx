"use client";

import React from "react";
import type { CompanyInfo } from "../../types";

interface BankDetailsProps {
  company: CompanyInfo;
}

export function BankDetails({ company }: BankDetailsProps) {
  const hasBank = !!(
    company.bankDetails?.accountNumber?.trim() &&
    company.bankDetails?.bankName?.trim()
  );
  const hasTax = !!(company.gstNumber?.trim() || company.panNumber?.trim());

  if (!hasBank && !hasTax) return null;

  return (
    <div className="pt-10 grid grid-cols-2 gap-10 break-inside-avoid page-break-inside-avoid border-t border-slate-100">
      {/* Payment Information */}
      <div className="space-y-4">
        <div className="text-[10px] font-black text-slate-900 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded inline-block border border-slate-100">
          Payment Information
        </div>

        {hasBank ? (
          <div className="space-y-2 pl-1">
            <div className="grid grid-cols-[80px_1fr] gap-2 items-baseline">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Bank
              </span>
              <span className="text-[11px] font-black text-slate-800 uppercase leading-none">
                {company.bankDetails?.bankName}
              </span>
            </div>
            <div className="grid grid-cols-[80px_1fr] gap-2 items-baseline">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                A/C Name
              </span>
              <span className="text-[11px] font-black text-slate-800 uppercase leading-none">
                {company.bankDetails?.accountHolder}
              </span>
            </div>
            <div className="grid grid-cols-[80px_1fr] gap-2 items-baseline">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                A/C No
              </span>
              <span className="text-[11px] font-black text-slate-900 tracking-wider leading-none">
                {company.bankDetails?.accountNumber}
              </span>
            </div>
            <div className="grid grid-cols-[80px_1fr] gap-2 items-baseline">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                IFSC
              </span>
              <span className="text-[11px] font-black text-slate-900 tracking-widest leading-none">
                {company.bankDetails?.ifscCode}
              </span>
            </div>
            {company.bankDetails?.branch && (
              <div className="grid grid-cols-[80px_1fr] gap-2 items-baseline">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Branch
                </span>
                <span className="text-[11px] font-black text-slate-800 uppercase leading-none">
                  {company.bankDetails.branch}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-[10px] text-slate-400 italic">
            No bank details provided.
          </div>
        )}
      </div>

      {/* Tax Information */}
      <div className="space-y-4">
        <div className="text-[10px] font-black text-slate-900 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded inline-block border border-slate-100">
          Tax Information
        </div>
        <div className="space-y-2 pl-1">
          {company.gstNumber && (
            <div className="grid grid-cols-[80px_1fr] gap-2 items-baseline">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                GSTIN
              </span>
              <span className="text-[11px] font-black text-slate-900 tracking-wider leading-none uppercase">
                {company.gstNumber}
              </span>
            </div>
          )}
          {company.panNumber && (
            <div className="grid grid-cols-[80px_1fr] gap-2 items-baseline">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                PAN
              </span>
              <span className="text-[11px] font-black text-slate-900 tracking-wider leading-none uppercase">
                {company.panNumber}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
