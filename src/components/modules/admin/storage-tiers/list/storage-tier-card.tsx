"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { Edit2, Eye, EyeOff, HardDrive, Loader2, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMutationWithStatus } from "@/lib/convex-hooks";
import { cn } from "@/lib/utils";
import type { StorageTier } from "./types";

interface StorageTierCardProps {
  tier: StorageTier;
  onEdit: (tier: StorageTier) => void;
  onDelete: (id: string, name: string) => void;
}

function formatStorage(sizeGB: number): string {
  if (sizeGB >= 1000) {
    return `${(sizeGB / 1000).toFixed(sizeGB % 1000 === 0 ? 0 : 1)} TB`;
  }
  return `${sizeGB} GB`;
}

function formatPrice(priceINR: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(priceINR);
}

export function StorageTierCard({
  tier,
  onEdit,
  onDelete,
}: StorageTierCardProps) {
  const toggleStatusMutation = useMutationWithStatus(
    api.functions.storageTiers.mutations.toggleStorageTierActive,
  );

  useEffect(() => {
    if (toggleStatusMutation.isSuccess) {
      toast.success(
        `Storage tier ${tier.isActive ? "deactivated" : "activated"}`,
      );
    }
    if (toggleStatusMutation.isError) {
      toast.error("Failed to update status");
    }
  }, [
    toggleStatusMutation.isSuccess,
    toggleStatusMutation.isError,
    tier.isActive,
  ]);

  const handleToggleStatus = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleStatusMutation.mutate({
      id: tier._id as Id<"storageTiers">,
      isActive: !tier.isActive,
    });
  };

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Card
        onClick={() => onEdit(tier)}
        className="group relative overflow-hidden bg-white/2 border-white/5 p-6 rounded-3xl transition-all hover:bg-white/4 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 cursor-pointer"
      >
        {/* Glow Effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[60px] rounded-full translate-x-16 -translate-y-16 group-hover:bg-primary/10 transition-colors" />

        <div className="relative z-10 space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center group-hover:border-primary/30 transition-colors">
                <HardDrive className="h-5 w-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">
                  STORAGE PLAN
                </span>
                <Badge
                  className={cn(
                    "w-fit font-black text-[7px] uppercase tracking-widest px-1.5 py-0 rounded-md mt-0.5 shadow-none",
                    tier.isActive
                      ? "bg-green-500/10 text-green-500 border-green-500/20"
                      : "bg-white/5 text-white/40 border-white/5",
                  )}
                >
                  {tier.isActive ? "ACTIVE" : "INACTIVE"}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-1.5 transition-all duration-200">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg border border-white/5 bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-90"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(tier);
                }}
                title="Edit Tier"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg border border-white/5 bg-white/5 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 transition-all active:scale-90"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(tier._id, tier.name);
                }}
                title="Delete Tier"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Title Area */}
          <div className="space-y-1">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="text-xl font-black text-white uppercase tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
                {tier.name}
              </h3>
              <div className="text-lg font-black text-white tracking-tight shrink-0">
                {formatStorage(tier.sizeGB)}
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-primary/60">
              Professional Capacity • {formatPrice(tier.priceINR)}
            </div>
          </div>

          {/* Footer Area - Aligned with ProjectTypeCard & PackageCard */}
          <div className="flex items-center justify-between mt-2 pt-2">
            <div className="flex flex-col">
              <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest">
                Current Status
              </span>
              <span
                className={cn(
                  "text-xs font-black uppercase tracking-wider",
                  tier.isActive ? "text-primary" : "text-white/40",
                )}
              >
                {tier.isActive ? "System Live" : "Inactive"}
              </span>
            </div>

            <Button
              onClick={handleToggleStatus}
              disabled={toggleStatusMutation.isPending}
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 px-3 text-[9px] font-black uppercase tracking-widest rounded-lg gap-2 shrink-0 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
                tier.isActive
                  ? "text-red-400/60 bg-red-400/5 hover:text-red-400 hover:bg-red-400/10"
                  : "text-green-400/60 bg-green-400/5 hover:text-green-400 hover:bg-green-400/10",
              )}
            >
              {toggleStatusMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : tier.isActive ? (
                <>
                  DEACTIVATE <EyeOff className="h-3.5 w-3.5" />
                </>
              ) : (
                <>
                  ACTIVATE <Eye className="h-3.5 w-3.5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
