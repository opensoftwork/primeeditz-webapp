"use client";

import { motion } from "motion/react";
import { Settings, Activity, FolderTree, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DetailStatsProps {
  projectType: {
    isActive: boolean;
    defaultFolderTemplateId?: string;
  };
  fieldCount: number;
}

export function DetailStats({ projectType, fieldCount }: DetailStatsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-xl relative overflow-hidden group"
    >
      {/* Glow */}
      <div className="absolute -left-20 -bottom-20 h-40 w-40 rounded-full bg-primary/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

      <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.2em] mb-6">
        Type Statistics
      </h3>

      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-primary">
              <Settings className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-white/60">
              Total Fields
            </span>
          </div>
          <span className="text-2xl font-black text-white">{fieldCount}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-primary">
              <Activity className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-white/60">
              Active Status
            </span>
          </div>
          <span
            className={cn(
              "text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded",
              projectType.isActive
                ? "bg-green-500/10 text-green-500"
                : "bg-red-500/10 text-red-500"
            )}
          >
            {projectType.isActive ? "Active" : "Inactive"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-primary">
              <FolderTree className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-white/60">
              Template ID
            </span>
          </div>
          <span className="text-[10px] font-mono text-white/40">
            {projectType.defaultFolderTemplateId ? "Assigned" : "None"}
          </span>
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full mt-8 h-12 border-white/10 bg-white/5 text-white/40 hover:text-white hover:bg-white/10 text-[10px] font-bold uppercase tracking-widest"
      >
        <Settings2 className="mr-2 h-4 w-4" />
        Advanced Settings
      </Button>
    </motion.div>
  );
}
