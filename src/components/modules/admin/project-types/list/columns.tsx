"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Boxes, Tag } from "lucide-react";
import { DataTableColumnHeader } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ProjectActions } from "./project-actions";
import type { AdminProjectType } from "./types";

export function getColumns(
  onEdit: (type: AdminProjectType) => void,
): ColumnDef<AdminProjectType>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type Name" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
            <Boxes className="h-4 w-4 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black tracking-tight text-white uppercase group-hover:text-primary transition-colors">
              {row.getValue("name")}
            </span>
            {row.original.isDraft && (
              <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest mt-0.5">
                Draft Mode
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "categoryName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary/60">
          <Tag className="h-3 w-3" />
          {row.getValue("categoryName") || "Uncategorized"}
        </div>
      ),
      filterFn: (row, id, value) => {
        // If no filter value or empty array, show all rows
        if (!value || (Array.isArray(value) && value.length === 0)) {
          return true;
        }
        return (value as string[]).includes(row.getValue(id));
      },
    },
    {
      accessorKey: "isActive",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean;
        return (
          <Badge
            className={cn(
              "font-black text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-full",
              isActive
                ? "bg-green-500/10 text-green-500 border-green-500/20"
                : "bg-white/5 text-white/40 border-white/5",
            )}
          >
            {isActive ? "ACTIVE" : "INACTIVE"}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        // If no filter value or empty array, show all rows
        if (!value || (Array.isArray(value) && value.length === 0)) {
          return true;
        }
        const rowValue = row.getValue(id);
        const stringVal = String(rowValue);
        return (value as string[]).includes(stringVal);
      },
    },
    {
      id: "actions",
      cell: ({ row }) => <ProjectActions type={row.original} onEdit={onEdit} />,
    },
  ];
}
