/**
 * DataTable Column Header
 *
 * A sortable column header component for TanStack Table.
 * Premium styling with hover effects and sort direction indicators.
 */

"use client";

import type { Column } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-white/10 hover:bg-white/5 font-black uppercase tracking-widest text-[10px] text-white/50 hover:text-white"
          >
            <span>{title}</span>
            {column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-3.5 w-3.5 text-primary" />
            ) : column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-3.5 w-3.5 text-primary" />
            ) : (
              <ChevronsUpDown className="ml-2 h-3.5 w-3.5 opacity-30" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="bg-zinc-950 border-white/10"
        >
          <DropdownMenuItem
            onClick={() => column.toggleSorting(false)}
            className="text-[10px] font-bold uppercase tracking-widest focus:bg-white/10"
          >
            <ArrowUp className="mr-2 h-3.5 w-3.5 text-white/40" />
            Ascending
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => column.toggleSorting(true)}
            className="text-[10px] font-bold uppercase tracking-widest focus:bg-white/10"
          >
            <ArrowDown className="mr-2 h-3.5 w-3.5 text-white/40" />
            Descending
          </DropdownMenuItem>
          {column.getCanHide() && (
            <>
              <DropdownMenuSeparator className="bg-white/5" />
              <DropdownMenuItem
                onSelect={() => column.toggleVisibility(false)}
                className="text-[10px] font-bold uppercase tracking-widest focus:bg-white/10"
              >
                <EyeOff className="mr-2 h-3.5 w-3.5 text-white/40" />
                Hide Column
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
