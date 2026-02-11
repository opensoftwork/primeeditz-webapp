"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Hash } from "lucide-react";
import Link from "next/link";
import { DataTableColumnHeader } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { PhaseProgress } from "../phase-progress";
import { StudioStatusBadge } from "../studio-status-badge";
import type { StudioProject } from "./types";

export const columns: ColumnDef<StudioProject>[] = [
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
    filterFn: (row, id, value) => {
      const code = (row.getValue(id) as string).toLowerCase();
      const search = (value as string).toLowerCase();
      return code.includes(search);
    },
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
    filterFn: (row, id, value) => {
      return (value as string[]).includes(row.getValue(id));
    },
  },

  {
    accessorKey: "actionState",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => (
      <StudioStatusBadge status={row.getValue("actionState")} />
    ),
    filterFn: (row, id, value) => {
      return (value as string[]).includes(row.getValue(id));
    },
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
      <Link href={`/projects/${row.original._id}`}>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-white/40 hover:text-primary hover:bg-primary/10 rounded-lg"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </Link>
    ),
  },
];
