"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export function DashboardHeader() {
  const profile = useQuery(api.profiles.getMyProfile);

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-0.5 w-8 bg-indigo-500 shadow-[0_0_10px_#6366f1] rounded-full" />
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-indigo-400">
            Production Command
          </span>
        </div>
        <div className="space-y-1">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-wrap items-center gap-3"
          >
            <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-white flex items-center gap-3">
              G'day, {profile?.name ? profile.name.split(" ")[0] : "Editor"}
              <Badge
                variant="outline"
                className="border-indigo-500/40 text-indigo-400 uppercase text-[8px] tracking-[0.2em] font-black py-0.5 px-2"
              >
                PRO ACCESS
              </Badge>
            </h1>
          </motion.div>
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
            Production Asset Tracker • {format(new Date(), "MMMM dd, yyyy")}
          </p>
        </div>
      </div>
    </div>
  );
}
