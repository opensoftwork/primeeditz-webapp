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
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                Template Definition
              </span>
              <div
                className={cn(
                  "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
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
            <p className="text-white/40 text-[11px] font-bold uppercase tracking-wider leading-relaxed">
              {template.description}
            </p>
          )}
        </SheetHeader>

        <div className="p-8 space-y-8">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white/3 border border-white/5 space-y-1">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">
                Industry Designation
              </span>
              <p className="text-sm font-bold text-white uppercase tracking-tight">
                {template.projectTypeName || "General / Unspecified"}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white/3 border border-white/5 space-y-1">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">
                Metric Density
              </span>
              <p className="text-sm font-bold text-white uppercase tracking-tight">
                {template.lineItems.length} Framework Components
              </p>
            </div>
          </div>

          {/* Line Items Framework */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <Tag className="h-3 w-3 text-primary/60" />
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
                Architectural Breakdown
              </h4>
            </div>

            <div className="space-y-4">
              {template.lineItems.map((item, idx) => {
                const itemTotal = item.unitPrice * item.defaultQuantity;
                return (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h5 className="text-sm font-bold text-white tracking-tight leading-snug">
                          {item.description}
                        </h5>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[9px] font-black uppercase tracking-widest text-white/20 bg-white/5 px-2 py-0.5 rounded">
                            {item.unit}
                          </span>
                          <span className="text-[9px] font-bold text-white/40 lowercase">
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
                            className="flex items-center justify-between text-[11px]"
                          >
                            <span className="text-white/40 font-medium">
                              {sub.description}
                            </span>
                            <span className="text-white/60 font-black">
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
          <div className="p-8 rounded-3xl bg-primary border border-primary/20 shadow-[0_20px_50px_rgba(var(--primary-rgb),0.2)] space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.1] pointer-events-none">
              <Receipt className="h-32 w-32 rotate-12 text-white" />
            </div>

            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-primary-foreground/40 uppercase tracking-[0.2em]">
                  Base Revenue
                </span>
                <span className="text-lg font-black text-primary-foreground tracking-tight">
                  {formatCurrency(subtotal)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black text-primary-foreground/40 uppercase tracking-[0.2em]">
                    Tax Provision
                  </span>
                  <span className="text-[8px] font-black bg-primary-foreground/10 px-1.5 py-0.5 rounded text-primary-foreground/40">
                    18%
                  </span>
                </div>
                <span className="text-lg font-black text-primary-foreground/40">
                  {formatCurrency(gst)}
                </span>
              </div>

              <div className="pt-6 border-t border-primary-foreground/10 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[11px] font-black text-primary-foreground uppercase tracking-[0.3em]">
                    Total Valuation
                  </span>
                  <span className="text-[9px] text-primary-foreground/40 font-bold uppercase tracking-widest mt-0.5">
                    INR Corporate Standard
                  </span>
                </div>
                <span className="text-4xl font-black text-primary-foreground tracking-tighter">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </div>

          {/* Terms */}
          {template.terms && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <Info className="h-3 w-3 text-white/20" />
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
                  Contractual Provisions
                </h4>
              </div>
              <div className="p-6 rounded-2xl bg-white/3 border border-white/5">
                <p className="text-[11px] text-white/60 font-medium leading-relaxed whitespace-pre-wrap">
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
