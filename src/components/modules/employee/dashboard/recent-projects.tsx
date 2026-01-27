"use client";

import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";
import { CheckCircle2, Database } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { columns } from "./columns";

export function RecentProjects() {
  const projects = useQuery(api.employees.getEmployeeRecentProjects, {
    limit: 5,
  });

  if (projects === undefined) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48 bg-white/5" />
            <Skeleton className="h-3 w-32 bg-white/5" />
          </div>
          <Skeleton className="h-9 w-24 bg-white/5" />
        </div>
        <Skeleton className="h-[400px] rounded-[2.5rem] bg-white/5" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-400/10 border border-indigo-400/30 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            <Database className="h-4 w-4" />
          </div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70 font-mono">
            Active Production Pipeline
          </h3>
        </div>
        <Button
          variant="link"
          className="text-[9px] font-black uppercase tracking-widest text-indigo-400/60 hover:text-indigo-400 transition-colors"
          asChild
        >
          <Link href="/assigned-work">View Full Pipeline</Link>
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="py-20 text-center space-y-6 rounded-[2.5rem] border border-white/5 bg-white/2 relative overflow-hidden group">
          <div className="absolute inset-0 bg-grid-white/[0.01] bg-size-[30px_30px]" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="p-4 rounded-full bg-white/5 border border-white/10 mb-4 group-hover:scale-110 transition-transform duration-500">
              <CheckCircle2 className="h-10 w-10 text-emerald-500/40" />
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight text-white/50">
              Operations Fluid
            </h3>
            <p className="text-[11px] font-bold text-white/30 uppercase tracking-widest mt-2">
              All assigned production tasks have been processed.
            </p>
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-[1.5rem] border border-white/5">
          <DataTable
            columns={columns}
            data={projects}
            className="border-none bg-transparent shadow-none"
          />
        </div>
      )}
    </div>
  );
}
