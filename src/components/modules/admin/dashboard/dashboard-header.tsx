"use client";

import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface DashboardHeaderProps {
  userName: string;
}

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-0.5 w-8 bg-cyan-400 shadow-[0_0_10px_#22d3ee] rounded-full" />
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-cyan-400">
            Administrative Command
          </span>
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-3">
            G'day, {userName.split(" ")[0]}
            <Badge
              variant="outline"
              className="border-cyan-400/40 text-cyan-400 uppercase text-[8px] tracking-[0.2em] font-black py-0.5 px-2"
            >
              ADMIN ACCESS
            </Badge>
          </h1>
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
            Live Operations Tracker • {format(new Date(), "MMMM dd, yyyy")}
          </p>
        </div>
      </div>
    </div>
  );
}
