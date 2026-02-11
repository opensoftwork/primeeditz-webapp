"use client";

import type { CellContext, ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, Calendar, Clock, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "eventName",
    header: "Project Details",
    cell: ({ row }: CellContext<any, any>) => {
      const project = row.original;
      return (
        <div className="flex items-center gap-4">
          <div className="h-11 w-11 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/10 group-hover:border-indigo-500/30 transition-all duration-500 shrink-0">
            <LayoutGrid className="h-5 w-5 text-indigo-400/40 group-hover:text-indigo-400 transition-colors" />
          </div>
          <div className="space-y-1">
            <div className="text-sm font-black uppercase tracking-tight text-white group-hover:text-indigo-400 transition-colors">
              {project.eventName || "Untitled Project"}
            </div>
            <div className="flex items-center gap-3 text-[10px] font-bold text-white/30 uppercase tracking-widest">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                {project.projectTypeName}
              </span>
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "code",
    header: "Project ID",
    cell: ({ row }: CellContext<any, any>) => (
      <span className="font-mono text-[10px] font-bold text-white/50 bg-white/2 py-1 px-2.5 rounded-lg border border-white/5">
        {row.getValue("code")}
      </span>
    ),
  },
  {
    accessorKey: "actionState",
    header: "Status",
    cell: ({ row }: CellContext<any, any>) => {
      const state = row.getValue("actionState") as string;
      const isWip = state === "work_in_progress";
      return (
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "h-1.5 w-1.5 rounded-full animate-pulse",
              isWip ? "bg-indigo-400" : "bg-amber-400",
            )}
          />
          <span
            className={cn(
              "text-[10px] font-black uppercase tracking-widest",
              isWip ? "text-indigo-400" : "text-amber-400",
            )}
          >
            {state.replace(/_/g, " ")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "updatedAt",
    header: "Last Active",
    cell: ({ row }: CellContext<any, any>) => (
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30">
        <Calendar className="h-3 w-3" />
        {formatDistanceToNow(new Date(row.getValue("updatedAt")), {
          addSuffix: true,
        })}
      </div>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }: CellContext<any, any>) => (
      <div className="flex justify-end pr-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-9 rounded-xl border border-white/5 bg-white/2 hover:bg-indigo-500 hover:text-white transition-all group/btn"
          asChild
        >
          <Link href={`/assigned-work/${row.original._id}`}>
            <span className="text-[10px] font-black uppercase tracking-widest mr-2">
              Review Work
            </span>
            <ArrowRight className="h-3.5 w-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
          </Link>
        </Button>
      </div>
    ),
  },
];
