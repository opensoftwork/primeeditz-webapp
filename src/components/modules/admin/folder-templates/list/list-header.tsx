"use client";

import { FolderTree, Plus } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

interface ListHeaderProps {
  onCreate: () => void;
  templateCount: number;
}

export function ListHeader({ onCreate, templateCount }: ListHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <FolderTree className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
            Folder Templates
          </h1>
          {templateCount > 0 && (
            <span className="text-white/20 text-xl font-black">
              ({templateCount})
            </span>
          )}
        </div>
        <p className="text-white/40 font-bold uppercase tracking-widest text-[10px]">
          Define standard folder structures for automated project setup and
          consistent asset upload.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Button
          onClick={onCreate}
          className="bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] text-[10px] h-12 px-8 rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Template
        </Button>
      </motion.div>
    </div>
  );
}
