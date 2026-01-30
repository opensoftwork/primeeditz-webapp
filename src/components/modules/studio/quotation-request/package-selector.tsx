"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { PackageCard } from "./package-card";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Search packages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
        <Select
          value={categoryFilter ?? "all"}
          onValueChange={(v) => setCategoryFilter(v === "all" ? null : v)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories?.map((cat: any) => (
              <SelectItem key={cat._id} value={cat._id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Package Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((pkg) => (
          <PackageCard
            key={pkg._id}
            package={pkg}
            isSelected={selectedIds.includes(pkg._id)}
            onToggle={() => handleToggle(pkg._id)}
          />
        ))}

        {packages && filtered.length === 0 && (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No packages found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}
