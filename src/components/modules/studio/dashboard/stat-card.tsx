"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { StatCardProps } from "./types";

export function StatCard({
  icon,
  label,
  value,
  description,
  index,
  color = "text-primary",
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="p-6 rounded-[1.5rem] bg-white/4 border border-white/10 relative group hover:bg-white/[0.07] hover:border-white/20 transition-all duration-300 overflow-hidden shadow-xl"
    >
      <div className="absolute -top-2 -right-2 p-6 opacity-5 group-hover:opacity-10 group-hover:rotate-12 transition-all duration-500">
        <div className={cn("scale-[3]", color)}>{icon}</div>
      </div>
      <div className="flex flex-col h-full justify-between space-y-4">
        <div className="flex items-center gap-2">
          <div className={cn("p-1.5 rounded-lg bg-white/5", color)}>{icon}</div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
            {label}
          </span>
        </div>
        <div>
          <h4 className="text-3xl font-black text-white tracking-tighter mb-0.5">
            {value.toString().padStart(2, "0")}
          </h4>
          <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
