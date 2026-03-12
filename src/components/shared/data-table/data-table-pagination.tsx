/**
 * DataTable Pagination
 *
 * Premium pagination controls for data tables.
 * Supports both TanStack Table client-side and server-side pagination modes.
 *
 * Client-side mode uses direct React state control via clientPagination prop
 * for reliable state updates (bypassing table.setPageSize/nextPage/previousPage).
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

const PAGE_SIZE_OPTIONS = [5, 10, 15, 20, 25, 50];

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
  // Client-side pagination direct state control
  clientPagination?: {
    pageSize: number;
    pageIndex: number;
    totalPages: number;
    canPrevPage: boolean;
    canNextPage: boolean;
    setPageSize: (size: number) => void;
    nextPage: () => void;
    prevPage: () => void;
  };
}

function PageSizeSelector({
  currentSize,
  onSizeChange,
}: {
  currentSize: number;
  onSizeChange: (size: number) => void;
}) {
  return (
    <div className="hidden md:flex items-center gap-3 pl-6">
      <span className="text-[10px] font-black uppercase tracking-widest text-white/30">
        Rows
      </span>
      <Select
        value={String(currentSize)}
        onValueChange={(value) => onSizeChange(Number(value))}
      >
        <SelectTrigger className="h-10 w-[80px] bg-white/5 border-white/10 text-xs font-bold rounded-xl">
          <SelectValue placeholder={String(currentSize)} />
        </SelectTrigger>
        <SelectContent side="top" className="bg-zinc-950 border-white/10">
          {PAGE_SIZE_OPTIONS.map((size) => (
            <SelectItem
              key={size}
              value={String(size)}
              className="text-xs focus:bg-white/10"
            >
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function DataTablePagination<TData>({
  table,
  serverPagination,
  clientPagination,
}: DataTablePaginationProps<TData>) {
  const selectedRows = table.getFilteredSelectedRowModel().rows.length;
  const totalRows = table.getFilteredRowModel().rows.length;

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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
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
            <PageSizeSelector
              currentSize={pageSize}
              onSizeChange={setPageSize}
            />
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

  // Client-side pagination mode
  // Use clientPagination (direct React state) if available,
  // otherwise fall back to table methods
  const currentPage = clientPagination
    ? clientPagination.pageIndex + 1
    : table.getState().pagination.pageIndex + 1;

  const totalPages = clientPagination
    ? clientPagination.totalPages
    : table.getPageCount();

  const currentPageSize = clientPagination
    ? clientPagination.pageSize
    : table.getState().pagination.pageSize;

  const canPrevPage = clientPagination
    ? clientPagination.canPrevPage
    : table.getCanPreviousPage();

  const canNextPage = clientPagination
    ? clientPagination.canNextPage
    : table.getCanNextPage();

  const handlePageSizeChange = (size: number) => {
    if (clientPagination) {
      clientPagination.setPageSize(size);
    } else {
      table.setPageSize(size);
    }
  };

  const handlePrevPage = () => {
    if (clientPagination) {
      clientPagination.prevPage();
    } else {
      table.previousPage();
    }
  };

  const handleNextPage = () => {
    if (clientPagination) {
      clientPagination.nextPage();
    } else {
      table.nextPage();
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
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
        <PageSizeSelector
          currentSize={currentPageSize}
          onSizeChange={handlePageSizeChange}
        />
      </div>

      {/* Right: Navigation */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevPage}
          disabled={!canPrevPage}
          className="h-11 px-5 rounded-xl border-white/10 text-white/40 hover:text-white font-black uppercase tracking-widest text-[9px] gap-2 hover:bg-white/5 disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextPage}
          disabled={!canNextPage}
          className="h-11 px-5 rounded-xl border-white/10 text-white/40 hover:text-white font-black uppercase tracking-widest text-[9px] gap-2 hover:bg-white/5 disabled:opacity-30"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
