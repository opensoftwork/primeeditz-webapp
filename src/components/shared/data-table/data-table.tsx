/**
 * DataTable
 *
 * Core table component built on TanStack Table and shadcn/ui Table.
 * Supports:
 *  - Server-side pagination (Convex cursor-based via useSimplePaginatedQuery)
 *  - Client-side sorting, filtering, and visibility
 *  - Card/Table view toggle
 *  - Premium glassmorphic dark theme
 *  - Motion animations for row transitions
 */

"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { LayoutGrid, List, Search } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";

type ViewMode = "cards" | "table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  emptyIcon?: React.ComponentType<{ className?: string }>;
  emptyTitle?: string;
  emptyDescription?: string;
  // Card view
  renderCard?: (row: TData) => React.ReactNode;
  defaultView?: ViewMode;
  showViewToggle?: boolean;
  // Toolbar configuration
  toolbar?: {
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
  };
  // Server-side pagination (from useSimplePaginatedQuery)
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

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  emptyIcon: EmptyIcon = Search,
  emptyTitle = "No Data Found",
  emptyDescription = "No records match your current filters.",
  renderCard,
  defaultView = "table",
  showViewToggle = false,
  toolbar,
  serverPagination,
}: DataTableProps<TData, TValue>) {
  const [viewMode, setViewMode] = React.useState<ViewMode>(
    renderCard ? (defaultView ?? "cards") : "table",
  );
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    // Note: No getPaginationRowModel - server handles pagination
  });

  const showCards = renderCard && viewMode === "cards";

  return (
    <div className="flex flex-col gap-6">
      {/* Toolbar with optional view toggle */}
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <DataTableToolbar
            table={table}
            search={toolbar?.search}
            filters={toolbar?.filters}
            actions={toolbar?.actions}
            customActions={toolbar?.customActions}
            isLoading={isLoading}
          />
        </div>

        {/* View Toggle - only show on desktop if enabled and renderCard exists */}
        {showViewToggle && renderCard && (
          <div className="hidden lg:flex items-center border border-white/10 rounded-xl p-1 bg-white/5">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-9 w-9 p-0 rounded-lg",
                viewMode === "cards" && "bg-white/10 shadow-sm",
              )}
              onClick={() => setViewMode("cards")}
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="sr-only">Card view</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-9 w-9 p-0 rounded-lg",
                viewMode === "table" && "bg-white/10 shadow-sm",
              )}
              onClick={() => setViewMode("table")}
            >
              <List className="h-4 w-4" />
              <span className="sr-only">Table view</span>
            </Button>
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="h-1 w-full relative overflow-hidden rounded-full bg-white/5">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="absolute inset-0 w-1/3 bg-primary/40 shadow-[0_0_15px_rgba(var(--primary),0.5)]"
          />
        </div>
      )}

      {/* Content Area */}
      <div
        className={cn(
          "transition-opacity duration-200",
          isLoading && "opacity-50 pointer-events-none",
        )}
      >
        {/* Card View */}
        {showCards && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <motion.div
                    key={row.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    {renderCard(row.original)}
                  </motion.div>
                ))
              ) : (
                <motion.div
                  key="empty-state"
                  className="col-span-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <EmptyState
                    icon={EmptyIcon}
                    title={emptyTitle}
                    description={emptyDescription}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Table View */}
        {!showCards && (
          <div className="overflow-hidden rounded-3xl border border-white/5 bg-white/2 overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader className="bg-white/3">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className="hover:bg-transparent border-white/5"
                  >
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        colSpan={header.colSpan}
                        className="font-black text-[10px] uppercase tracking-[0.2em] text-white/30 py-4 px-6"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="popLayout">
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <motion.tr
                        key={row.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                        data-state={row.getIsSelected() && "selected"}
                        className="transition-colors hover:bg-white/3 data-[state=selected]:bg-primary/5 border-b border-white/5 last:border-0 group"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="py-4 px-6">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        ))}
                      </motion.tr>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="p-0">
                        <EmptyState
                          icon={EmptyIcon}
                          title={emptyTitle}
                          description={emptyDescription}
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <DataTablePagination table={table} serverPagination={serverPagination} />
    </div>
  );
}

/**
 * Empty State Component
 */
function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
      <div className="p-6 rounded-full bg-white/5 border border-white/5">
        <Icon className="h-8 w-8 text-white/20" />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-black uppercase tracking-widest text-white/30">
          {title}
        </p>
        <p className="text-xs text-white/15 max-w-md">{description}</p>
      </div>
    </div>
  );
}

/**
 * DataTable Skeleton
 * Use while initial data is loading
 */
export function DataTableSkeleton({
  rows = 5,
  columns = 4,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="space-y-6">
      {/* Toolbar Skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-11 w-80 bg-white/5 rounded-xl" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32 bg-white/5 rounded-xl" />
          <Skeleton className="h-10 w-24 bg-white/5 rounded-xl" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="rounded-3xl border border-white/5 bg-white/2 overflow-hidden">
        <div className="bg-white/3 p-4">
          <div className="flex gap-8">
            {Array.from({ length: columns }).map((_, i) => (
              <Skeleton
                key={`skeleton-header-${i}`}
                className="h-4 w-24 bg-white/5"
              />
            ))}
          </div>
        </div>
        <div className="divide-y divide-white/5">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={`skeleton-row-${i}`} className="flex gap-8 p-6">
              {Array.from({ length: columns }).map((_, j) => (
                <Skeleton
                  key={`skeleton-cell-${i}-${j}`}
                  className="h-5 w-32 bg-white/5"
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Pagination Skeleton */}
      <div className="flex items-center justify-between pt-6 border-t border-white/5">
        <Skeleton className="h-10 w-24 bg-white/5 rounded-xl" />
        <div className="flex gap-2">
          <Skeleton className="h-11 w-28 bg-white/5 rounded-xl" />
          <Skeleton className="h-11 w-20 bg-white/5 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
