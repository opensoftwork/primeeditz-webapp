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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="h-20 w-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
        <HardDrive className="h-10 w-10 text-white/20" />
      </div>
      <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">
        No Storage Tiers
      </h3>
      <p className="text-white/40 font-medium text-sm mb-8 max-w-md">
        Create storage tiers to offer different capacity options to your clients.
        These will appear in quotations and project setup.
      </p>
      <Button
        onClick={onCreate}
        className="bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] text-[10px] h-12 px-8 rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
      >
        <Plus className="mr-2 h-4 w-4" />
        Create First Tier
      </Button>
    </motion.div>
  );
}
