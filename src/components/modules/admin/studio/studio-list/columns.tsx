"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Building, Mail, Phone, User } from "lucide-react";
import { DataTableColumnHeader } from "@/components/shared/data-table";
import { OnboardingBadge } from "./status-badge";
import type { AdminStudio } from "./types";
import { StudioActions } from "./studio-actions";

export const columns: ColumnDef<AdminStudio>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
          <User className="h-3.5 w-3.5 text-primary" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-black text-white uppercase tracking-tight">
            {row.getValue("name")}
          </span>
          <span className="text-[10px] text-white/30 font-medium tracking-wider">
            ID: {row.original._id.slice(-6).toUpperCase()}
          </span>
        </div>
      </div>
    ),
    filterFn: (row, id, value) => {
      const name = row.getValue(id) as string;
      const email = row.original.email;
      const company = row.original.company || "";
      const search = (value as string).toLowerCase();
      return (
        name.toLowerCase().includes(search) ||
        email.toLowerCase().includes(search) ||
        company.toLowerCase().includes(search)
      );
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-white/50">
        <Mail className="h-3 w-3" />
        <span className="text-xs font-medium truncate max-w-[200px]">
          {row.getValue("email")}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "company",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Company" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Building className="h-3 w-3 text-white/20" />
        <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">
          {row.getValue("company") || "Individual"}
        </span>
      </div>
    ),
    filterFn: (row, id, value) => {
      const company = row.getValue(id) as string | undefined;
      return (value as string[]).includes(company || "Individual");
    },
  },
  {
    accessorKey: "phone",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phone" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-white/40">
        <Phone className="h-3 w-3" />
        <span className="text-xs font-mono">
          {row.getValue("phone") || "N/A"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "onboardingComplete",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Onboarding" />
    ),
    cell: ({ row }) => (
      <OnboardingBadge isComplete={row.getValue("onboardingComplete")} />
    ),
    filterFn: (row, id, value) => {
      const isComplete = row.getValue(id) as boolean;
      const status = isComplete ? "complete" : "pending";
      return (value as string[]).includes(status);
    },
  },
  {
    accessorKey: "_creationTime",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Joined" />
    ),
    cell: ({ row }) => (
      <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
        {new Date(row.getValue("_creationTime")).toLocaleDateString()}
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <StudioActions studio={row.original} />,
  },
];
