/**
 * DataTable View Options
 *
 * Column visibility toggle dropdown for TanStack Table.
 * Premium styling matching the app's dark glassmorphic theme.
 */

"use client";

import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import type { Table } from "@tanstack/react-table";
import { Check, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
}

export function DataTableViewOptions<TData>({
  table,
}: DataTableViewOptionsProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-10 border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white gap-2 rounded-xl"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden lg:inline">Columns</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[180px] bg-zinc-950 border-white/10"
      >
        <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-white/30">
          Toggle Columns
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/5" />
        {table
          .getAllColumns()
          .filter((column) => column.getCanHide())
          .map((column) => {
            // Map known column IDs to friendly titles
            const friendlyTitles: Record<string, string> = {
              name: "Package Name",
              categoryName: "Category",
              projectTypeName: "Project Type",
              isActive: "Status",
              totalValue: "Value",
              items: "Items",
              actions: "Actions",
            };

            const title =
              friendlyTitles[column.id] ||
              (typeof column.columnDef.header === "string"
                ? column.columnDef.header
                : column.id.replace(/([A-Z])/g, " $1").trim());

            return (
              <DropdownMenuItem
                key={column.id}
                className="text-[10px] font-bold uppercase tracking-widest text-white/60 focus:bg-white/10 focus:text-white relative pl-8 cursor-pointer"
                onSelect={(e) => {
                  e.preventDefault();
                  column.toggleVisibility(!column.getIsVisible());
                }}
              >
                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                  {column.getIsVisible() && <Check className="h-4 w-4" />}
                </span>
                {title}
              </DropdownMenuItem>
            );
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
