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
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <HardDrive className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
            Storage Tiers
          </h1>
          {tierCount > 0 && (
            <span className="text-white/20 text-xl font-black">
              ({tierCount})
            </span>
          )}
        </div>
        <p className="text-white/40 font-bold uppercase tracking-widest text-[10px]">
          Configure storage packages with capacity and pricing for client
          quotations.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Button
          onClick={onCreate}
          className="bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] text-[10px] h-12 px-8 rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Tier
        </Button>
      </motion.div>
    </div>
  );
}
