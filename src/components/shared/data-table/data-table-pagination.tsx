/**
 * DataTable Pagination
 *
 * Premium server-side pagination controls for Convex cursor-based pagination.
 * Supports both TanStack Table client-side and server-side pagination modes.
 */

"use client";

import type { Table } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  // Server-side pagination props (from useSimplePaginatedQuery)
  serverPagination?: {
    loadNext: (() => void) | null;
    loadPrev: (() => void) | null;
    currentPage: number;
    isLoading: boolean;
    hasNextPage: boolean;
    setPageSize?: (size: number) => void;
    pageSize?: number;
  };
}

export function DataTablePagination<TData>({
  table,
  serverPagination,
}: DataTablePaginationProps<TData>) {
  const totalRows = table.getFilteredRowModel().rows.length;
  const selectedRows = table.getFilteredSelectedRowModel().rows.length;

  // Server-side pagination mode
  if (serverPagination) {
    const {
      loadNext,
      loadPrev,
      currentPage,
      isLoading,
      hasNextPage,
      setPageSize,
      pageSize = 15,
    } = serverPagination;

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-white/5 gap-4">
        {/* Left: Info & Page Size */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 bg-white/5 px-5 py-2.5 rounded-xl border border-white/5">
              Page <span className="text-white">{currentPage}</span>
            </div>
            {selectedRows > 0 && (
              <div className="text-[10px] font-bold text-primary uppercase tracking-widest">
                {selectedRows} selected
              </div>
            )}
          </div>

          {/* Page Size (if setPageSize provided) */}
          {setPageSize && (
            <div className="hidden md:flex items-center gap-3  pl-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/30">
                Rows
              </span>
              <Select
                value={`${pageSize}`}
                onValueChange={(value) => setPageSize(Number(value))}
              >
                <SelectTrigger className="h-10 w-[80px] bg-white/5 border-white/10 text-xs font-bold rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  side="top"
                  className="bg-zinc-950 border-white/10"
                >
                  {[10, 15, 20, 25, 50].map((size) => (
                    <SelectItem
                      key={size}
                      value={`${size}`}
                      className="text-xs focus:bg-white/10"
                    >
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Right: Navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadPrev?.()}
            disabled={!loadPrev || isLoading}
            className="h-11 px-5 rounded-xl border-white/10 text-white/40 hover:text-white font-black uppercase tracking-widest text-[9px] gap-2 hover:bg-white/5 disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadNext?.()}
            disabled={!loadNext || !hasNextPage || isLoading}
            className="h-11 px-5 rounded-xl border-white/10 text-white/40 hover:text-white font-black uppercase tracking-widest text-[9px] gap-2 hover:bg-white/5 disabled:opacity-30"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Client-side pagination mode (TanStack Table default)
  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-white/5 gap-4">
      {/* Left: Info & Page Size */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 bg-white/5 px-5 py-2.5 rounded-xl border border-white/5">
            Page <span className="text-white">{currentPage}</span> of{" "}
            <span className="text-white">{totalPages}</span>
          </div>
          {selectedRows > 0 && (
            <div className="text-[10px] font-bold text-primary uppercase tracking-widest">
              {selectedRows} of {totalRows} selected
            </div>
          )}
        </div>

        {/* Page Size */}
        <div className="hidden md:flex items-center gap-3 border-l border-white/5 pl-6">
          <span className="text-[10px] font-black uppercase tracking-widest text-white/30">
            Rows
          </span>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="h-10 w-[80px] bg-white/5 border-white/10 text-xs font-bold rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top" className="bg-zinc-950 border-white/10">
              {[10, 15, 20, 25, 50].map((size) => (
                <SelectItem
                  key={size}
                  value={`${size}`}
                  className="text-xs focus:bg-white/10"
                >
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Right: Navigation */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="h-11 px-5 rounded-xl border-white/10 text-white/40 hover:text-white font-black uppercase tracking-widest text-[9px] gap-2 hover:bg-white/5 disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="h-11 px-5 rounded-xl border-white/10 text-white/40 hover:text-white font-black uppercase tracking-widest text-[9px] gap-2 hover:bg-white/5 disabled:opacity-30"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
