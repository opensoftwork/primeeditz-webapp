/**
 * DataTable Toolbar
 *
 * Unified toolbar with search, faceted filters, and action buttons.
 * Supports the premium dark glassmorphic aesthetic.
 */

"use client";

import type { Table } from "@tanstack/react-table";
import { Search, X } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { DataTableViewOptions } from "./data-table-view-options";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  search?: {
    column: string;
    placeholder?: string;
  };
  filters?: Array<{
    column: string;
    title: string;
    options: Array<{
      label: string;
      value: string;
      icon?: React.ComponentType<{ className?: string }>;
    }>;
  }>;
  actions?: Array<{
    label: string;
    onClick?: () => void;
    variant?:
      | "default"
      | "outline"
      | "ghost"
      | "link"
      | "destructive"
      | "secondary";
    icon?: React.ComponentType<{ className?: string }>;
  }>;
  customActions?: React.ReactNode;
  isLoading?: boolean;
  columnVisibility?: any;
}

export function DataTableToolbar<TData>({
  table,
  search,
  filters = [],
  actions = [],
  customActions,
  isLoading,
  columnVisibility,
}: DataTableToolbarProps<TData>) {
  const columnFilters = table.getState().columnFilters;
  const isFiltered = columnFilters.length > 0;

  // Local state for immediate search feedback
  const [localSearchValue, setLocalSearchValue] = React.useState("");

  // Sync with column filter value
  React.useEffect(() => {
    if (search) {
      const column = table.getColumn(search.column);
      const filterValue = column?.getFilterValue();
      setLocalSearchValue((filterValue as string) ?? "");
    }
  }, [search, table, columnFilters]);

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-3">
        {/* Search Input */}
        {search &&
          (() => {
            const column = table.getColumn(search.column);
            if (!column) return null;

            return (
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/20" />
                <Input
                  placeholder={
                    search.placeholder || `Filter ${search.column}...`
                  }
                  value={localSearchValue}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    const newValue = event.target.value;
                    setLocalSearchValue(newValue);
                    column.setFilterValue(newValue || undefined);
                  }}
                  disabled={isLoading}
                  className="pl-11 h-11 bg-white/5 border-white/10 text-xs font-bold uppercase tracking-widest placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-primary/50 focus:bg-white/10 transition-all rounded-xl"
                />
              </div>
            );
          })()}

        {/* Faceted Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((filter) => {
            const column = table.getColumn(filter.column);
            if (!column) return null;
            return (
              <DataTableFacetedFilter
                key={filter.column}
                column={column}
                title={filter.title}
                options={filter.options}
              />
            );
          })}
          {isFiltered && (
            <Button
              variant="ghost"
              onClick={() => table.resetColumnFilters()}
              disabled={isLoading}
              className="h-10 px-3 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/10 rounded-xl gap-2"
            >
              Reset
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Right Side: View Options & Actions */}
      <div className="flex flex-wrap items-center gap-2">
        {customActions}
        <DataTableViewOptions
          table={table}
          columnVisibility={columnVisibility}
        />
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Button
              key={`${action.label}-${index}`}
              variant={action.variant || "outline"}
              size="sm"
              onClick={action.onClick}
              className="h-10 text-[10px] font-black uppercase tracking-widest rounded-xl gap-2"
            >
              {Icon && <Icon className="h-4 w-4" />}
              {action.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
