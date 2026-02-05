"use client";

import { BadgeAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface TotalsCardProps {
  total: number;
  subtotal: number;
  gstAmount: number;
}

export function TotalsCard({ total, subtotal, gstAmount }: TotalsCardProps) {
  return (
    <Card className="bg-zinc-900/40 border-white/5 rounded-[32px] overflow-hidden glass-subtle shadow-2xl shadow-black/20">
      <div className="p-0">
        <div className="px-8 py-6 border-b border-white/5 bg-white/5 space-y-1">
          <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">
            Total Package Value
          </p>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-black text-white tracking-tighter italic">
              ₹{total.toLocaleString()}
            </span>
            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-2">
              / Start
            </p>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-60">
              <span>Base Subtotal</span>
              <span>₹{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
              <div className="flex items-center gap-1.5">
                <div className="h-1 w-1 rounded-full bg-white/40" />
                <span className="opacity-40">GST Component (18%)</span>
              </div>
              <span className="text-white">₹{gstAmount.toLocaleString()}</span>
            </div>
          </div>

          <Separator className="bg-white/5" />

          <div className="flex items-start gap-3 px-4 py-3 bg-white/5 rounded-2xl border border-white/5">
            <BadgeAlert className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <p className="text-[9px] font-bold text-white/40 uppercase tracking-wide leading-relaxed">
              Proceeding will create a template used for studio quotations.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
