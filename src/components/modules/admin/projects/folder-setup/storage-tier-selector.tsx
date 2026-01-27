"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useQuery } from "convex/react";
import {
  AlertTriangle,
  Check,
  HardDrive,
  IndianRupee,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StorageTier {
  _id: Id<"storageTiers">;
  name: string;
  sizeGB: number;
  priceINR: number;
}

interface StorageTierSelectorProps {
  selectedTierId: Id<"storageTiers"> | null;
  onSelect: (tier: StorageTier) => void;
  recommendedTierId?: Id<"storageTiers"> | null;
  maxGB?: number; // Maximum GB allowed (from quotation pool)
}

export function StorageTierSelector({
  selectedTierId,
  onSelect,
  recommendedTierId,
  maxGB,
}: StorageTierSelectorProps) {
  const tiers = useQuery(
    api.functions.storageTiers.queries.listActiveStorageTiers,
  );

  if (tiers === undefined) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-white/20" />
      </div>
    );
  }

  if (tiers.length === 0) {
    return (
      <div className="text-center py-6 px-4 rounded-xl bg-white/3 border border-white/5">
        <HardDrive className="h-6 w-6 text-white/20 mx-auto mb-2" />
        <p className="text-white/40 text-sm font-medium">
          No storage tiers available
        </p>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-2">
      {maxGB !== undefined && (
        <p className="text-white/30 text-xs font-medium px-1 mb-3">
          Available from quotation:{" "}
          <span className="text-emerald-500">{maxGB} GB</span>
        </p>
      )}
      <div className="grid gap-2">
        {tiers.map((tier) => {
          const isSelected = selectedTierId === tier._id;
          const isRecommended = recommendedTierId === tier._id;
          const exceedsQuota = maxGB !== undefined && tier.sizeGB > maxGB;

          return (
            <button
              key={tier._id}
              type="button"
              onClick={() => onSelect(tier)}
              className={cn(
                "w-full text-left p-3 rounded-xl border transition-all duration-200",
                isSelected
                  ? exceedsQuota
                    ? "bg-red-500/10 border-red-500/30 ring-2 ring-red-500/20"
                    : "bg-primary/10 border-primary/30 ring-2 ring-primary/20"
                  : exceedsQuota
                    ? "bg-white/2 border-white/5 opacity-60 hover:opacity-80"
                    : "bg-white/3 border-white/5 hover:bg-white/5 hover:border-white/10",
              )}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                      isSelected
                        ? exceedsQuota
                          ? "border-red-500 bg-red-500"
                          : "border-primary bg-primary"
                        : "border-white/20 bg-transparent",
                    )}
                  >
                    {isSelected && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "font-bold text-sm",
                          exceedsQuota ? "text-white/60" : "text-white",
                        )}
                      >
                        {tier.sizeGB} GB
                      </span>
                      <span className="text-white/40 font-medium">—</span>
                      <span className="text-white/60 font-medium text-sm">
                        {tier.name}
                      </span>
                      {isRecommended && (
                        <span className="px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-500 rounded">
                          Recommended
                        </span>
                      )}
                      {exceedsQuota && (
                        <span className="px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider bg-red-500/20 text-red-400 rounded flex items-center gap-1">
                          <AlertTriangle className="h-2.5 w-2.5" />
                          Exceeds
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div
                  className={cn(
                    "flex items-center gap-1 font-bold",
                    exceedsQuota ? "text-white/40" : "text-white/80",
                  )}
                >
                  <IndianRupee className="h-3.5 w-3.5" />
                  <span>{tier.priceINR.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
