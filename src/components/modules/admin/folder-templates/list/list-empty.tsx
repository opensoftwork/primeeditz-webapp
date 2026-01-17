"use client";

import { Button } from "@/components/ui/button";
import { FolderPlus, Plus } from "lucide-react";
import { motion } from "motion/react";

interface ListEmptyProps {
  onCreate: () => void;
}

export function ListEmpty({ onCreate }: ListEmptyProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-12 md:p-24 border-2 border-dashed border-white/5 rounded-xl bg-white/2 text-center space-y-6"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
        <FolderPlus className="h-20 w-20 text-white/10 relative z-10" />
      </div>
      
      <div className="space-y-2 max-w-sm">
        <h3 className="text-xl font-black text-white uppercase tracking-tight">
          No Templates Found
        </h3>
        <p className="text-white/40 font-medium text-sm">
          You haven't defined any folder structures yet. Start by creating your first template.
        </p>
      </div>

      <Button
        onClick={onCreate}
        variant="outline"
        className="border-white/10 text-white hover:bg-white/5 font-black uppercase tracking-widest text-[10px] px-8 h-12 rounded-full transition-all"
      >
        <Plus className="mr-2 h-4 w-4 stroke-[3px]" /> Initialize First Template
      </Button>
    </motion.div>
  );
}
