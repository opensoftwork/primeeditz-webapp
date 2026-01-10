"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { motion } from "motion/react";
import { Wrench, Construction, Timer, LayoutGrid } from "lucide-react";
import { format } from "date-fns";

export default function EmployeeDashboard() {
  const profile = useQuery(api.profiles.getMyProfile);

  if (!profile) {
    return (
      <div className="w-full space-y-8 p-6 md:p-12">
        <Skeleton className="h-28 w-1/3 rounded-2xl bg-white/5" />
        <Skeleton className="h-120 rounded-[2.5rem] bg-white/5" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-12 p-6 md:p-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-1 w-8 bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)] rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-400">
              Employee Workspace
            </span>
          </div>
          <div className="space-y-1.5">
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white flex items-center gap-3">
              G'day, {profile.name.split(" ")[0]}
              <Badge
                variant="outline"
                className="border-purple-400/40 text-purple-400 uppercase text-[9px] tracking-[0.2em] font-black py-0.5 px-2"
              >
                STUDIO STAFF
              </Badge>
            </h1>
            <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest">
              Live Production Queue • {format(new Date(), "MMMM dd, yyyy")}
            </p>
          </div>
        </div>
      </div>

      {/* Main Container - In Progress State */}
      <div className="relative py-24 px-8 rounded-[2.5rem] border border-white/5 bg-white/2 overflow-hidden group">
        <div className="absolute inset-0 bg-grid-white/[0.01] bg-size-[40px_40px]" />

        {/* Animated Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-160 h-80 bg-purple-500/10 blur-[100px] rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />

        <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-8 max-w-2xl mx-auto">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex items-center justify-center"
          >
            <div className="relative">
              <div className="p-8 rounded-[2rem] bg-linear-to-br from-white/5 to-white/2 border border-white/10 shadow-2xl relative overflow-hidden group/icon">
                <Construction className="h-16 w-16 text-purple-400 transition-transform duration-700 group-hover/icon:rotate-12" />
                <div className="absolute -inset-1 bg-purple-500/20 blur-xl opacity-0 group-hover/icon:opacity-100 transition-opacity duration-500" />
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute -top-4 -right-4"
              >
                <div className="p-2 rounded-full bg-black border border-white/10 shadow-xl">
                  <Timer className="h-5 w-5 text-purple-500" />
                </div>
              </motion.div>
            </div>
          </motion.div>

          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white">
              Studio Workspace <br />{" "}
              <span className="text-purple-400">Under Construction</span>
            </h2>
            <p className="text-sm md:text-base font-bold text-white/40 uppercase tracking-widest max-w-lg mx-auto leading-relaxed">
              We are currently forging the high-performance production tools for
              our team. The Employee Dashboard will serve as your mission
              control for task management, asset delivery, and collaboration.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full max-w-lg mt-8">
            <div className="p-4 rounded-xl border border-white/5 bg-white/2 flex flex-col items-center gap-2">
              <LayoutGrid className="h-4 w-4 text-white/20" />
              <span className="text-[9px] font-black uppercase tracking-widest text-white/30">
                Task Grid
              </span>
            </div>
            <div className="p-4 rounded-xl border border-white/5 bg-white/2 flex flex-col items-center gap-2">
              <Wrench className="h-4 w-4 text-white/20" />
              <span className="text-[9px] font-black uppercase tracking-widest text-white/30">
                Asset Forge
              </span>
            </div>
            <div className="p-4 rounded-xl border border-white/5 bg-white/2 flex flex-col items-center gap-2 md:col-span-1 col-span-2">
              <Timer className="h-4 w-4 text-white/20" />
              <span className="text-[9px] font-black uppercase tracking-widest text-white/30">
                Timeline Sync
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
