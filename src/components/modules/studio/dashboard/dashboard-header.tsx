"use client";

import { format } from "date-fns";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  userName: string;
}

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-0.5 w-8 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.6)]" />
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary">
            Management Portal
          </span>
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-3">
            G'day, {userName.split(" ")[0]}
            <Badge
              variant="outline"
              className="border-primary/40 text-primary uppercase text-[8px] tracking-[0.2em] font-black py-0.5 px-2"
            >
              PRO ACCOUNT
            </Badge>
          </h1>
          <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest">
            Live Production Tracker • {format(new Date(), "MMMM dd, yyyy")}
          </p>
        </div>
      </div>

      <Button
        asChild
        className="group h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-widest text-[10px] transition-all duration-300 shadow-[0_10px_30px_rgba(var(--primary),0.2)] hover:-translate-y-0.5"
      >
        <Link href="/quotations/new">
          <Plus className="mr-2 h-4 w-4 stroke-[3px]" />
          New Request
        </Link>
      </Button>
    </div>
  );
}
