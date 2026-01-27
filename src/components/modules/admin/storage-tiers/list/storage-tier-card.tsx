"use client";

import { Edit2, HardDrive, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StorageTier {
  _id: string;
  name: string;
  sizeGB: number;
  priceINR: number;
  isActive: boolean;
}

interface StorageTierCardProps {
  tier: StorageTier;
  onEdit: (tier: StorageTier) => void;
  onToggleStatus: (id: string, current: boolean, name: string) => void;
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
  onToggleStatus,
  onDelete,
}: StorageTierCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
    >
      <Card className="group relative overflow-hidden border-white/5 bg-white/5 backdrop-blur-xl transition-all hover:bg-white/10 rounded-xl p-0">
        {/* Glow Effect */}
        <div className="absolute -right-20 -top-20 h-30 w-40 rounded-full bg-primary/10 blur-3xl transition-opacity group-hover:opacity-100 opacity-0" />

        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
              <HardDrive className="h-5 w-5 text-primary" />
            </div>
            <Badge
              variant={tier.isActive ? "default" : "secondary"}
              className={cn(
                "cursor-pointer text-[9px] h-5 px-2 font-black uppercase tracking-widest",
                tier.isActive
                  ? "bg-primary/20 text-primary hover:bg-primary/30"
                  : "bg-white/5 text-white/40 border-white/5",
              )}
              onClick={(e) => {
                e.preventDefault();
                onToggleStatus(tier._id, tier.isActive, tier.name);
              }}
            >
              {tier.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-black tracking-tight text-white line-clamp-1">
              {tier.name}
            </h3>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-white tracking-tight">
                {formatStorage(tier.sizeGB)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <div className="flex flex-col">
              <span className="text-[9px] text-white/30 font-black uppercase tracking-widest">
                Price
              </span>
              <span className="text-xl font-black text-primary">
                {formatPrice(tier.priceINR)}
              </span>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg border border-white/5 bg-white/5 text-white/40 hover:text-white hover:bg-white/10"
                onClick={() => onEdit(tier)}
                title="Edit Tier"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg border border-white/5 bg-white/5 text-red-500/40 hover:text-red-500 hover:bg-red-500/10"
                onClick={() => onDelete(tier._id, tier.name)}
                title="Delete Tier"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
