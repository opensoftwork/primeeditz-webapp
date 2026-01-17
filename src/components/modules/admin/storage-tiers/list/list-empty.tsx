"use client";

import { motion } from "motion/react";
import { HardDrive, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ListEmptyProps {
  onCreate: () => void;
}

export function ListEmpty({ onCreate }: ListEmptyProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-20 rounded-[2rem] border border-dashed border-white/10 bg-white/2 space-y-6 text-center"
    >
      <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center relative">
        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
        <HardDrive className="h-8 w-8 text-primary relative z-10" />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-xl font-black text-white uppercase tracking-tight">
          No Storage Tiers Found
        </h3>
        <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] max-w-[300px]">
          Start by creating a storage plan to define capacity and pricing for your clients.
        </p>
      </div>

      <Button
        onClick={onCreate}
        className="bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] text-[10px] h-11 px-8 rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
      >
        <Plus className="mr-2 h-4 w-4" />
        Create First Tier
      </Button>
    </motion.div>
  );
}
