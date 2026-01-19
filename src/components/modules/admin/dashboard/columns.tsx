"use client";

import Link from "next/link";
import { type ColumnDef, type CellContext } from "@tanstack/react-table";
import {
  Database,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "eventName",
    header: "Project Details",
    cell: ({ row }: CellContext<any, any>) => {
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
              <Database className="h-2.5 w-2.5" />
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
    cell: ({ row }: CellContext<any, any>) => (
      <span className="font-mono text-[10px] font-bold text-white/60 bg-white/5 py-1 px-2 rounded-md border border-white/5">
        {row.getValue("code")}
      </span>
    ),
  },
  {
    accessorKey: "clientName",
    header: "Client",
    cell: ({ row }: CellContext<any, any>) => (
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-white/80">
          {row.getValue("clientName")}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Submitted",
    cell: ({ row }: CellContext<any, any>) => (
      <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
        {formatDistanceToNow(new Date(row.getValue("createdAt")), {
          addSuffix: true,
        })}
      </span>
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
