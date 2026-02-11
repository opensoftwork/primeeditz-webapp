"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SelectedPackagesSummaryProps {
  selectedIds: Id<"servicePackages">[];
  hideHeader?: boolean;
}

export function SelectedPackagesSummary({
  selectedIds,
  hideHeader = false,
}: SelectedPackagesSummaryProps) {
  const packages = useQuery(api.functions.servicePackages.queries.getMany, {
    ids: selectedIds,
  });
  const projectTypes = useQuery(
    api.functions.projectTypes.queries.getActiveProjectTypes,
  );

  if (!selectedIds.length) {
    return (
      <div className="border border-dashed border-white/10 rounded-2xl p-6 text-center">
        <p className="text-xs font-black uppercase tracking-widest text-white/20">
          No Packages Selected
        </p>
      </div>
    );
  }

  // Calculate totals
  const totalLineItems =
    packages?.flatMap((pkg: any) =>
      pkg.lineItems.map((item: any) => ({ ...item, packageName: pkg.name })),
    ) ?? [];

  const subtotal = totalLineItems.reduce(
    (sum: number, item: any) => sum + item.rate * item.quantity,
    0,
  );
  const gstAmount = Math.round(subtotal * 0.18);
  const total = subtotal + gstAmount;

  return (
    <div className="space-y-8">
      {/* Detailed Breakdown */}
      <div className="space-y-4">
        {!hideHeader && (
          <div className="flex items-center gap-4">
            <h3 className="text-[11px] font-black text-white/40 uppercase tracking-[0.5em] whitespace-nowrap flex items-center gap-3">
              <div className="w-1 h-1 rounded-full bg-white/20" />
              Itemized Breakdown
            </h3>
            <div className="h-px w-full bg-white/5" />
          </div>
        )}

        <div className="grid gap-4">
          {packages?.map((pkg: any) => {
            const projectType = (projectTypes as any[])?.find(
              (t: any) => t._id === pkg.projectTypeId,
            );
            return (
              <div
                key={pkg._id}
                className="rounded-3xl border border-white/5 bg-white/1 overflow-hidden"
              >
                {/* Package Header */}
                <div className="p-4 flex items-center justify-between border-b border-white/5 bg-white/5">
                  <div className="flex items-center gap-3.5">
                    <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_12px_rgba(var(--primary),0.1)]">
                      <span className="text-[11px] font-black text-primary uppercase">
                        P{packages.indexOf(pkg) + 1}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-[13px] font-black text-white uppercase tracking-wider mb-0.5">
                        {pkg.name}
                      </h4>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="bg-primary/5 border-primary/20 text-primary text-[8px] font-black uppercase tracking-widest px-1.5 py-0 h-3.5"
                        >
                          {projectType?.name}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20 block mb-0.5">
                      Pkg Total
                    </span>
                    <span className="text-base font-black text-white tracking-tight">
                      ₹
                      {pkg.lineItems
                        .reduce(
                          (acc: number, item: any) =>
                            acc + item.rate * item.quantity,
                          0,
                        )
                        .toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Line Items */}
                <div className="p-4 space-y-3.5">
                  {pkg.lineItems.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-start justify-between text-sm group/item"
                    >
                      <div className="space-y-0.5">
                        <span className="text-[13px] text-white/70 font-bold block group-hover/item:text-white transition-colors">
                          {item.description}
                        </span>
                        <span className="text-[9px] text-white/30 font-black uppercase tracking-[0.15em] block">
                          {item.quantity} {item.unit} @ ₹
                          {item.rate.toLocaleString()}
                        </span>
                      </div>
                      <span className="text-[13px] font-bold text-white/40 tabular-nums group-hover/item:text-white transition-colors">
                        ₹{(item.rate * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Combined Pricing */}
      <div className="bg-zinc-950/50 border border-white/10 rounded-[2rem] p-7 relative overflow-hidden group shadow-2xl">
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-50" />
        <div className="absolute inset-0 bg-grid-white/[0.01] bg-size-[24px_24px]" />

        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-3.5 bg-primary rounded-full shadow-[0_0_12px_rgba(var(--primary),0.6)]" />
            <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">
              Final Estimation
            </h4>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-white/30 font-black uppercase tracking-widest text-[9px]">
                Subtotal
              </span>
              <span className="text-white/80 font-bold tracking-tight text-sm">
                ₹{subtotal.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm py-3 border-y border-white/5 border-dashed">
              <span className="text-white/30 font-black uppercase tracking-widest text-[9px]">
                GST (18%)
              </span>
              <span className="text-white/80 font-bold tracking-tight text-sm">
                ₹{gstAmount.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary block">
                Total Est. Cost
              </span>
              <span className="text-[9px] text-white/20 font-bold uppercase tracking-widest">
                Inclusive of all taxes
              </span>
            </div>
            <div className="text-right">
              <span className="text-3xl md:text-4xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                ₹{total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
