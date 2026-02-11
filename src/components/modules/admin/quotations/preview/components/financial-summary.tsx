"use client";

import React from "react";
import { amountInWords } from "../utils/number-to-words";

interface FinancialSummaryProps {
  subtotal: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  grandTotal: number;
  formatCurrency: (amount: number) => string;
}

export function FinancialSummary({
  subtotal,
  discountAmount,
  taxRate,
  taxAmount,
  grandTotal,
  formatCurrency,
}: FinancialSummaryProps) {
  return (
    <div className="break-inside-avoid page-break-inside-avoid relative block overflow-visible">
      <div className="flex flex-col md:flex-row justify-end pt-6 gap-10">
        <div className="w-full max-w-[320px] space-y-3">
          <div className="flex justify-between items-center px-4">
            <span className="text-slate-400 font-bold uppercase tracking-[0.15em] text-[10px]">
              Subtotal
            </span>
            <span className="font-bold text-slate-700">
              {formatCurrency(subtotal)}
            </span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between items-center px-4">
              <span className="text-slate-400 font-bold uppercase tracking-[0.15em] text-[10px]">
                Discount
              </span>
              <span className="font-bold text-emerald-600">
                - {formatCurrency(discountAmount)}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center px-4">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-bold uppercase tracking-[0.15em] text-[10px]">
                Tax
              </span>
              <span className="text-[8px] py-0.5 px-1.5 border border-slate-200 text-slate-500 bg-slate-50 font-bold rounded">
                GST {(taxRate * 100).toFixed(0)}%
              </span>
            </div>
            <span className="font-bold text-slate-700">
              {formatCurrency(taxAmount)}
            </span>
          </div>

          <div className="bg-slate-950 p-5 rounded-xl shadow-xl">
            <div className="flex justify-between items-end">
              <div className="space-y-0.5">
                <div className="text-white/40 font-black uppercase tracking-[0.2em] text-[9px]">
                  Grand Total
                </div>
                <div className="text-white/30 text-[8px] font-bold italic">
                  Inclusive of all taxes
                </div>
              </div>
              <div className="text-2xl font-black text-white tracking-tighter tabular-nums">
                {formatCurrency(grandTotal)}
              </div>
            </div>
          </div>

          <div className="px-4 py-2">
            <div className="text-[9px] text-right text-slate-400 font-black uppercase tracking-widest leading-relaxed">
              <span className="text-slate-300 block mb-0.5 tracking-normal lowercase italic font-normal">
                Amount in words:
              </span>
              {amountInWords(grandTotal)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
