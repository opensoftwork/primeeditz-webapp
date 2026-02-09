"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Briefcase, Check, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { AvailabilityRibbon } from "./availability-ribbon";
import { HeatBar } from "./heat-bar";

export interface EmployeeWithWorkload {
  _id: string;
  name: string;
  email: string;
  role: string;
  designation?: string;
  image?: string;
  activeProjects: number;
  maxCapacity: number;
}

export const columns: ColumnDef<EmployeeWithWorkload>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="border-white/20 bg-white/5 data-[state=checked]:bg-primary data-[state=checked]:text-black"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="border-white/20 bg-white/5 data-[state=checked]:bg-primary data-[state=checked]:text-black"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: () => (
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
        Professional
      </span>
    ),
    cell: ({ row }) => {
      const employee = row.original;
      return (
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Avatar className="h-10 w-10 border border-white/5 bg-zinc-900 group-hover:border-primary/50 transition-colors">
              <AvatarImage src={employee.image} />
              <AvatarFallback className="bg-white/5 text-[10px] font-black text-white/40">
                {employee.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {row.getIsSelected() && (
              <div className="absolute -top-1 -right-1 bg-primary rounded-full p-0.5 border-2 border-zinc-950">
                <Check className="h-2 w-2 text-black stroke-[4px]" />
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <span
              className={cn(
                "text-sm font-bold transition-colors",
                row.getIsSelected() ? "text-primary" : "text-white",
              )}
            >
              {employee.name}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                {employee.designation || "Creative Staff"}
              </span>
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "activeProjects",
    header: () => (
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
        Current Load
      </span>
    ),
    cell: ({ row }) => (
      <HeatBar
        current={row.original.activeProjects}
        max={row.original.maxCapacity}
      />
    ),
  },
  /*  {
    id: "availability",
    header: () => (
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
        Schedule Preview
      </span>
    ),
    cell: () => <AvailabilityRibbon />,
  }, */
  {
    accessorKey: "email",
    header: () => (
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
        Contact
      </span>
    ),
    cell: ({ row }) => (
      <span className="text-xs font-medium text-white/30 lowercase">
        {row.original.email}
      </span>
    ),
  },
];
