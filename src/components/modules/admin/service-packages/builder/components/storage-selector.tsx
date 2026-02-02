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
  const currentValue = value || "";

  return (
    <Field>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
        {/* No Storage Option */}
        <button
          type="button"
          onClick={() => onChange("")}
          className={cn(
            "relative p-4 rounded-2xl border-2 transition-all cursor-pointer group text-left",
            currentValue === ""
              ? "bg-primary/15 border-primary shadow-[0_0_20px_rgba(var(--primary),0.1)] ring-4 ring-primary/5"
              : "bg-zinc-900/50 border-white/5 hover:bg-white/5 hover:border-white/10",
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "p-2 rounded-xl transition-colors",
                  currentValue === ""
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "bg-white/5 text-white/20",
                )}
              >
                <HardDrive className="h-4 w-4" />
              </div>
              <div>
                <p
                  className={cn(
                    "text-xs font-black uppercase tracking-tight",
                    currentValue === "" ? "text-white" : "text-white/40"
                  )}
                >
                  No Default Tier
                </p>
                <p className="text-[9px] text-white/20 uppercase tracking-widest font-black">
                  On-demand allocation
                </p>
              </div>
            </div>
            {currentValue === "" && (
              <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <Check className="h-3.5 w-3.5 text-primary-foreground font-black" />
              </div>
            )}
          </div>
        </button>

        {/* Storage Tier Options */}
        {tiers.map((tier) => {
          const isSelected = currentValue === tier._id;
          return (
            <button
              key={tier._id}
              type="button"
              onClick={() => onChange(tier._id)}
              className={cn(
                "relative p-4 rounded-2xl border-2 transition-all cursor-pointer group text-left",
                isSelected
                  ? "bg-primary/15 border-primary shadow-[0_0_20px_rgba(var(--primary),0.1)] ring-4 ring-primary/5"
                  : "bg-zinc-900/50 border-white/5 hover:bg-white/5 hover:border-white/10",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "p-2 rounded-xl transition-colors",
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : "bg-white/5 text-white/40",
                    )}
                  >
                    <HardDrive className="h-4 w-4" />
                  </div>
                  <div>
                    <p
                      className={cn(
                        "text-xs font-black uppercase tracking-tight",
                        isSelected ? "text-white" : "text-white/60"
                      )}
                    >
                      {tier.name}
                    </p>
                    <p className="text-[9px] text-white/20 uppercase tracking-widest font-black">
                      {tier.sizeGB}GB Allocation
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn(
                    "text-sm font-black",
                    isSelected ? "text-white" : "text-white/80"
                  )}>
                    ₹{tier.priceINR}
                  </p>
                  {isSelected && (
                    <div className="mt-1 h-6 w-6 rounded-full bg-primary flex items-center justify-center ml-auto shadow-lg shadow-primary/20">
                      <Check className="h-3.5 w-3.5 text-primary-foreground font-black" />
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <FieldDescription className="text-[10px] text-white/20 uppercase tracking-widest font-black mt-4 ml-1">
        Pre-select a storage tier for projects using this package.
      </FieldDescription>
    </Field>
  );
}
