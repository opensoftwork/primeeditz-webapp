"use client";

import { cn } from "@/lib/utils";

interface PricingSummaryProps {
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  formatCurrency: (amount: number) => string;
}

export function PricingSummary({
  subtotal,
  taxAmount,
  discountAmount,
  total,
  formatCurrency,
}: PricingSummaryProps) {
  return (
    <div className="rounded-[2.5rem] bg-white/4 border border-white/10 p-8 space-y-6 shadow-2xl relative overflow-hidden group">
      {/* Visual Accent */}
      <div className="absolute top-0 right-0 h-48 w-48 bg-primary/5 blur-[80px] -mr-24 -mt-24 rounded-full group-hover:bg-primary/10 transition-colors" />

      <div className="space-y-4">
        <div className="flex justify-between items-center text-xs font-bold text-white/40 uppercase tracking-widest px-1">
          <span>Subtotal</span>
          <span className="tabular-nums">{formatCurrency(subtotal)}</span>
        </div>

        {discountAmount > 0 && (
          <div className="flex justify-between items-center text-xs font-bold text-emerald-400 uppercase tracking-widest px-1">
            <span>Discount Applied</span>
            <span className="tabular-nums">
              - {formatCurrency(discountAmount)}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white/40 uppercase tracking-widest">
              Tax (GST)
            </span>
            <span className="text-[8px] px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/40 font-black">
              18%
            </span>
          </div>
          <span className="text-xs font-bold text-white/40 tabular-nums">
            {formatCurrency(taxAmount)}
          </span>
        </div>
      </div>

      <div className="h-px bg-white/5" />

      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">
              Grand Total
            </span>
            <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">
              Inclusive of all taxes
            </span>
          </div>
          <div className="text-4xl font-black text-white tracking-tighter tabular-nums leading-none">
            {formatCurrency(total)}
          </div>
        </div>
      </div>
    </div>
  );
}
