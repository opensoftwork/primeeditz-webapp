"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Layers, CheckCircle2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface PackagePreviewPanelProps {
  packageId: Id<"servicePackages">;
  isSelected: boolean;
  onToggle: (id: Id<"servicePackages">) => void;
}

export function PackagePreviewPanel({
  packageId,
  isSelected,
  onToggle,
}: PackagePreviewPanelProps) {
  // @ts-ignore - TS2589: recursive validator depth
  const pkg = useQuery(api.functions.servicePackages.queries.getById, {
    id: packageId,
  });

  const projectTypes = useQuery(
    api.functions.projectTypes.queries.getActiveProjectTypes,
  );

  const folderTemplates = useQuery(
    api.functions.folderTemplates.queries.getFolderTemplates,
    { activeOnly: true },
  );

  if (!pkg) {
    return (
      <div className="flex flex-col border-l border-white/5 bg-zinc-950/30 animate-pulse">
        {/* Header Skeleton */}
        <div className="p-8 border-b border-white/5 bg-white/2 space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-3 flex-1">
              <Skeleton className="h-8 w-3/4 bg-white/5 rounded-xl" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-24 bg-white/5 rounded-full" />
                <Skeleton className="h-5 w-20 bg-white/5 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-10 w-28 bg-white/5 rounded-lg" />
          </div>
          <Skeleton className="h-16 w-full bg-white/5 rounded-xl" />
        </div>

        {/* Content Skeleton */}
        <div className="p-8 space-y-10">
          {/* Project Intelligence Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-4 w-40 bg-white/5 rounded-md" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-20 w-full bg-white/5 rounded-2xl" />
              <Skeleton className="h-20 w-full bg-white/5 rounded-2xl" />
            </div>
          </div>

          {/* Financial Breakdown Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-4 w-36 bg-white/5 rounded-md" />
            <div className="rounded-2xl border border-white/5 overflow-hidden">
              <div className="bg-white/5 p-3">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-24 bg-white/10 rounded" />
                  <Skeleton className="h-3 w-12 bg-white/10 rounded" />
                  <Skeleton className="h-3 w-16 bg-white/10 rounded" />
                  <Skeleton className="h-3 w-16 bg-white/10 rounded" />
                </div>
              </div>
              <div className="p-4 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-3 w-3/4 bg-white/5 rounded" />
                      <Skeleton className="h-2 w-1/4 bg-white/10 rounded" />
                    </div>
                    <Skeleton className="h-3 w-8 bg-white/5 rounded" />
                    <Skeleton className="h-3 w-16 bg-white/5 rounded ml-4" />
                    <Skeleton className="h-3 w-16 bg-white/5 rounded ml-4" />
                  </div>
                ))}
              </div>
              <div className="bg-white/10 p-4 flex justify-between items-center border-t border-white/5">
                <Skeleton className="h-4 w-28 bg-white/5 rounded" />
                <Skeleton className="h-5 w-24 bg-white/10 rounded" />
              </div>
            </div>
          </div>
        </div>
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

  const subtotal = pkg.lineItems.reduce(
    (acc: number, item: any) => acc + calculateItemTotal(item),
    0,
  );

  return (
    <div className="flex flex-col border-l border-white/5 bg-zinc-950/30">
      {/* Header Section */}
      <div className="p-8 border-b border-white/5 bg-white/2 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-2 leading-none">
              {pkg.name}
            </h2>
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="border-white/10 text-white/40 text-[10px] uppercase font-black tracking-widest bg-white/5 px-2 py-1"
              >
                {pkg.projectConfigs?.length ? "Multi-Project" : "Standard"}
              </Badge>
              {pkg.categoryId && (
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary border-primary/20 text-[10px] uppercase font-black tracking-widest px-2 py-1"
                >
                  Category
                </Badge>
              )}
            </div>
          </div>
          <Button
            onClick={() => onToggle(pkg._id)}
            variant={isSelected ? "default" : "outline"}
            className={cn(
              "h-10 px-6 uppercase tracking-widest font-black text-[10px] transition-all",
              isSelected
                ? "bg-primary text-black hover:bg-primary/90"
                : "bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white",
            )}
          >
            {isSelected ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Selected
              </>
            ) : (
              "Add to Quote"
            )}
          </Button>
        </div>

        <p className="text-sm font-medium text-white/50 leading-relaxed max-w-xl">
          {pkg.description || "No description provided."}
        </p>
      </div>

      {/* Content */}
      <div className="p-8 space-y-10">
        {/* Project Intelligence Section */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
            <Layers className="h-3 w-3" />
            Project Intelligence
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pkg.projectConfigs?.length ? (
              pkg.projectConfigs.map((config: any, idx: number) => {
                const pType = projectTypes?.find(
                  (t) => t._id === config.projectTypeId,
                );
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white/3 border border-white/5 flex items-center gap-4"
                  >
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xs border border-primary/10">
                      P{idx + 1}
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] font-bold text-white uppercase tracking-wide">
                        {pType?.name || "Unknown Project"}
                      </p>
                      <p className="text-[9px] text-white/40 font-medium">
                        Auto-creates project & folders
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              // Fallback for single project logic if migrated
              <div className="p-4 rounded-2xl bg-white/3 border border-white/5 flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 font-black text-xs border border-white/10">
                  P1
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-white uppercase tracking-wide">
                    Standard Project
                  </p>
                  <p className="text-[9px] text-white/40 font-medium">
                    Creates single project entity
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pricing Breakdown - Shadcn Table */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40">
            Financial Breakdown
          </h3>

          <div className="rounded-2xl border border-white/5 overflow-hidden">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="hover:bg-transparent border-white/5">
                  <TableHead className="text-[9px] font-black uppercase tracking-widest text-white/40 h-10 w-16 text-center">
                    SL NO
                  </TableHead>
                  <TableHead className="text-[9px] font-black uppercase tracking-widest text-white/40 h-10">
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
                        {item.rate ? `₹${item.rate.toLocaleString()}` : "-"}
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
                            {sub.rate ? `₹${sub.rate.toLocaleString()}` : "-"}
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
              <TableFooter className="bg-white/10 border-t border-white/5">
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={4}
                    className="text-[10px] font-black uppercase tracking-widest text-white/60"
                  >
                    Package Total
                  </TableCell>
                  <TableCell className="text-right text-sm font-black text-white tracking-tight">
                    ₹{subtotal.toLocaleString()}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
