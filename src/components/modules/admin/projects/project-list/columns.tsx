"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Calendar, Hash, User } from "lucide-react";
import { DataTableColumnHeader } from "@/components/shared/data-table";
import { ProjectActions } from "./project-actions";
import { StatusBadge } from "./status-badge";
import type { AdminProject } from "./types";

export const columns: ColumnDef<AdminProject>[] = [
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
    accessorKey: "clientName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Client" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
          <User className="h-3 w-3 text-white/40" />
        </div>
        <span className="font-bold text-white/80 truncate max-w-[160px]">
          {row.getValue("clientName")}
        </span>
      </div>
    ),
    filterFn: (row, id, value) => {
      const clientName = row.getValue(id) as string;
      const code = row.original.code;
      const search = (value as string).toLowerCase();
      return (
        clientName.toLowerCase().includes(search) ||
        code.toLowerCase().includes(search)
      );
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
    cell: ({ row }) => <StatusBadge status={row.getValue("actionState")} />,
    filterFn: (row, id, value) => {
      return (value as string[]).includes(row.getValue(id));
    },
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
    cell: ({ row }) => {
      const project = row.original;
      return <ProjectActions project={project} />;
    },
  },
];
