"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { HardDrive, IndianRupee } from "lucide-react";
import { DataTableColumnHeader } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { StorageTier } from "./types";

function formatStorage(sizeGB: number): string {
  if (sizeGB >= 1000) {
    return `${(sizeGB / 1000).toFixed(sizeGB % 1000 === 0 ? 0 : 1)} TB`;
  }
  return `${sizeGB} GB`;
}

function formatPrice(priceINR: number): string {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(priceINR);
}

export function getColumns(
  onEdit: (tier: StorageTier) => void,
): ColumnDef<StorageTier>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tier Name" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
            <HardDrive className="h-4 w-4 text-primary" />
          </div>
          <span className="text-sm font-black tracking-tight text-white uppercase group-hover:text-primary transition-colors">
            {row.getValue("name")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "sizeGB",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Capacity" />
      ),
      cell: ({ row }) => (
        <span className="text-lg font-black text-white tracking-tight">
          {formatStorage(row.getValue("sizeGB"))}
        </span>
      ),
    },
    {
      accessorKey: "priceINR",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Price" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-primary font-black">
          <IndianRupee className="h-3.5 w-3.5 opacity-60" />
          <span>{formatPrice(row.getValue("priceINR"))}</span>
        </div>
      ),
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
      cell: ({ row }) => {
        const tier = row.original;
        return (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => onEdit(tier)}
              className="text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-primary transition-colors"
            >
              Edit
            </button>
          </div>
        );
      },
    },
  ];
}
