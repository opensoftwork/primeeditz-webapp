"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Doc, Id } from "@convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

interface PackageCardProps {
  package: Doc<"servicePackages">;
  isSelected: boolean;
  onToggle: () => void;
}

export function PackageCard({
  package: pkg,
  isSelected,
  onToggle,
}: PackageCardProps) {
  // For multi-project support, we can't easily fetch all types here without a more complex query
  // or fetching them all at once in the parent. For now, let's just show "Multi-Project" or the single type.
  const singleTypeId = pkg.projectTypeId || (pkg.projectConfigs && pkg.projectConfigs.length === 1 ? pkg.projectConfigs[0].projectTypeId : null);
  
  const projectType = useQuery(
    api.functions.projectTypes.queries.getProjectType,
    singleTypeId ? { projectTypeId: singleTypeId as Id<"projectTypes"> } : "skip"
  );

  // Calculate starting price
  const startingPrice = pkg.lineItems.reduce(
    (sum: number, item) => sum + item.rate * item.quantity,
    0,
  );

  return (
    <div
      className={cn(
        "relative border rounded-lg p-4 cursor-pointer transition-all",
        isSelected
          ? "border-primary ring-2 ring-primary/20 bg-primary/5"
          : "hover:border-muted-foreground/50",
      )}
      onClick={onToggle}
    >
      {/* Selection indicator */}
      <div className="absolute top-3 right-3">
        <Checkbox checked={isSelected} />
      </div>

      <h3 className="font-semibold pr-8">{pkg.name}</h3>

      {pkg.description && (
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
          {pkg.description}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between">
        <Badge variant="outline">
          {pkg.projectConfigs && pkg.projectConfigs.length > 1
            ? `Multi-Project (${pkg.projectConfigs.length})`
            : projectType?.name || "Standard"}
        </Badge>
        <span className="font-bold">₹{startingPrice.toLocaleString()}</span>
      </div>
    </div>
  );
}
