"use client";

import type { Doc } from "@convex/_generated/dataModel";
import { Check, HardDrive } from "lucide-react";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";

interface StorageSelectorProps {
  tiers: Doc<"storageTiers">[];
  value: string;
  onChange: (value: string) => void;
}

export function StorageSelector({
  tiers,
  value,
  onChange,
}: StorageSelectorProps) {
  return (
    <Field>
      <FieldLabel className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
        Default Storage Allocation
      </FieldLabel>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
        {/* No Storage Option */}
        <button
          type="button"
          onClick={() => onChange("")}
          className={cn(
            "relative p-4 rounded-xl border transition-all cursor-pointer group text-left",
            value === ""
              ? "bg-primary/10 border-primary shadow-lg shadow-primary/5"
              : "bg-white/5 border-white/5 hover:bg-white/8 hover:border-white/10",
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  value === ""
                    ? "bg-primary/20 text-primary"
                    : "bg-white/5 text-white/20",
                )}
              >
                <HardDrive className="h-4 w-4" />
              </div>
              <div>
                <p
                  className={cn("text-xs font-black uppercase tracking-tight")}
                >
                  No Default Tier
                </p>
                <p className="text-[9px] text-white/40 uppercase tracking-widest font-bold">
                  On-demand allocation
                </p>
              </div>
            </div>
            {value === "" && (
              <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                <Check className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
        </button>

        {/* Storage Tier Options */}
        {tiers.map((tier) => (
          <button
            key={tier._id}
            type="button"
            onClick={() => onChange(tier._id)}
            className={cn(
              "relative p-4 rounded-xl border transition-all cursor-pointer group text-left",
              value === tier._id
                ? "bg-primary/10 border-primary shadow-lg shadow-primary/5"
                : "bg-white/5 border-white/5 hover:bg-white/8 hover:border-white/10",
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    value === tier._id
                      ? "bg-primary/20 text-primary"
                      : "bg-white/5 text-white/40",
                  )}
                >
                  <HardDrive className="h-4 w-4" />
                </div>
                <div>
                  <p
                    className={cn(
                      "text-xs font-black uppercase tracking-tight",
                    )}
                  >
                    {tier.name}
                  </p>
                  <p className="text-[9px] text-white/40 uppercase tracking-widest font-bold">
                    {tier.sizeGB}GB Allocation
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-white">
                  ₹{tier.priceINR}
                </p>
                {value === tier._id && (
                  <div className="mt-1 h-4 w-4 rounded-full bg-primary flex items-center justify-center ml-auto">
                    <Check className="h-2.5 w-2.5 text-white" />
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
      <FieldDescription className="text-[10px] text-white/20 uppercase tracking-widest font-black ml-1">
        Pre-select a storage tier for projects using this package.
      </FieldDescription>
    </Field>
  );
}
