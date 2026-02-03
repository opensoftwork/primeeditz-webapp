"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { Check, ChevronRight, Loader2, Search } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
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
  const { formData, setFormData, nextStep, setSubmitTrigger } =
    useQuotationBuilder();

  // Queries
  const packagesQuery = useQuery(
    api.functions.quotations.templates.queries.getPackages,
    { activeOnly: true },
  );
  const categoriesQuery = useQuery(
    api.functions.projectCategories.queries.getActiveCategories,
  );

  const packages = (packagesQuery as Template[] | undefined) || [];
  const categories = categoriesQuery || [];

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

  // Handle package toggle
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
  };

  // Handle next step
  const handleNext = () => {
    nextStep();
  };

  // Register submit trigger
  useEffect(() => {
    setSubmitTrigger(handleNext);
    return () => setSubmitTrigger(null);
  }, [setSubmitTrigger, nextStep]);

  if (!packagesQuery) {
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
    <div className="w-full flex flex-col h-full overflow-y-auto custom-scrollbar pr-2">
      <div className="flex-1">
        {/* Header */}
        <div className="mb-8 space-y-1">
          <h2 className="text-xl font-black tracking-tight uppercase text-white">
            Package Selection
          </h2>
          <p className="text-sm text-white/40 font-medium">
            Choose pre-defined service packages or skip to customize
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
            <Input
              placeholder="Search packages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 bg-white/2 border-white/5 focus:border-primary/40 focus:ring-primary/20 transition-all rounded-xl"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[200px] h-11 bg-white/2 border-white/5 rounded-xl uppercase text-[10px] font-black tracking-widest">
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

        {/* Package Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredPackages.map((pkg, idx) => {
              const isSelected = selectedPackageIds.includes(pkg._id);

              return (
                <motion.div
                  key={pkg._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: 0.05 * idx }}
                  className={cn(
                    "group relative p-6 rounded-4xl border transition-all duration-300 cursor-pointer flex flex-col min-h-[180px]",
                    isSelected
                      ? "bg-primary/10 border-primary/40 shadow-2xl shadow-primary/10"
                      : "bg-white/2 border-white/5 hover:bg-white/4 hover:border-white/10",
                  )}
                  onClick={() => handleTogglePackage(pkg._id)}
                >
                  {/* Selection indicator */}
                  <div className="absolute top-4 right-4">
                    <Checkbox
                      checked={isSelected}
                      className={cn(
                        "h-5 w-5 rounded-md border-white/10 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-colors",
                        isSelected
                          ? "opacity-100"
                          : "opacity-40 group-hover:opacity-100",
                      )}
                    />
                  </div>

                  <div className="space-y-3 pr-8">
                    <h3 className="text-sm font-black text-white uppercase tracking-tight">
                      {pkg.name}
                    </h3>
                    {pkg.description && (
                      <p className="text-[11px] text-white/30 leading-relaxed font-medium line-clamp-2 pr-4">
                        {pkg.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="bg-white/5 border-white/10 text-[8px] font-black uppercase tracking-widest text-primary px-2 py-0.5"
                      >
                        {pkg.projectConfigs && pkg.projectConfigs.length > 1
                          ? `Multi-Project (${pkg.projectConfigs.length})`
                          : "Standard Package"}
                      </Badge>
                    </div>
                    {pkg.price && (
                      <div className="flex flex-col items-end">
                        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest leading-none mb-1">
                          Price
                        </span>
                        <span className="text-base font-black text-white italic">
                          ₹{pkg.price.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredPackages.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-[3rem] bg-white/1">
              <p className="text-sm text-white/20 font-black uppercase tracking-widest">
                No packages found matching your criteria
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
