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
      className="p-5 rounded-2xl bg-white/2 border border-white/5 sticky top-6"
    >
      <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-5">
        Pricing Summary
      </h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/50 font-medium">Subtotal</span>
          <span className="text-sm font-bold text-white">
            {formatCurrency(subtotal)}
          </span>
        </div>

        {discountAmount > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/50 font-medium">Discount</span>
            <span className="text-sm font-bold text-green-400">
              - {formatCurrency(discountAmount)}
            </span>
          </div>
        )}

        {taxRate > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/50 font-medium">
              GST ({(taxRate * 100).toFixed(0)}%)
            </span>
            <span className="text-sm font-bold text-white">
              {formatCurrency(taxAmount)}
            </span>
          </div>
        )}

        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
          <span className="text-sm font-black uppercase tracking-wider text-white/60">
            Grand Total
          </span>
          <span className="text-2xl font-black text-primary">
            {formatCurrency(grandTotal)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
