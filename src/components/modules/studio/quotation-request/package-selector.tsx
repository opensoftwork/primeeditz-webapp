"use client";
import { Search } from "lucide-react";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { PackageCard } from "./package-card";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { PackagePreviewPanel } from "./package-preview-panel";

interface PackageSelectorProps {
  selectedIds: Id<"servicePackages">[];
  onSelectionChange: (ids: Id<"servicePackages">[]) => void;
}

export function PackageSelector({
  selectedIds,
  onSelectionChange,
}: PackageSelectorProps) {
  const packages = useQuery(api.functions.servicePackages.queries.listActive);
  const categories = useQuery(
    api.functions.projectCategories.queries.getActiveCategories,
  );
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activePreviewId, setActivePreviewId] = useState<Id<"servicePackages"> | null>(
    null,
  );

  // Initialize active preview to first selected ID if nothing is active
  useEffect(() => {
    if (!activePreviewId && selectedIds.length > 0) {
      setActivePreviewId(selectedIds[0]);
    }
  }, [activePreviewId, selectedIds]);

  // Filter packages
  let filtered = packages ?? [];
  if (categoryFilter && categoryFilter !== "all") {
    filtered = filtered.filter((p) => p.categoryId === categoryFilter);
  }
  if (searchTerm) {
    const lower = searchTerm.toLowerCase();
    filtered = filtered.filter((p) => p.name.toLowerCase().includes(lower));
  }

  function handleToggle(packageId: Id<"servicePackages">) {
    if (selectedIds.includes(packageId)) {
      onSelectionChange(selectedIds.filter((id) => id !== packageId));
    } else {
      onSelectionChange([...selectedIds, packageId]);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column - Package List (Scrolls with page) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Filters - Compact */}
          <div className="flex flex-col gap-3 bg-black/20 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search packages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-10 bg-white/5 border-white/5 rounded-xl text-sm font-medium text-white placeholder:text-white/20 focus:bg-black/40 focus:border-primary/30 transition-all"
              />
            </div>
            <Select
              value={categoryFilter ?? "all"}
              onValueChange={(v) => setCategoryFilter(v === "all" ? null : v)}
            >
              <SelectTrigger className="w-full h-10 bg-white/5 border-white/5 rounded-xl text-white text-xs font-medium focus:ring-primary/20">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-white/10 rounded-xl">
                <SelectItem value="all" className="focus:bg-white/10 focus:text-white cursor-pointer text-xs">All Categories</SelectItem>
                {categories?.map((cat: any) => (
                  <SelectItem key={cat._id} value={cat._id} className="focus:bg-white/10 focus:text-white cursor-pointer text-xs">
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Package List */}
          <div className="space-y-3">
            {filtered.map(pkg => (
              <div
                key={pkg._id}
                onClick={() => setActivePreviewId(pkg._id)}
                className={cn(
                  "p-4 rounded-xl border cursor-pointer transition-all duration-300 group select-none relative overflow-hidden",
                  activePreviewId === pkg._id
                    ? "bg-white/5 border-primary/50 shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
                    : "bg-white/2 border-white/5 hover:bg-white/5 hover:border-white/10"
                )}
              >
                {/* Selected Indicator Dot */}
                {selectedIds.includes(pkg._id) && (
                  <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.8)] animate-pulse" />
                )}

                <div className="space-y-1">
                  <h4 className={cn(
                    "text-sm font-bold uppercase tracking-wide transition-colors",
                    activePreviewId === pkg._id ? "text-white" : "text-white/60 group-hover:text-white/80"
                  )}>
                    {pkg.name}
                  </h4>
                  <p className={cn(
                    "text-xs font-semibold tracking-tight",
                    activePreviewId === pkg._id ? "text-primary" : "text-white/30"
                  )}>
                    Starting from ₹{pkg.lineItems.reduce((acc, i) => acc + (i.rate * i.quantity), 0).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
            
            {filtered.length === 0 && (
              <div className="py-10 text-center">
                <p className="text-xs text-white/30 font-medium">No packages found.</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Right Column - Detail View (Sticky) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="sticky top-8 space-y-6">
            <div className="rounded-4xl bg-black/20 border border-white/5 overflow-hidden relative">
              {activePreviewId ? (
                <PackagePreviewPanel
                  packageId={activePreviewId}
                  isSelected={selectedIds.includes(activePreviewId)}
                  onToggle={handleToggle}
                />
              ) : (
                <div className="h-[500px] flex items-center justify-center">
                  <p className="text-white/20 text-sm font-medium">Select a package to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
    </div>
  );
}
