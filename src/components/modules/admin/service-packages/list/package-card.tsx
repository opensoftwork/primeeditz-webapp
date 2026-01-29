"use client";

import { MoreHorizontal, Pencil, Copy, Eye, EyeOff, Layout, IndianRupee, Tag, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface PackageCardProps {
  pkg: Doc<"servicePackages">;
  onEdit: (id: Id<"servicePackages">) => void;
  onDuplicate: (id: Id<"servicePackages">) => void;
  onToggleActive: (id: Id<"servicePackages">, currentState: boolean) => void;
  categoryName?: string;
  projectTypeName?: string;
}

export function PackageCard({
  pkg,
  onEdit,
  onDuplicate,
  onToggleActive,
  categoryName,
  projectTypeName,
}: PackageCardProps) {
  // Calculate price range from line items
  const prices = pkg.lineItems.map((item) => item.rate * item.quantity);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.reduce((a, b) => a + b, 0);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="group relative overflow-hidden bg-zinc-900/50 border-white/5 p-6 rounded-[24px] transition-all hover:bg-white/4 hover:border-white/10 hover:shadow-2xl hover:shadow-primary/5">
        {/* Glow Effect */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 blur-[100px] rounded-[24px] group-hover:bg-primary/10 transition-colors" />

        <div className="relative z-10 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
              <Layout className="h-6 w-6 text-primary" />
            </div>
            <div className="flex items-center gap-2">
              <Badge
                className={cn(
                  "font-black text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full",
                  pkg.isActive 
                    ? "bg-green-500/10 text-green-500 border-green-500/20" 
                    : "bg-white/5 text-white/40 border-white/5"
                )}
              >
                {pkg.isActive ? "ACTIVE" : "INACTIVE"}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full border border-white/5 bg-white/5 hover:bg-white/10">
                    <MoreHorizontal className="h-4 w-4 text-white/40" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => onEdit(pkg._id)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Package
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDuplicate(pkg._id)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onToggleActive(pkg._id, pkg.isActive)}
                    className={pkg.isActive ? "text-red-400 focus:text-red-400" : "text-green-400 focus:text-green-400"}
                  >
                    {pkg.isActive ? (
                      <>
                        <EyeOff className="mr-2 h-4 w-4" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <Eye className="mr-2 h-4 w-4" />
                        Activate
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Title & Category */}
          <div className="space-y-2">
            <h3 className="text-xl font-black text-white uppercase tracking-tight line-clamp-1">
              {pkg.name}
            </h3>
            <div className="flex flex-wrap gap-2">
              {categoryName && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest text-white/40">
                  <Tag className="h-2.5 w-2.5" />
                  {categoryName}
                </div>
              )}
              {projectTypeName && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black uppercase tracking-widest text-primary/80">
                  <Layout className="h-2.5 w-2.5" />
                  {projectTypeName}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {pkg.description && (
            <p className="text-sm text-white/40 line-clamp-2 leading-relaxed font-medium">
              {pkg.description}
            </p>
          )}

          {/* Pricing & Summary */}
          <div className="pt-2 flex items-center justify-between border-t border-white/5 mt-auto">
            <div className="space-y-1">
              <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">
                Package Value
              </p>
              <div className="flex items-baseline gap-1">
                <IndianRupee className="h-4 w-4 text-white" />
                <span className="text-2xl font-black text-white tracking-tighter">
                  {maxPrice.toLocaleString()}
                </span>
                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">
                  total
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
               <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">
                Items
              </p>
              <div className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-black text-white/60">
                {pkg.lineItems.length} UNITS
              </div>
            </div>
          </div>

          {/* Configuration Summary Badge */}
          <div className="flex items-center gap-2 px-3 py-2 bg-white/3 rounded-xl border border-white/5">
            <Info className="h-3.5 w-3.5 text-primary/60" />
            <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.05em] line-clamp-1">
              {pkg.lineItems.length > 0 ? pkg.lineItems[0].description : "No items configured"}
            </span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
