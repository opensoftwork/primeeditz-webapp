"use client";

import { motion } from "motion/react";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, Calendar, Clock, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AssignedWorkItem } from "./types";

interface AssignedWorkCardProps {
  item: AssignedWorkItem;
  onView: (id: string) => void;
}

export function AssignedWorkCard({ item, onView }: AssignedWorkCardProps) {
  const isWip =
    item.actionState === "work_in_progress" || item.actionState === "assigned";
  const isPending =
    item.actionState === "awaiting_review" ||
    item.actionState === "deliverables_ready";
  const isActionRequired = item.actionState === "versions_requested";
  const isCompleted =
    item.actionState === "review_approved" ||
    item.actionState === "delivered" ||
    item.actionState === "completed";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onClick={() => onView(item._id)}
      className="group relative cursor-pointer"
    >
      <div className="absolute inset-0 bg-linear-to-br from-indigo-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-4xl" />

      <div className="relative p-6 rounded-4xl border border-white/5 bg-white/2 backdrop-blur-xl group-hover:border-indigo-500/30 transition-all duration-500 overflow-hidden">
        {/* Glow Effect */}
        <div className="absolute -right-12 -top-12 h-32 w-32 bg-indigo-500/10 blur-[60px] group-hover:bg-indigo-500/20 transition-colors duration-500" />

        <div className="flex flex-col gap-6">
          {/* Top Row: Icon and Status */}
          <div className="flex items-center justify-between">
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
              <LayoutGrid className="h-6 w-6 text-indigo-400" />
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
              <div
                className={cn(
                  "h-1.5 w-1.5 rounded-full animate-pulse",
                  isWip
                    ? "bg-indigo-400"
                    : isActionRequired
                      ? "bg-red-400"
                      : isPending
                        ? "bg-amber-400"
                        : isCompleted
                          ? "bg-emerald-400"
                          : "bg-white/40",
                )}
              />
              <span
                className={cn(
                  "text-[8px] font-black uppercase tracking-widest",
                  isWip
                    ? "text-indigo-400"
                    : isActionRequired
                      ? "text-red-400"
                      : isPending
                        ? "text-amber-400"
                        : isCompleted
                          ? "text-emerald-400"
                          : "text-white/40",
                )}
              >
                {item.actionState.replace(/_/g, " ")}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2">
            <h3 className="text-xl font-black uppercase tracking-tight text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
              {item.eventName || "Untitled Project"}
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                <Clock className="h-3 w-3" />
                {item.projectTypeName}
              </div>
              <div className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[9px] font-mono text-white/40 group-hover:text-white/60 transition-colors">
                {item.code}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20">
              <Calendar className="h-3 w-3" />
              {formatDistanceToNow(new Date(item.updatedAt), {
                addSuffix: true,
              })}
            </div>

            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-400 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-500">
              MANAGE
              <ArrowRight className="h-3 w-3" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
