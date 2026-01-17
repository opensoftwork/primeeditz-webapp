"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { HardDrive, IndianRupee, Check, Loader2 } from "lucide-react";
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
}

export function StorageTierSelector({
  selectedTierId,
  onSelect,
  recommendedTierId,
}: StorageTierSelectorProps) {
  const tiers = useQuery(api.functions.storageTiers.queries.listActiveStorageTiers);

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
    <div className="grid gap-2">
      {tiers.map((tier) => {
        const isSelected = selectedTierId === tier._id;
        const isRecommended = recommendedTierId === tier._id;

        return (
          <button
            key={tier._id}
            type="button"
            onClick={() => onSelect(tier)}
            className={cn(
              "w-full text-left p-3 rounded-xl border transition-all duration-200",
              isSelected
                ? "bg-primary/10 border-primary/30 ring-2 ring-primary/20"
                : "bg-white/3 border-white/5 hover:bg-white/5 hover:border-white/10"
            )}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                    isSelected
                      ? "border-primary bg-primary"
                      : "border-white/20 bg-transparent"
                  )}
                >
                  {isSelected && <Check className="h-3 w-3 text-white" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-sm">
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
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-white/80 font-bold">
                <IndianRupee className="h-3.5 w-3.5" />
                <span>{tier.priceINR.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
