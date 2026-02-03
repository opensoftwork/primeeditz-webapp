"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SelectedPackagesSummaryProps {
  selectedIds: Id<"servicePackages">[];
}

export function SelectedPackagesSummary({
  selectedIds,
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
        <div className="flex items-center gap-4">
          <h3 className="text-[11px] font-black text-white/40 uppercase tracking-[0.5em] whitespace-nowrap flex items-center gap-3">
            <div className="w-1 h-1 rounded-full bg-white/20" />
            Itemized Breakdown
          </h3>
          <div className="h-px w-full bg-white/5" />
        </div>

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
                <div className="p-4 flex items-center justify-between border-b border-white/5 bg-white/2">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                      <span className="text-[10px] font-black text-white/40">
                        P{packages.indexOf(pkg) + 1}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white leading-none mb-1">
                        {pkg.name}
                      </h4>
                      <Badge
                        variant="outline"
                        className="bg-transparent border-transparent text-white/40 text-[9px] font-black uppercase tracking-widest p-0 h-auto"
                      >
                        {projectType?.name}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/20 block">
                      Package Total
                    </span>
                    <span className="text-sm font-black text-white">
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
                <div className="p-4 space-y-3">
                  {pkg.lineItems.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-start justify-between text-sm"
                    >
                      <div className="space-y-0.5">
                        <span className="text-white/80 font-medium block">
                          {item.description}
                        </span>
                        <span className="text-[10px] text-white/30 font-black uppercase tracking-wider block">
                          {item.quantity} {item.unit} @ ₹
                          {item.rate.toLocaleString()} / {item.unit}
                        </span>
                      </div>
                      <span className="font-bold text-white/60 tabular-nums">
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
      <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-6 relative overflow-hidden group">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-size-[20px_20px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none transition-opacity duration-700 opacity-50 group-hover:opacity-100" />

        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-3 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
            <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">
              Final Estimation
            </h4>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm py-1 border-b border-white/5 border-dashed pb-2">
              <span className="text-white/40 font-bold uppercase tracking-wider text-[11px]">
                Subtotal
              </span>
              <span className="text-white font-bold tracking-tight">
                ₹{subtotal.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm py-1 border-b border-white/5 border-dashed pb-2">
              <span className="text-white/40 font-bold uppercase tracking-wider text-[11px]">
                GST (18%)
              </span>
              <span className="text-white font-bold tracking-tight">
                ₹{gstAmount.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/60 mb-0.5">
                Total Est. Cost
              </span>
              <span className="text-[10px] text-white/20 font-medium">
                Subject to final invoice
              </span>
            </div>
            <span className="text-3xl font-black text-white tracking-tighter drop-shadow-lg">
              ₹{total.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
