"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  description: string;
  index: number;
  color: string;
  glowColor: string;
}

export function StatCard({
  icon,
  label,
  value,
  description,
  index,
  color,
  glowColor,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className={cn(
        "p-6 rounded-[1.5rem] bg-white/3 border border-white/5 relative group hover:bg-white/5 hover:border-white/10 transition-all duration-500 overflow-hidden shadow-2xl",
        "before:absolute before:inset-0 before:bg-linear-to-b before:from-white/2 before:to-transparent"
      )}
    >
      <div
        className={cn(
          "absolute -top-4 -right-4 p-6 opacity-[0.03] group-hover:opacity-[0.07] group-hover:rotate-12 transition-all duration-700",
          color
        )}
      >
        <div className="scale-[3]">{icon}</div>
      </div>

      <div className="relative z-10 flex flex-col h-full justify-between space-y-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "p-1.5 rounded-lg bg-white/5 border border-white/10 shadow-lg transition-transform duration-500 group-hover:scale-110",
              color,
              glowColor
            )}
          >
            {icon}
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
            {label}
          </span>
        </div>

        <div className="space-y-0.5">
          <h4 className="text-3xl font-black text-white tracking-tighter">
            {value.toString().padStart(2, "0")}
          </h4>
          <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
