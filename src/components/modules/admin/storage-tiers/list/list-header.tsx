"use client";

import { motion } from "motion/react";
import { HardDrive, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ListHeaderProps {
  onCreate: () => void;
  tierCount: number;
}

export function ListHeader({ onCreate, tierCount }: ListHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 w-full">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-1"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center p-2 rounded-lg bg-primary/10 border border-primary/20">
            <HardDrive className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
            Storage Tiers
          </h1>
          {tierCount > 0 && (
            <span className="text-white/20 text-2xl font-black tabular-nums">
              ({tierCount})
            </span>
          )}
        </div>
        <p className="text-white/50 text-xs font-medium max-w-xl">
          Configure storage packages with capacity and pricing for client quotations and automated project fulfillment.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Button
          onClick={onCreate}
          className="bg-primary text-primary-foreground font-bold h-12 px-6 rounded-xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Tier
        </Button>
      </motion.div>
    </div>
  );
}
