"use client";

import { Receipt, Info } from "lucide-react";
import type { TemplateLineItem } from "@/components/modules/admin/quotations/types";

// ============================================================================
// Component Props
// ============================================================================

interface PricePreviewProps {
  lineItems: TemplateLineItem[];
  gstRate?: number;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function PricePreview({ lineItems, gstRate = 18 }: PricePreviewProps) {
  const subtotal = lineItems.reduce((sum, item) => {
    const itemTotal = item.unitPrice * item.defaultQuantity;
    const subItemsTotal =
      item.subItems?.reduce(
        (s, sub) => s + sub.unitPrice * sub.defaultQuantity,
        0
      ) ?? 0;
    return sum + itemTotal + subItemsTotal;
  }, 0);

  const gstAmount = subtotal * (gstRate / 100);
  const total = subtotal + gstAmount;

  return (
    <div className="p-8 rounded-3xl bg-zinc-900 border border-white/5 shadow-2xl space-y-6 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
        <Receipt className="h-24 w-24 rotate-12" />
      </div>

      <div className="flex items-center gap-2 mb-2 relative z-10">
        <Receipt className="h-4 w-4 text-white/50" />
        <h4 className="text-xs font-bold text-white/50">Estimated Pricing</h4>
      </div>

      <div className="space-y-4 relative z-10">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white/50 uppercase tracking-widest">
            Subtotal
          </span>
          <span className="text-sm font-bold text-white">
            {formatCurrency(subtotal)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-white/50 uppercase tracking-widest">
              GST
            </span>
            <span className="text-[10px] font-bold bg-white/5 px-1.5 py-0.5 rounded text-white/40">
              {gstRate}%
            </span>
          </div>
          <span className="text-sm font-bold text-white/50">
            {formatCurrency(gstAmount)}
          </span>
        </div>

        <div className="pt-6 border-t border-white/10 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-primary uppercase tracking-widest">
              Estimated Total
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-3xl font-black text-primary tracking-tighter">
              {formatCurrency(total)}
            </span>
            <div className="h-1 w-12 bg-primary/20 rounded-full mt-1 blur-sm" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/10 relative z-10">
        <Info className="h-3 w-3 text-primary/60 shrink-0" />
        <p className="text-xs font-medium text-primary/60 leading-relaxed">
          Prices are indicative based on default template quantities.
        </p>
      </div>
    </div>
  );
}
