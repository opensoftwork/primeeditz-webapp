"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Calendar, Hash, Eye } from "lucide-react";
import { DataTableColumnHeader } from "@/components/shared/data-table";
import { ClientStatusBadge } from "../client-status-badge";
import { PhaseProgress } from "../phase-progress";
import type { ClientProject } from "./types";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const columns: ColumnDef<ClientProject>[] = [
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
      const eventName = (row.original.eventName || "").toLowerCase();
      const search = (value as string).toLowerCase();
      return code.includes(search) || eventName.includes(search);
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
      <ClientStatusBadge status={row.getValue("actionState")} />
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
