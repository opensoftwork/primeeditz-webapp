/**
 * DataTable View Options
 *
 * Column visibility toggle dropdown for TanStack Table.
 * Uses explicit columnVisibility prop to ensure reactivity across portals.
 */

"use client";

import type { Table } from "@tanstack/react-table";
import { Check, SlidersHorizontal } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
  columnVisibility?: any;
}

/**
 * Extracts a human-readable title from a column definition
 */
function getColumnTitle(column: any) {
  const header = column.columnDef.header;

  if (typeof header === "function") {
    try {
      const rendered = header({ column });
      if (rendered?.props?.title) {
        return rendered.props.title;
      }
    } catch (e) {}
  }

  if (typeof header === "string") {
    return header;
  }

  const idValue = column.id || "";
  return idValue.replace(/([A-Z])/g, " $1").trim();
}

export function DataTableViewOptions<TData>({
  table,
  columnVisibility,
}: DataTableViewOptionsProps<TData>) {
  // Use visibility state as a local dependency to ensure re-render
  // even though we use column.getIsVisible() for the actual value
  const visibilityString = JSON.stringify(columnVisibility || {});

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
            // Force re-calculation of isVisible based on state change
            const isVisible = column.getIsVisible();
            return (
              <DropdownMenuItem
                key={`${column.id}-${visibilityString}`}
                className={cn(
                  "text-[10px] font-bold uppercase tracking-widest relative pl-8 cursor-pointer focus:bg-white/10",
                  isVisible ? "text-white" : "text-white/40",
                )}
                onSelect={(e) => {
                  e.preventDefault();
                  column.toggleVisibility(!isVisible);
                }}
              >
                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                  {isVisible && <Check className="h-3.5 w-3.5 text-primary" />}
                </span>
                {getColumnTitle(column)}
              </DropdownMenuItem>
            );
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
