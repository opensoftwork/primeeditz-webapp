"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Building, Mail, Phone, User, Briefcase } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { OnboardingBadge } from "./status-badge";
import type { AdminEmployee } from "./types";

export const columns: ColumnDef<AdminEmployee>[] = [
  {
    accessorKey: "name",
    header: () => (
      <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
        Employee
      </span>
    ),
    cell: ({ row }) => {
      const employee = row.original;
      return (
        <Link
          href={`/employees/${employee._id}`}
          className="flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center group-hover:border-indigo-500/40 transition-colors">
            <User className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
              {employee.name}
            </span>
            <span className="text-[10px] text-white/40 uppercase tracking-wider">
              ID: {employee._id.slice(-6).toUpperCase()}
            </span>
          </div>
        </Link>
      );
    },
    filterFn: (row, id, value) => {
      const name = row.original.name.toLowerCase();
      const email = row.original.email.toLowerCase();
      const company = row.original.company?.toLowerCase() ?? "";
      const search = value.toLowerCase();
      return (
        name.includes(search) ||
        email.includes(search) ||
        company.includes(search)
      );
    },
  },
  {
    accessorKey: "designation",
    header: () => (
      <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
        Designation
      </span>
    ),
    cell: ({ row }) => {
      const designation = row.original.designation;
      if (!designation) return <span className="text-white/20">—</span>;
      return (
        <div className="flex items-center gap-2">
          <Briefcase className="h-3 w-3 text-white/30" />
          <span className="text-xs font-bold text-white/60 uppercase tracking-wider">
            {designation}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "phone",
    header: () => (
      <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
        Contact
      </span>
    ),
    cell: ({ row }) => {
      const employee = row.original;
      return (
        <div className="space-y-1">
          {employee.phone && (
            <div className="flex items-center gap-2 text-white/40">
              <Phone className="h-3 w-3" />
              <span className="text-xs font-mono">{employee.phone}</span>
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "company",
    header: () => (
      <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
        Company
      </span>
    ),
    cell: ({ row }) => {
      const company = row.original.company;
      if (!company) return <span className="text-white/20">—</span>;
      return (
        <div className="flex items-center gap-2">
          <Building className="h-3 w-3 text-white/30" />
          <span className="text-xs font-bold text-white/50">{company}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const company = row.original.company ?? "Individual";
      return value.includes(company);
    },
  },
  {
    accessorKey: "onboardingComplete",
    header: () => (
      <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
        Status
      </span>
    ),
    cell: ({ row }) => (
      <OnboardingBadge isComplete={row.original.onboardingComplete} />
    ),
    filterFn: (row, id, value) => {
      const isComplete = row.original.onboardingComplete;
      return value.includes(isComplete ? "complete" : "pending");
    },
  },
  {
    accessorKey: "_creationTime",
    header: () => (
      <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
        Joined
      </span>
    ),
    cell: ({ row }) => (
      <span className="text-[10px] font-bold text-white/30 uppercase tracking-wider">
        {new Date(row.original._creationTime).toLocaleDateString()}
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Link href={`/employees/${row.original._id}`}>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-3 text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg"
        >
          View
        </Button>
      </Link>
    ),
  },
];
