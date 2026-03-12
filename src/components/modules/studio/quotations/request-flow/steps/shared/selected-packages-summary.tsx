"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import React from "react";

interface SelectedPackagesSummaryProps {
  selectedIds: Id<"servicePackages">[];
  hideHeader?: boolean;
}

export function SelectedPackagesSummary({
  selectedIds,
  hideHeader = false,
}: SelectedPackagesSummaryProps) {
  //@ts-ignore
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

  // Recursive total for a single item (3-level: item → sub → sub-sub)
  const calculateItemTotal = (item: any): number => {
    const self = (item.rate || 0) * (item.quantity || 1);
    const subTotal = (item.subItems || []).reduce((sum: number, sub: any) => {
      const subSelf = (sub.rate || 0) * (sub.quantity || 1);
      const subSubTotal = (sub.subItems || []).reduce(
        (s: number, ss: any) => s + (ss.rate || 0) * (ss.quantity || 1),
        0,
      );
      return sum + subSelf + subSubTotal;
    }, 0);
    return self + subTotal;
  };

  // Calculate totals
  const totalLineItems =
    packages?.flatMap((pkg: any) =>
      pkg.lineItems.map((item: any) => ({ ...item, packageName: pkg.name })),
    ) ?? [];

  const subtotal = totalLineItems.reduce(
    (sum: number, item: any) => sum + calculateItemTotal(item),
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
                            acc + calculateItemTotal(item),
                          0,
                        )
                        .toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="bg-black/20">
                  <Table>
                    <TableHeader className="bg-white/5">
                      <TableRow className="hover:bg-transparent border-white/5 text-left">
                        <TableHead className="text-[9px] font-black uppercase tracking-widest text-white/40 h-10 w-16 text-center">
                          SL NO
                        </TableHead>
                        <TableHead className="text-[9px] font-black uppercase tracking-widest text-white/40 h-10 text-left">
                          Description
                        </TableHead>
                        <TableHead className="text-[9px] font-black uppercase tracking-widest text-white/40 h-10 text-right w-16">
                          Qty
                        </TableHead>
                        <TableHead className="text-[9px] font-black uppercase tracking-widest text-white/40 h-10 text-right w-24">
                          Rate
                        </TableHead>
                        <TableHead className="text-[9px] font-black uppercase tracking-widest text-white/40 h-10 text-right w-24">
                          Total
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pkg.lineItems.map((item: any, idx: number) => (
                        <React.Fragment key={idx}>
                          <TableRow className="border-white/5 hover:bg-white/5 transition-colors">
                            <TableCell className="text-center font-bold text-[12px] text-white/40 py-3.5">
                              {idx + 1}
                            </TableCell>
                            <TableCell className="font-medium text-[13px] text-white/80 py-3.5">
                              {item.description}
                              <div className="text-[10px] text-white/30 font-normal mt-1 uppercase tracking-wider">
                                {item.unit}
                              </div>
                            </TableCell>
                            <TableCell className="text-right text-[12px] font-bold text-white/60 py-3.5">
                              {item.quantity}
                            </TableCell>
                            <TableCell
                              className={cn(
                                "text-[12px] font-bold py-3.5",
                                item.rate
                                  ? "text-right text-white/60"
                                  : "text-center text-white/40",
                              )}
                            >
                              {item.rate
                                ? `₹${item.rate.toLocaleString()}`
                                : "-"}
                            </TableCell>
                            <TableCell
                              className={cn(
                                "text-[12px] font-bold py-3.5",
                                calculateItemTotal(item)
                                  ? "text-right text-primary"
                                  : "text-center text-white/40",
                              )}
                            >
                              {calculateItemTotal(item)
                                ? `₹${calculateItemTotal(item).toLocaleString()}`
                                : "-"}
                            </TableCell>
                          </TableRow>
                          {/* Level 2 sub-items */}
                          {item.subItems?.map((sub: any, sIdx: number) => (
                            <React.Fragment key={`${idx}-${sIdx}`}>
                              <TableRow className="border-white/5 hover:bg-white/3 transition-colors">
                                <TableCell className="text-center text-[11px] font-medium text-white/30 py-2.5">
                                  {idx + 1}.{sIdx + 1}
                                </TableCell>
                                <TableCell className="py-2.5 pl-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[12px] font-medium text-white/60">
                                      {sub.description}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right text-[11px] font-medium text-white/40 py-2.5">
                                  {sub.quantity}
                                </TableCell>
                                <TableCell
                                  className={cn(
                                    "text-[11px] font-medium py-2.5",
                                    sub.rate
                                      ? "text-right text-white/40"
                                      : "text-center text-white/30",
                                  )}
                                >
                                  {sub.rate
                                    ? `₹${sub.rate.toLocaleString()}`
                                    : "-"}
                                </TableCell>
                                <TableCell
                                  className={cn(
                                    "text-[11px] font-medium py-2.5",
                                    (sub.rate || 0) * (sub.quantity || 1)
                                      ? "text-right text-white/50"
                                      : "text-center text-white/30",
                                  )}
                                >
                                  {(sub.rate || 0) * (sub.quantity || 1)
                                    ? `₹${((sub.rate || 0) * (sub.quantity || 1)).toLocaleString()}`
                                    : "-"}
                                </TableCell>
                              </TableRow>
                              {/* Level 3 sub-sub-items */}
                              {sub.subItems?.map((ssub: any, ssIdx: number) => (
                                <TableRow
                                  key={`${idx}-${sIdx}-${ssIdx}`}
                                  className="border-white/5 hover:bg-white/2 transition-colors"
                                >
                                  <TableCell className="text-center text-[10px] font-medium text-white/20 py-2">
                                    {idx + 1}.{sIdx + 1}.{ssIdx + 1}
                                  </TableCell>
                                  <TableCell className="py-2 pl-6">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[11px] font-medium text-white/40 italic">
                                        {ssub.description}
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right text-[10px] font-medium text-white/30 py-2">
                                    {ssub.quantity}
                                  </TableCell>
                                  <TableCell
                                    className={cn(
                                      "text-[10px] font-medium py-2",
                                      ssub.rate
                                        ? "text-right text-white/30"
                                        : "text-center text-white/20",
                                    )}
                                  >
                                    {ssub.rate
                                      ? `₹${ssub.rate.toLocaleString()}`
                                      : "-"}
                                  </TableCell>
                                  <TableCell
                                    className={cn(
                                      "text-[10px] font-medium py-2",
                                      (ssub.rate || 0) * (ssub.quantity || 1)
                                        ? "text-right text-white/40"
                                        : "text-center text-white/20",
                                    )}
                                  >
                                    {(ssub.rate || 0) * (ssub.quantity || 1)
                                      ? `₹${((ssub.rate || 0) * (ssub.quantity || 1)).toLocaleString()}`
                                      : "-"}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </React.Fragment>
                          ))}
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Combined Pricing */}
      <div className="bg-zinc-950/50 border border-white/10 rounded-4xl p-7 relative overflow-hidden group shadow-2xl">
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
