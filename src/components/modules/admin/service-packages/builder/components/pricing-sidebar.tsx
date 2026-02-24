"use client";

import { Calculator, ReceiptIndianRupee } from "lucide-react";
import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import { LineItem, ProjectConfig } from "../builder-context";
interface PricingSidebarProps {
  lineItems: LineItem[];
  projectConfigs: ProjectConfig[];
  applyGST: boolean;
  gstPercentage: number;
  onToggleGST: (checked: boolean) => void;
  onUpdateGSTPercentage: (value: number) => void;
}

export function PricingSidebar({
  lineItems,
  projectConfigs,
  applyGST,
  gstPercentage,
  onToggleGST,
  onUpdateGSTPercentage,
}: PricingSidebarProps) {
  // Recursive total for a single item (3-level: item → sub → sub-sub)
  const calculateItemTotal = (item: LineItem): number => {
    const self = (item.rate || 0) * (item.quantity || 1);
    const subTotal = (item.subItems || []).reduce((sum, sub: any) => {
      const subSelf = (sub.rate || 0) * (sub.quantity || 1);
      const subSubTotal = (sub.subItems || []).reduce(
        (s: number, ss: any) => s + (ss.rate || 0) * (ss.quantity || 1),
        0,
      );
      return sum + subSelf + subSubTotal;
    }, 0);
    return self + subTotal;
  };

  const groupedTotals = useMemo(() => {
    const totals: Record<string, { label: string; subtotal: number }> = {};

    lineItems.forEach((item) => {
      const configId = item.projectConfigId || "__general__";
      if (!totals[configId]) {
        const config = projectConfigs.find((c) => c.id === configId);
        totals[configId] = {
          label: config?.label || "General / Shared",
          subtotal: 0,
        };
      }
      totals[configId].subtotal += calculateItemTotal(item);
    });

    return Object.entries(totals).map(([id, data]) => ({
      id,
      ...data,
    }));
  }, [lineItems, projectConfigs]);

  const subtotal = useMemo(() => {
    return lineItems.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  }, [lineItems]);

  const gstAmount = applyGST ? Math.round(subtotal * (gstPercentage / 100)) : 0;
  const total = subtotal + gstAmount;

  return (
    <div className="sticky top-8 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2.5 ml-1">
        <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20 shadow-[0_0_20px_rgba(var(--primary),0.1)]">
          <Calculator className="h-3.5 w-3.5 text-primary" />
        </div>
        <div className="flex flex-col">
          <h3 className="text-[10px] font-black text-white uppercase tracking-widest">
            Live Pricing Summary
          </h3>
          <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">
            Real-time cost updates
          </p>
        </div>
      </div>

      {/* Breakdown Card */}
      <Card className="bg-zinc-900/30 border-white/5 rounded-[24px] p-5 space-y-4 backdrop-blur-xl shadow-2xl shadow-black/40 group overflow-hidden relative">
        <div className="absolute inset-0 bg-grid-white/[0.01] pointer-events-none" />

        {/* Project Breakdown */}
        <div className="space-y-2.5 relative">
          {groupedTotals.length === 0 ? (
            <p className="text-[9px] font-black text-white/10 uppercase tracking-[0.2em] text-center py-2">
              Add items to see breakdown
            </p>
          ) : (
            groupedTotals.map((group) => (
              <div
                key={group.id}
                className="flex justify-between items-center group/item transition-all"
              >
                <span className="text-[10px] font-bold text-white/40 group-hover/item:text-white/60 transition-colors">
                  {group.label}
                </span>
                <span className="text-xs font-black text-white italic tabular-nums">
                  ₹{group.subtotal.toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>

        <Separator className="bg-white/5" />

        {/* Subtotal */}
        <div className="flex justify-between items-center relative">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">
              Subtotal
            </span>
            <p className="text-[8px] font-bold text-white/10 uppercase tracking-widest">
              Before Taxes
            </p>
          </div>
          <span className="text-sm font-black text-white italic tabular-nums">
            ₹{subtotal.toLocaleString()}
          </span>
        </div>

        {/* GST Toggle - Using Field with horizontal orientation */}
        <div className="px-4 py-3 bg-black/40 rounded-[20px] border border-white/5 relative group/gst hover:border-primary/20 transition-all shadow-inner space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Switch
                checked={applyGST}
                onCheckedChange={onToggleGST}
                id="gst-toggle"
                className="data-[state=checked]:bg-primary"
              />
              <div className="flex flex-col">
                <Label
                  htmlFor="gst-toggle"
                  className="cursor-pointer text-[10px] font-black uppercase tracking-widest text-white/60 group-hover/gst:text-white transition-colors"
                >
                  Apply GST
                </Label>
                {applyGST ? (
                  <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-2 py-1 mt-1 animate-in fade-in slide-in-from-top-1 duration-200 w-fit group-hover/gst:border-primary/30 transition-colors">
                    <input
                      type="number"
                      value={gstPercentage}
                      onChange={(e) => {
                        const val = e.target.value;
                        const cleanValue = val.replace(/^0+(?=\d)/, "");
                        onUpdateGSTPercentage(
                          cleanValue === "" ? ("" as any) : Number(cleanValue),
                        );
                      }}
                      onFocus={(e) => (e.target as HTMLInputElement).select()}
                      className="bg-transparent border-none p-0 w-6 text-[10px] font-black text-primary focus:ring-0 outline-none text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />

                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">
                      %
                    </span>
                  </div>
                ) : (
                  <p className="text-[8px] font-bold text-white/10 uppercase tracking-widest mt-0.5">
                    Not Applied
                  </p>
                )}
              </div>
            </div>
            <span className="text-[10px] font-black text-primary tabular-nums italic">
              {applyGST ? `+₹${gstAmount.toLocaleString()}` : "—"}
            </span>
          </div>

          {applyGST && (
            <div className="pt-2 border-t border-white/5 flex items-center justify-between">
              <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">
                Tax Component
              </span>
              <span className="text-[9px] font-black text-white/40 tabular-nums lowercase italic">
                incl. ₹{gstAmount.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        <Separator className="bg-white/5" />

        {/* Total */}
        <div className="relative">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ReceiptIndianRupee className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">
                Package Total
              </span>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1.5 justify-end">
                <span className="text-[10px] font-black text-white/20">₹</span>
                <span className="text-2xl font-black text-primary italic tracking-tighter tabular-nums drop-shadow-[0_0_15px_rgba(var(--primary),0.3)]">
                  {total.toLocaleString()}
                </span>
              </div>
              <p className="text-[8px] font-bold text-white/20 uppercase tracking-[0.2em] mt-1 pr-1">
                Final project cost
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Visual Hint */}
      <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/10 flex items-start gap-2.5">
        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-0.5 shadow-[0_0_10px_rgba(var(--primary),1)]" />
        <p className="text-[8px] font-bold text-white/40 leading-relaxed uppercase tracking-wider">
          This pricing is a template. Final costs can be adjusted per project in
          the studio pipeline.
        </p>
      </div>
    </div>
  );
}
