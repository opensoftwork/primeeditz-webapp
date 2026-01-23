/**
 * No Client Content Component
 * Content area shown when "No Client" option is selected
 */

"use client";

import { motion } from "motion/react";
import { FolderOpen, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NoClientContentProps {
  onCancel: () => void;
}

export function NoClientContent({ onCancel }: NoClientContentProps) {
  return (
    <div className="mt-10 space-y-8 px-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-black uppercase tracking-tight text-white">
            Internal Project
          </h3>
          <p className="text-sm text-white/40 font-medium">
            This project will not be associated with a client
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="h-10 px-4 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all"
        >
          <X className="h-4 w-4 mr-2" /> Cancel
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10"
      >
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <FolderOpen className="h-7 w-7 text-amber-400" />
          </div>
          <div>
            <h4 className="text-base font-black text-amber-400 uppercase tracking-tight">
              No Client Association
            </h4>
            <p className="text-sm text-white/40 font-medium mt-1 max-w-md">
              This project will be treated as an internal account. You can
              assign a client later if needed.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
