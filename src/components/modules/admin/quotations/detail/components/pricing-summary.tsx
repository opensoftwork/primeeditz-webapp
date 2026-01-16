"use client";

import { motion } from "motion/react";

interface PricingSummaryProps {
  subtotal: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  grandTotal: number;
  formatCurrency: (amount: number) => string;
}

export function PricingSummary({
  subtotal,
  discountAmount,
  taxRate,
  taxAmount,
  grandTotal,
  formatCurrency,
}: PricingSummaryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="p-6 rounded-2xl bg-white/2 border border-white/5 sticky top-6 shadow-xl"
    >
      <h3 className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-6 flex items-center gap-2">
        <div className="h-1 w-1 rounded-full bg-primary" />
        Financial Architecture
      </h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">
            Aggregate Subtotal
          </span>
          <span className="text-sm font-bold text-white/80">
            {formatCurrency(subtotal)}
          </span>
        </div>

        {discountAmount > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">
              Tactical Discount
            </span>
            <span className="text-sm font-bold text-emerald-400">
              - {formatCurrency(discountAmount)}
            </span>
          </div>
        )}

        {taxRate > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">
              Statutory GST ({(taxRate * 100).toFixed(0)}%)
            </span>
            <span className="text-sm font-bold text-white/80">
              {formatCurrency(taxAmount)}
            </span>
          </div>
        )}

        <div className="pt-5 mt-2 border-t border-white/5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
              Final Valuation
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-white tracking-tighter">
              {formatCurrency(grandTotal)}
            </span>
            <div className="h-6 px-2 rounded bg-primary/10 border border-primary/20 flex items-center justify-center">
              <span className="text-[8px] font-black text-primary uppercase tracking-widest">
                INR
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
