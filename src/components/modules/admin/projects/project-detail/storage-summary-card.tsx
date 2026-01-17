"use client";

import { HardDrive, Database, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StorageSummaryCardProps {
  totalGB: number;
  allocatedGB: number;
  usedGB?: number;
  fromQuotation?: string;
  className?: string;
  variant?: "project" | "quotation";
}

function formatGB(gb: number): string {
  if (gb >= 1000) {
    return `${(gb / 1000).toFixed(1)} TB`;
  }
  return `${gb.toFixed(1)} GB`;
}

export function StorageSummaryCard({
  totalGB,
  allocatedGB,
  usedGB = 0,
  fromQuotation,
  className,
  variant = "project",
}: StorageSummaryCardProps) {
  const remainingGB = totalGB - allocatedGB;
  const allocatedPercent = totalGB > 0 ? (allocatedGB / totalGB) * 100 : 0;
  const usedPercent = allocatedGB > 0 ? (usedGB / allocatedGB) * 100 : 0;

  const isLow = remainingGB < totalGB * 0.2; // Less than 20% remaining
  const isCritical = remainingGB < totalGB * 0.1; // Less than 10% remaining

  return (
    <div className={cn(
      "p-6 rounded-2xl border space-y-4",
      "bg-linear-to-br from-white/5 to-white/2 border-white/10",
      className
    )}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className={cn(
          "p-2.5 rounded-xl",
          isCritical 
            ? "bg-red-500/10" 
            : isLow 
            ? "bg-amber-500/10" 
            : "bg-emerald-500/10"
        )}>
          <HardDrive className={cn(
            "h-5 w-5",
            isCritical 
              ? "text-red-500" 
              : isLow 
              ? "text-amber-500" 
              : "text-emerald-500"
          )} />
        </div>
        <div>
          <h3 className="text-white font-black uppercase tracking-tight text-sm">
            {variant === "project" ? "Project Storage" : "Storage Allocation"}
          </h3>
          {fromQuotation && (
            <p className="text-white/40 text-[10px] font-medium uppercase tracking-wider">
              From {fromQuotation}
            </p>
          )}
        </div>
      </div>

      {/* Main Stats */}
      <div className="space-y-3">
        {/* Progress Bar - Allocated/Total */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/40 font-medium uppercase tracking-wider">
              {variant === "project" ? "Allocated" : "Allocated to Projects"}
            </span>
            <span className="text-white font-bold">
              {formatGB(allocatedGB)} / {formatGB(totalGB)}
            </span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                isCritical 
                  ? "bg-red-500" 
                  : isLow 
                  ? "bg-amber-500" 
                  : "bg-emerald-500"
              )}
              style={{ width: `${Math.min(allocatedPercent, 100)}%` }}
            />
          </div>
        </div>

        {/* Used (for project variant) */}
        {variant === "project" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/40 font-medium uppercase tracking-wider">
                Used
              </span>
              <span className="text-white/80 font-medium">
                {formatGB(usedGB)} / {formatGB(allocatedGB)}
              </span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary/60 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(usedPercent, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Summary Row */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <div className="flex items-center gap-2">
          {isCritical ? (
            <TrendingDown className="h-3.5 w-3.5 text-red-500" />
          ) : (
            <Database className="h-3.5 w-3.5 text-white/30" />
          )}
          <span className="text-white/40 text-xs font-medium uppercase tracking-wider">
            Remaining
          </span>
        </div>
        <span className={cn(
          "font-bold text-sm",
          isCritical 
            ? "text-red-500" 
            : isLow 
            ? "text-amber-500" 
            : "text-emerald-500"
        )}>
          {formatGB(remainingGB)}
        </span>
      </div>
    </div>
  );
}
