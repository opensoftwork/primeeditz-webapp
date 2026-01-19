"use client";

import Link from "next/link";
import { type ColumnDef, type CellContext } from "@tanstack/react-table";
import { Sparkles, Tag, ArrowRight, Database, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "./status-badge";
import { ProjectData } from "./types";

interface PipelineTableProps {
  projects: ProjectData[] | undefined;
}

export function PipelineTable({ projects }: PipelineTableProps) {
  const columns: ColumnDef<ProjectData>[] = [
    {
      accessorKey: "eventName",
      header: "Project Details",
      cell: ({ row }: CellContext<ProjectData, any>) => {
        const project = row.original;
        return (
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/30 transition-all duration-500 shrink-0">
              <Sparkles className="h-4 w-4 text-white/30 group-hover:text-primary transition-colors" />
            </div>
            <div className="space-y-0.5">
              <div className="text-sm font-black uppercase tracking-tight text-white group-hover:text-primary transition-colors">
                {project.eventName || "Untitled Project"}
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                <Tag className="h-2.5 w-2.5" />
                {project.projectTypeName}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "code",
      header: "Project ID",
      cell: ({ row }: CellContext<ProjectData, any>) => (
        <span className="font-mono text-[10px] font-bold text-white/60 bg-white/5 py-1 px-2 rounded-md border border-white/5">
          {row.getValue("code")}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Current Status",
      cell: ({ row }: CellContext<ProjectData, any>) => (
        <StatusBadge status={row.getValue("status")} />
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }: CellContext<ProjectData, any>) => (
        <div className="flex justify-end pr-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 rounded-lg border border-white/5 bg-white/2 hover:bg-primary hover:text-black transition-all group/btn"
            asChild
          >
            <Link href={`/projects/${row.original._id}`}>
              <span className="text-[10px] font-black uppercase tracking-widest mr-2">
                Details
              </span>
              <ArrowRight className="h-3 w-3 group-hover/btn:translate-x-0.5 transition-transform" />
            </Link>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/30 text-primary">
            <Database className="h-4 w-4" />
          </div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70 font-mono">
            Production Pipeline
          </h3>
        </div>
        {projects && projects.length > 5 && (
          <Button
            variant="link"
            className="text-[9px] font-black uppercase tracking-widest text-primary/60 hover:text-primary transition-colors"
            asChild
          >
            <Link href="/projects">View Archive</Link>
          </Button>
        )}
      </div>

      {projects === undefined ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full rounded-xl bg-white/5" />
          <Skeleton className="h-16 w-full rounded-xl bg-white/5" />
          <Skeleton className="h-16 w-full rounded-xl bg-white/5" />
        </div>
      ) : projects.length === 0 ? (
        <div className="py-20 text-center space-y-6 rounded-[2rem] border border-white/5 bg-white/2 relative overflow-hidden group">
          <div className="absolute inset-0 bg-grid-white/[0.01] bg-size-[30px_30px]" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="p-4 rounded-full bg-white/5 border border-white/10 mb-4 group-hover:scale-110 transition-transform duration-500">
              <Zap className="h-10 w-10 text-white/20" />
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight text-white/50">
              Queue is clear
            </h3>
            <p className="text-[11px] font-bold text-white/30 uppercase tracking-widest mt-2">
              No active projects found.
            </p>
          </div>
        </div>
      ) : (
        <div className="relative">
          <DataTable
            columns={columns}
            data={projects.slice(0, 5)}
            className="border-white/5"
          />
        </div>
      )}
    </div>
  );
}
