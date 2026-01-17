"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { motion } from "motion/react";

interface ListHeaderProps {
  onCreate: () => void;
  templateCount: number;
}

export function ListHeader({ onCreate, templateCount }: ListHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col md:flex-row md:items-end justify-between gap-6"
    >
      <div className="space-y-1">
        <div className="flex items-baseline gap-3">
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter">
            Folder Templates
          </h1>
          <span className="text-primary font-black text-xl italic drop-shadow-[0_0_10px_rgba(var(--primary),0.3)]">
            /{templateCount.toString().padStart(2, "0")}
          </span>
        </div>
        <p className="text-white/40 font-bold uppercase tracking-widest text-[10px]">
          Define standard folder structures for automated project setup.
        </p>
      </div>

      <Button
        onClick={onCreate}
        className="bg-white text-black hover:bg-white/90 font-black uppercase tracking-widest text-[10px] px-8 h-12 rounded-full transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
      >
        <Plus className="mr-2 h-4 w-4 stroke-[3px]" /> Create New Template
      </Button>
    </motion.div>
  );
}
