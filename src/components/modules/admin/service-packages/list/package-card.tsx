"use client";

import { api } from "@convex/_generated/api";
import type { Doc, Id } from "@convex/_generated/dataModel";
import {
  Copy,
  Eye,
  EyeOff,
  Info,
  Layout,
  Loader2,
  Pencil,
  Tag,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMutationWithStatus } from "@/lib/convex-hooks";
import { cn } from "@/lib/utils";

interface PackageCardProps {
  pkg: Doc<"servicePackages">;
  onView: (id: Id<"servicePackages">) => void;
  onEdit: (id: Id<"servicePackages">) => void;
  onDelete: (id: Id<"servicePackages">, name: string) => void;
  categoryName?: string;
  projectTypeName?: string;
}

export function PackageCard({
  pkg,
  onView,
  onEdit,
  onDelete,
  categoryName,
  projectTypeName,
}: PackageCardProps) {
  const router = useRouter();

  // Mutations with status
  const toggleStatusMutation = useMutationWithStatus(
    api.functions.servicePackages.mutations.toggleActive,
  );

  const duplicateMutation = useMutationWithStatus(
    api.functions.servicePackages.mutations.duplicate,
  );

  // Calculate prices
  const prices = pkg.lineItems.map((item) => item.rate * item.quantity);
  const maxPrice = prices.reduce((a, b) => a + b, 0);

  const handleDuplicate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const newId = await duplicateMutation.mutate({ id: pkg._id });
      toast.success("Package duplicated successfully");
      router.push(`/settings/service-packages/${newId}/edit`);
    } catch (_error) {
      toast.error("Failed to duplicate package");
    }
  };

  const handleToggleStatus = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await toggleStatusMutation.mutate({
        id: pkg._id,
        isActive: !pkg.isActive,
      });
      toast.success(pkg.isActive ? "Package deactivated" : "Package activated");
    } catch (_error) {
      toast.error("Failed to update status");
    }
  };

  return (
    <motion.div 
      whileHover={{ y: -4 }} 
      transition={{ duration: 0.2 }}
      onClick={() => onView(pkg._id)}
      className="cursor-pointer"
    >
      <Card className="group relative overflow-hidden bg-white/2 border-white/5 p-6 rounded-3xl transition-all hover:bg-white/4 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5">
        {/* Glow Effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[60px] rounded-full translate-x-16 -translate-y-16 group-hover:bg-primary/10 transition-colors" />

        <div className="relative z-10 space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center group-hover:border-primary/30 transition-colors">
                <Layout className="h-5 w-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">
                  {projectTypeName || (pkg.projectConfigs?.length ? "Multi-Project" : "General")}
                </span>
                <Badge
                  className={cn(
                    "w-fit font-black text-[7px] uppercase tracking-widest px-1.5 py-0 rounded-md mt-0.5 shadow-none",
                    pkg.isActive
                      ? "bg-green-500/10 text-green-500 border-green-500/20"
                      : "bg-white/5 text-white/40 border-white/5",
                  )}
                >
                  {pkg.isActive ? "ACTIVE" : "INACTIVE"}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-1.5 transition-all duration-200">
              <Button
                onClick={handleDuplicate}
                disabled={duplicateMutation.isPending}
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg border border-white/5 bg-white/5 text-white/20 hover:text-white hover:bg-white/10 transition-all active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Duplicate Package"
              >
                {duplicateMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(pkg._id, pkg.name);
                }}
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg border border-white/5 bg-white/5 text-white/20 hover:text-red-500 hover:bg-red-500/10 transition-all active:scale-90"
                title="Delete Package"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                onClick={handleToggleStatus}
                disabled={toggleStatusMutation.isPending}
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 transition-all active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed",
                  pkg.isActive
                    ? "text-red-400/20 hover:text-red-400 hover:bg-red-400/8"
                    : "text-green-400/20 hover:text-green-400 hover:bg-green-400/8",
                )}
                title={pkg.isActive ? "Deactivate" : "Activate"}
              >
                {toggleStatusMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : pkg.isActive ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>

          {/* Title Area */}
          <div className="space-y-1">
            <h3 className="text-xl font-black text-white uppercase tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
              {pkg.name}
            </h3>
            {categoryName && (
              <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-primary/60">
                <Tag className="h-3 w-3" />
                {categoryName}
              </div>
            )}
          </div>

          {/* Description */}
          {pkg.description ? (
            <p className="text-xs text-white/40 line-clamp-2 leading-relaxed font-medium min-h-8">
              {pkg.description}
            </p>
          ) : (
            <p className="text-xs text-white/10 italic leading-relaxed font-medium min-h-8">
              No description provided for this package.
            </p>
          )}

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-white/2 border border-white/5 space-y-1">
              <span className="text-[8px] font-black text-white/20 uppercase tracking-widest block">
                Total Value
              </span>
              <div className="flex items-baseline gap-1 text-white">
                <span className="text-[10px] font-black opacity-40">₹</span>
                <span className="text-lg font-black tracking-tight">
                  {maxPrice.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white/2 border border-white/5 space-y-1 text-right">
              <span className="text-[8px] font-black text-white/20 uppercase tracking-widest block">
                Items
              </span>
              <div className="text-lg font-black text-white tracking-tight">
                {pkg.lineItems.length.toString().padStart(2, "0")}
                <span className="text-[9px] font-black opacity-30 ml-1 uppercase">
                  Units
                </span>
              </div>
            </div>
          </div>

          {/* Footer Area */}
          <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-2">
            <div className="flex items-center gap-2 overflow-hidden flex-1">
              <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                <Info className="h-3 w-3 text-white/20" />
              </div>
              <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest truncate">
                {pkg.lineItems.length > 0
                  ? pkg.lineItems[0].description
                  : "NOT CONFIGURED"}
              </span>
            </div>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(pkg._id);
              }}
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-primary hover:bg-primary/10 rounded-lg gap-2 shrink-0 transition-all active:scale-95 ml-2"
            >
              Configure <Pencil className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
