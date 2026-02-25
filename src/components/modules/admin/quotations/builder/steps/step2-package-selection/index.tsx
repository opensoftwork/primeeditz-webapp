"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { Check, ChevronRight, Loader2, Search } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useQuotationBuilder } from "../../quotation-builder-context";
import type { Template } from "../../types";

export function Step2PackageSelection() {
  const {
    formData,
    setFormData,
    nextStep,
    setSubmitTrigger,
    applyPackageItems,
  } = useQuotationBuilder();

  // Handle next step
  const handleNext = useCallback(() => {
    try {
      applyPackageItems();
      nextStep();
    } catch (error) {
      console.error("Error in handleNext:", error);
      // Attempt to proceed anyway if item application fails
      nextStep();
    }
  }, [applyPackageItems, nextStep]);

  // Register submit trigger
  useEffect(() => {
    // We pass a function that returns handleNext, to match the state updater signature logic
    // if setSubmitTrigger implementation expects the value directly, we should verify.
    // Context implementation: setSubmitTriggerState(() => fn)
    // If we pass 'handleNext' (a function), setSubmitTriggerState sees it as the updater?
    // No, setSubmitTriggerState(updater). updater is () => fn. So it sets state to fn.
    // So passing handleNext is correct.
    setSubmitTrigger(handleNext);
    return () => setSubmitTrigger(null);
  }, [setSubmitTrigger, handleNext]);

  // Queries
  const packagesQuery = useQuery(
    //@ts-ignore
    api.functions.quotations.templates.queries.getPackages,
    { activeOnly: true },
  );
  const categoriesQuery = useQuery(
    api.functions.projectCategories.queries.getActiveCategories,
  );

  const packages = (packagesQuery as Template[] | undefined) || [];
  const categories = categoriesQuery || [];

  // State for filters
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const selectedPackageIds = formData.step2.packageIds;

  // Filtered packages
  const filteredPackages = packages.filter((pkg) => {
    const matchesSearch = pkg.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || pkg.categoryId === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const [focusedPackageId, setFocusedPackageId] = useState<string | null>(null);

  // Auto-focus first selected package on mount or when data loads
  useEffect(() => {
    if (
      !focusedPackageId &&
      selectedPackageIds.length > 0 &&
      packages.length > 0
    ) {
      // Find the first selected package that exists in the current package list
      const firstSelected = packages.find((p) =>
        selectedPackageIds.includes(p._id),
      );
      if (firstSelected) {
        setFocusedPackageId(firstSelected._id);
      }
    }
  }, [packages, selectedPackageIds, focusedPackageId]);

  const focusedPackage = packages.find((p) => p._id === focusedPackageId);
  const isFocusedSelected = focusedPackageId
    ? selectedPackageIds.includes(focusedPackageId)
    : false;

  const handleTogglePackage = (packageId: string) => {
    const isSelected = selectedPackageIds.includes(packageId);
    if (isSelected) {
      setFormData("step2", {
        packageIds: selectedPackageIds.filter((id) => id !== packageId),
      });
    } else {
      setFormData("step2", {
        packageIds: [...selectedPackageIds, packageId],
      });
    }
    setFocusedPackageId(packageId);
  };

  const handleFocusPackage = (packageId: string) => {
    setFocusedPackageId(packageId);
  };

  const handleAddFocusedToQuote = () => {
    if (focusedPackageId && !isFocusedSelected) {
      handleTogglePackage(focusedPackageId);
    } else if (focusedPackageId && isFocusedSelected) {
      handleTogglePackage(focusedPackageId); // Toggle off if already selected? Or just keep it?
    }
  };

  // ... (keep handleNext and useEffect for trigger)

  if (!packagesQuery) {
    // ... (keep loader)
    return (
      <div className="h-64 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm text-white/40 font-black uppercase tracking-widest">
          Curating Packages...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex h-full overflow-hidden gap-8">
      {/* LEFT COLUMN: Package List */}
      <div className="w-full max-w-md flex flex-col h-full space-y-6">
        <div className="space-y-1 shrink-0">
          <h2 className="text-xl font-black tracking-tight uppercase text-white">
            Service Packages
          </h2>
          <p className="text-sm text-white/40 font-medium">
            Select one or more packages for this quote
          </p>
        </div>

        {/* Filters */}
        <div className="space-y-3 shrink-0">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
            <Input
              placeholder="Search packages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 bg-white/5 border-white/5 focus:border-primary/40 focus:ring-primary/20 transition-all rounded-xl w-full"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full h-11 bg-white/5 border-white/5 rounded-xl uppercase text-[10px] font-black tracking-widest">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-white/10">
              <SelectItem
                value="all"
                className="uppercase text-[10px] font-bold tracking-wider"
              >
                All Categories
              </SelectItem>
              {categories.map((cat: any) => (
                <SelectItem
                  key={cat._id}
                  value={cat._id}
                  className="uppercase text-[10px] font-bold tracking-wider"
                >
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
          {filteredPackages.map((pkg) => {
            const isSelected = selectedPackageIds.includes(pkg._id);
            const isFocused = focusedPackageId === pkg._id;

            return (
              <motion.div
                key={pkg._id}
                onClick={() => handleFocusPackage(pkg._id)}
                className={cn(
                  "p-4 rounded-2xl border cursor-pointer transition-all duration-200 relative group",
                  isFocused
                    ? "bg-white/10 border-white/20"
                    : "bg-white/2 border-white/5 hover:bg-white/5",
                  isSelected && !isFocused && "border-primary/40 bg-primary/5",
                )}
              >
                {isSelected && (
                  <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.8)]" />
                )}

                <div className="space-y-1">
                  <h3
                    className={cn(
                      "text-xs font-black uppercase tracking-wider transition-colors",
                      isFocused
                        ? "text-white"
                        : "text-white/60 group-hover:text-white",
                    )}
                  >
                    {pkg.name}
                  </h3>
                  {(() => {
                    const total =
                      pkg.price ||
                      pkg.lineItems?.reduce((acc, item: any) => {
                        const self = (item.rate || 0) * (item.quantity || 1);
                        const subTotal = (item.subItems || []).reduce(
                          (sum: number, sub: any) => {
                            const subSelf =
                              (sub.rate || 0) * (sub.quantity || 1);
                            const subSubTotal = (sub.subItems || []).reduce(
                              (s: number, ss: any) =>
                                s + (ss.rate || 0) * (ss.quantity || 1),
                              0,
                            );
                            return sum + subSelf + subSubTotal;
                          },
                          0,
                        );
                        return acc + self + subTotal;
                      }, 0) ||
                      0;
                    return total > 0 ? (
                      <p className="text-[10px] font-bold text-primary italic">
                        Starting from ₹{total.toLocaleString()}
                      </p>
                    ) : null;
                  })()}
                </div>
              </motion.div>
            );
          })}

          {filteredPackages.length === 0 && (
            <div className="py-12 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-2xl bg-white/1">
              <p className="text-xs text-white/20 font-black uppercase tracking-widest text-center px-4">
                No packages found
              </p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Details */}
      <div className="flex-1 h-full bg-white/2 border border-white/5 rounded-3xl p-8 overflow-y-auto custom-scrollbar relative">
        <AnimatePresence mode="wait">
          {focusedPackage ? (
            <motion.div
              key={focusedPackage._id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-10"
            >
              {/* Header Section */}
              <div className="flex items-start justify-between gap-6">
                <div className="space-y-4">
                  <h2 className="text-3xl font-black uppercase tracking-tight text-white leading-none">
                    {focusedPackage.name}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {focusedPackage.projectConfigs &&
                      focusedPackage.projectConfigs.length > 0 && (
                        <Badge
                          variant="secondary"
                          className="bg-white/10 hover:bg-white/20 text-white/60 text-[9px] font-black uppercase tracking-widest rounded-md px-2 py-1"
                        >
                          Multi-Project
                        </Badge>
                      )}
                    <Badge
                      variant="secondary"
                      className="bg-primary/20 hover:bg-primary/30 text-primary text-[9px] font-black uppercase tracking-widest rounded-md px-2 py-1"
                    >
                      {categories.find(
                        (c: any) => c._id === focusedPackage.categoryId,
                      )?.name || "Service"}
                    </Badge>
                  </div>
                  {focusedPackage.description && (
                    <p className="text-sm text-white/50 leading-relaxed font-medium max-w-2xl">
                      {focusedPackage.description}
                    </p>
                  )}
                </div>

                <Button
                  size="lg"
                  onClick={handleAddFocusedToQuote}
                  className={cn(
                    "shrink-0 h-12 px-6 text-[10px] font-black uppercase tracking-widest transition-all",
                    isFocusedSelected
                      ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/20"
                      : "bg-white/10 text-white hover:bg-white/20 border border-white/10",
                  )}
                >
                  {isFocusedSelected ? "Remove from Quote" : "Add to Quote"}
                </Button>
              </div>

              <div className="h-px w-full bg-linear-to-r from-transparent via-white/10 to-transparent" />

              {/* Project Intelligence */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full border border-white/20 flex items-center justify-center">
                    <div className="h-1.5 w-1.5 bg-white/40 rounded-full animate-pulse" />
                  </div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40">
                    Project Intelligence
                  </h3>
                </div>

                <div className="bg-zinc-950/50 border border-white/5 rounded-2xl p-5">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 font-bold text-xs uppercase shrink-0">
                      P1
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-white">
                        {focusedPackage.name} Project Structure
                      </h4>
                      <p className="text-[10px] text-white/40 font-medium mt-1">
                        Auto-creates project & folders optimized for this
                        workflow
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40">
                    Financial Breakdown
                  </h3>
                </div>

                <div className="overflow-hidden rounded-2xl border border-white/5 bg-zinc-950/30">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/5">
                        <th className="px-5 py-3 text-[9px] font-black uppercase tracking-widest text-white/30">
                          Description
                        </th>
                        <th className="px-5 py-3 text-[9px] font-black uppercase tracking-widest text-white/30 text-right">
                          Qty
                        </th>
                        <th className="px-5 py-3 text-[9px] font-black uppercase tracking-widest text-white/30 text-right">
                          Rate
                        </th>
                        <th className="px-5 py-3 text-[9px] font-black uppercase tracking-widest text-white/30 text-right">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {focusedPackage.lineItems?.map((item, i) => {
                        const itemTotal = (() => {
                          const self = (item.rate || 0) * (item.quantity || 1);
                          const subTotal = (
                            (item as any).subItems || []
                          ).reduce((sum: number, sub: any) => {
                            const subSelf =
                              (sub.rate || 0) * (sub.quantity || 1);
                            const subSubTotal = (sub.subItems || []).reduce(
                              (s: number, ss: any) =>
                                s + (ss.rate || 0) * (ss.quantity || 1),
                              0,
                            );
                            return sum + subSelf + subSubTotal;
                          }, 0);
                          return self + subTotal;
                        })();

                        return (
                          <React.Fragment key={i}>
                            <tr className="hover:bg-white/2 transition-colors">
                              <td className="px-5 py-3">
                                <p className="text-[11px] font-bold text-white/80">
                                  {item.description}
                                </p>
                                <p className="text-[9px] text-white/30 uppercase tracking-wider">
                                  {item.unit || "Service Item"}
                                </p>
                              </td>
                              <td className="px-5 py-3 text-right text-[11px] font-mono text-white/60">
                                {item.quantity}
                              </td>
                              <td className="px-5 py-3 text-right text-[11px] font-mono text-white/60">
                                ₹{item.rate.toLocaleString()}
                              </td>
                              <td className="px-5 py-3 text-right text-[11px] font-mono text-primary font-bold">
                                ₹{itemTotal.toLocaleString()}
                              </td>
                            </tr>
                            {/* Level 2 sub-items */}
                            {(item as any).subItems?.map(
                              (sub: any, sIdx: number) => (
                                <React.Fragment key={`${i}-${sIdx}`}>
                                  <tr className="hover:bg-white/2 transition-colors">
                                    <td className="px-5 py-2 pl-10">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-white/10 text-xs">
                                          └
                                        </span>
                                        <span className="text-[10px] font-medium text-white/50">
                                          {sub.description}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="px-5 py-2 text-right text-[10px] font-mono text-white/30">
                                      {sub.quantity}
                                    </td>
                                    <td className="px-5 py-2 text-right text-[10px] font-mono text-white/30">
                                      ₹{sub.rate.toLocaleString()}
                                    </td>
                                    <td className="px-5 py-2 text-right text-[10px] font-mono text-white/40">
                                      ₹
                                      {(
                                        sub.rate * sub.quantity
                                      ).toLocaleString()}
                                    </td>
                                  </tr>
                                  {/* Level 3 sub-sub-items */}
                                  {sub.subItems?.map(
                                    (ssub: any, ssIdx: number) => (
                                      <tr
                                        key={`${i}-${sIdx}-${ssIdx}`}
                                        className="hover:bg-white/1 transition-colors"
                                      >
                                        <td className="px-5 py-1.5 pl-16">
                                          <div className="flex items-center gap-1.5">
                                            <span className="text-white/5 text-xs">
                                              └
                                            </span>
                                            <span className="text-[9px] font-medium text-white/30 italic">
                                              {ssub.description}
                                            </span>
                                          </div>
                                        </td>
                                        <td className="px-5 py-1.5 text-right text-[9px] font-mono text-white/20">
                                          {ssub.quantity}
                                        </td>
                                        <td className="px-5 py-1.5 text-right text-[9px] font-mono text-white/20">
                                          ₹{ssub.rate.toLocaleString()}
                                        </td>
                                        <td className="px-5 py-1.5 text-right text-[9px] font-mono text-white/25">
                                          ₹
                                          {(
                                            ssub.rate * ssub.quantity
                                          ).toLocaleString()}
                                        </td>
                                      </tr>
                                    ),
                                  )}
                                </React.Fragment>
                              ),
                            )}
                          </React.Fragment>
                        );
                      })}
                      {(!focusedPackage.lineItems ||
                        focusedPackage.lineItems.length === 0) && (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-5 py-8 text-center text-[10px] text-white/20 italic"
                          >
                            No line items defined in this package
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot className="bg-white/5 border-t border-white/5">
                      <tr>
                        <td
                          colSpan={3}
                          className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-white/40"
                        >
                          Package Total
                        </td>
                        <td className="px-5 py-4 text-right text-lg font-black text-white italic">
                          ₹
                          {(
                            focusedPackage.lineItems?.reduce(
                              (acc, item: any) => {
                                const self =
                                  (item.rate || 0) * (item.quantity || 1);
                                const subTotal = (item.subItems || []).reduce(
                                  (sum: number, sub: any) => {
                                    const subSelf =
                                      (sub.rate || 0) * (sub.quantity || 1);
                                    const subSubTotal = (
                                      sub.subItems || []
                                    ).reduce(
                                      (s: number, ss: any) =>
                                        s + (ss.rate || 0) * (ss.quantity || 1),
                                      0,
                                    );
                                    return sum + subSelf + subSubTotal;
                                  },
                                  0,
                                );
                                return acc + self + subTotal;
                              },
                              0,
                            ) || 0
                          ).toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-20">
              <div className="h-20 w-20 rounded-full border-2 border-white/20 flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-white" />
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-white">
                Select a package to view details
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
