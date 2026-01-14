"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { FileText, Tag, Receipt, Info } from "lucide-react";
import { Template, TemplateLineItem } from "../quotation-sections/types";
import { cn } from "@/lib/utils";

interface TemplateViewDrawerProps {
  template: (Template & { projectTypeName: string | null }) | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function TemplateViewDrawer({
  template,
  open,
  onOpenChange,
}: TemplateViewDrawerProps) {
  if (!template) return null;

  const subtotal = template.lineItems.reduce((acc, item) => {
    const itemTotal = item.unitPrice * item.defaultQuantity;
    const subItemsTotal =
      item.subItems?.reduce(
        (s, sub) => s + sub.unitPrice * sub.defaultQuantity,
        0
      ) ?? 0;
    return acc + itemTotal + subItemsTotal;
  }, 0);

  const gst = subtotal * 0.18;
  const total = subtotal + gst;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-3xl bg-zinc-950 border-white/5 p-0 overflow-y-auto">
        <SheetHeader className="p-8 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-primary">
                Template Details
              </span>
              <div
                className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                  template.isActive
                    ? "bg-green-500/10 text-green-500 border border-green-500/20"
                    : "bg-white/5 text-white/40 border border-white/10"
                )}
              >
                {template.isActive ? "Active" : "Draft"}
              </div>
            </div>
          </div>
          <SheetTitle className="text-3xl font-black text-white uppercase tracking-tighter">
            {template.name}
          </SheetTitle>
          {template.description && (
            <p className="text-white/50 text-sm font-medium leading-relaxed mt-2">
              {template.description}
            </p>
          )}
        </SheetHeader>

        <div className="p-8 space-y-8">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white/3 border border-white/5 space-y-1">
              <span className="text-xs font-bold text-white/40">
                Project Category
              </span>
              <p className="text-sm font-semibold text-white">
                {template.projectTypeName || "General"}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white/3 border border-white/5 space-y-1">
              <span className="text-xs font-bold text-white/40">
                Items Count
              </span>
              <p className="text-sm font-semibold text-white">
                {template.lineItems.length} Items included
              </p>
            </div>
          </div>

          {/* Guidelines */}
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/2 border border-white/5">
            <Info className="h-4 w-4 text-primary shrink-0" />
            <p className="text-xs font-medium text-white/40 leading-relaxed">
              Calculations are based on standard base rates. Final quantities
              will be adjusted during quotation creation.
            </p>
          </div>

          {/* Line Items Framework */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <Tag className="h-3.5 w-3.5 text-white/40" />
              <h4 className="text-xs font-bold text-white/50">
                Line Items Breakdown
              </h4>
            </div>

            <div className="space-y-4">
              {template.lineItems.map((item, idx) => {
                const itemTotal = item.unitPrice * item.defaultQuantity;
                return (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-white/2 border border-white/5 space-y-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h5 className="text-sm font-bold text-white tracking-tight leading-snug">
                          {item.description}
                        </h5>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[10px] font-bold uppercase text-white/40 bg-white/5 px-2 py-0.5 rounded">
                            {item.unit}
                          </span>
                          <span className="text-xs font-medium text-white/40">
                            {item.defaultQuantity} {item.unit} @{" "}
                            {formatCurrency(item.unitPrice)}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm font-black text-white tracking-tight">
                        {formatCurrency(itemTotal)}
                      </span>
                    </div>

                    {/* Sub Items */}
                    {item.subItems && item.subItems.length > 0 && (
                      <div className="pl-4 border-l border-white/10 space-y-3 pt-1">
                        {item.subItems.map((sub, sIdx) => (
                          <div
                            key={sIdx}
                            className="flex items-center justify-between text-xs"
                          >
                            <span className="text-white/40 font-medium">
                              {sub.description}
                            </span>
                            <span className="text-white/60 font-semibold">
                              {formatCurrency(
                                sub.unitPrice * sub.defaultQuantity
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Financial Summary */}
          <div className="p-8 rounded-3xl bg-zinc-900 border border-primary/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:opacity-[0.05] transition-opacity">
              <Receipt className="h-32 w-32 rotate-12 text-primary" />
            </div>

            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white/40 uppercase tracking-widest">
                  Subtotal
                </span>
                <span className="text-lg font-bold text-white tracking-tight">
                  {formatCurrency(subtotal)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-white/40 uppercase tracking-widest">
                    GST
                  </span>
                  <span className="text-[10px] font-bold bg-white/5 px-1.5 py-0.5 rounded text-white/40">
                    18%
                  </span>
                </div>
                <span className="text-lg font-bold text-white/40">
                  {formatCurrency(gst)}
                </span>
              </div>

              <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-primary uppercase tracking-widest">
                    Estimated Total
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-4xl font-black text-primary tracking-tighter">
                    {formatCurrency(total)}
                  </span>
                  <div className="h-1 w-12 bg-primary/20 rounded-full mt-1 blur-sm" />
                </div>
              </div>
            </div>
          </div>

          {/* Terms */}
          {template.terms && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <Info className="h-4 w-4 text-white/40" />
                <h4 className="text-xs font-bold text-white/50">
                  Terms & Conditions
                </h4>
              </div>
              <div className="p-6 rounded-2xl bg-white/2 border border-white/5">
                <p className="text-sm text-white/60 font-medium leading-relaxed whitespace-pre-wrap">
                  {template.terms}
                </p>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
