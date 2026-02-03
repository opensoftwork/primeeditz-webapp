"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Doc, Id } from "@convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ChevronRight } from "lucide-react";

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
  const singleTypeId =
    pkg.projectTypeId ||
    (pkg.projectConfigs && pkg.projectConfigs.length === 1
      ? pkg.projectConfigs[0].projectTypeId
      : null);

  const projectType = useQuery(
    api.functions.projectTypes.queries.getProjectType,
    singleTypeId
      ? { projectTypeId: singleTypeId as Id<"projectTypes"> }
      : "skip",
  );

  const startingPrice = pkg.lineItems.reduce(
    (sum: number, item) => sum + item.rate * item.quantity,
    0,
  );

  return (
    <button
      className={cn(
        "group relative flex flex-col p-6 rounded-[1.8rem] transition-all duration-500 overflow-hidden text-left h-full border",
        isSelected
          ? "bg-primary border-primary shadow-[0_20px_40px_rgba(var(--primary),0.2)] scale-[1.02]"
          : "bg-white/1 border-white/5 hover:border-primary/40 hover:bg-white/3 hover:scale-[1.01]",
      )}
      onClick={onToggle}
    >
      {/* Glass gradient highlight */}
      <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="flex items-start justify-between relative z-10 w-full mb-6">
        <Badge
          variant="outline"
          className={cn(
            "rounded-full border text-[9px] font-black uppercase tracking-widest px-2.5 py-1",
            isSelected
              ? "bg-black/10 border-black/10 text-black/60"
              : "bg-white/5 border-white/10 text-white/40 group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20",
          )}
        >
          {pkg.projectConfigs && pkg.projectConfigs.length > 1
            ? `Multi-Project (${pkg.projectConfigs.length})`
            : projectType?.name || "Standard"}
        </Badge>
        <div
          className={cn(
            "p-2 rounded-full transition-all duration-500",
            isSelected
              ? "bg-black/10"
              : "bg-white/5 group-hover:bg-primary/10",
          )}
        >
          {isSelected ? (
            <CheckCircle2 className="h-5 w-5 text-black" />
          ) : (
            <ChevronRight className="h-5 w-5 text-white/20 group-hover:text-primary" />
          )}
        </div>
      </div>

      <div className="space-y-4 relative z-10 flex-1">
        <div className="space-y-2">
          <h3
            className={cn(
              "text-lg font-black uppercase tracking-tight leading-tight",
              isSelected ? "text-black" : "text-white group-hover:text-primary transition-colors",
            )}
          >
            {pkg.name}
          </h3>
          {pkg.description && (
            <p
              className={cn(
                "text-sm font-medium leading-relaxed line-clamp-3",
                isSelected ? "text-black/60" : "text-white/40",
              )}
            >
              {pkg.description}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 pt-6 relative z-10 w-full border-t border-dashed transition-colors duration-300 border-opacity-20 flex items-end justify-between"
           style={{ borderColor: isSelected ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)" }}
      >
        <div className="flex flex-col">
          <span
            className={cn(
              "text-[9px] font-black uppercase tracking-widest mb-1",
               isSelected ? "text-black/40" : "text-white/20"
            )}
          >
            Starts From
          </span>
          <span
            className={cn(
              "text-2xl font-black tracking-tighter",
               isSelected ? "text-black" : "text-white"
            )}
          >
            ₹{startingPrice.toLocaleString()}
          </span>
        </div>
      </div>
    </button>
  );
}
