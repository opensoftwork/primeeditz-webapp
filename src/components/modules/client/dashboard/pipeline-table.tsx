"use client";

import Link from "next/link";
import { type ColumnDef, type CellContext } from "@tanstack/react-table";
import { Calendar, Hash, Eye, Database, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import { Skeleton } from "@/components/ui/skeleton";
import { StudioStatusBadge } from "../../projects/studio-status-badge";
import { PhaseProgress } from "../../projects/phase-progress";
import { ProjectData } from "./types";

interface PipelineTableProps {
  projects: ProjectData[] | undefined;
}

export function PipelineTable({ projects }: PipelineTableProps) {
  const columns: ColumnDef<ProjectData>[] = [
    {
      accessorKey: "code",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Code" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Hash className="h-3.5 w-3.5 text-primary/40" />
          <span className="text-base font-black tracking-tight text-white">
            {row.getValue("code")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "projectTypeName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => (
        <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest">
          {row.getValue("projectTypeName")}
        </span>
      ),
    },
    {
      accessorKey: "eventName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Event" />
      ),
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="font-bold text-white/60 truncate max-w-[180px]">
            {row.getValue("eventName") || "—"}
          </div>
          {row.original.eventDate && (
            <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest flex items-center gap-1.5">
              <Calendar className="h-3 w-3" />
              {new Date(row.original.eventDate).toLocaleDateString()}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "actionState",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => (
        <StudioStatusBadge status={row.getValue("actionState")} />
      ),
    },
    {
      accessorKey: "phase",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Progress" />
      ),
      cell: ({ row }) => (
        <PhaseProgress currentPhase={row.getValue("phase")} compact={true} />
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
      ),
      cell: ({ row }) => (
        <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
          {new Date(row.getValue("createdAt")).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Link href={`/projects/${row.original._id}`}>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-white/40 hover:text-primary hover:bg-primary/10 rounded-lg"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
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
            isLoading={false}
            emptyTitle="No Projects Found"
            emptyDescription="You haven't submitted any projects yet."
          />
        </div>
      )}
    </div>
  );
}
