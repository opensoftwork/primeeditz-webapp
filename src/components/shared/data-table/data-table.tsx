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
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  type Table as TanStackTable,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { LayoutGrid, List, Search } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import * as React from "react";
import { createPortal } from "react-dom";

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
  onRowClick?: (row: TData) => void;
  className?: string;
  rowSelection?: Record<string, boolean>;
  onRowSelectionChange?: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  table?: TanStackTable<TData>;
  getRowId?: (row: TData) => string;
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
  onRowClick,
  className,
  rowSelection: propsRowSelection,
  onRowSelectionChange: propsOnRowSelectionChange,
  table: externalTable,
  getRowId,
}: DataTableProps<TData, TValue>) {
  const [viewMode, setViewMode] = React.useState<ViewMode>(
    renderCard ? (defaultView ?? "cards") : "table",
  );

  const [internalRowSelection, setInternalRowSelection] = React.useState({});
  const rowSelection = propsRowSelection ?? internalRowSelection;
  const setRowSelection = propsOnRowSelectionChange ?? setInternalRowSelection;

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: serverPagination?.pageSize ?? 10,
  });

  const internalTable = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId,
    onPaginationChange: setPagination,
    enableRowSelection: true,
    manualPagination: !!serverPagination,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const table = externalTable ?? internalTable;

  const showCards = renderCard && viewMode === "cards";

  return (
    <div className={cn("flex flex-col gap-8", className)}>
      {/* Toolbar with optional view toggle */}
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <DataTableToolbar
            table={table}
            columnVisibility={columnVisibility}
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
          <div className="overflow-hidden rounded-3xl border border-white/5 bg-white/2 overflow-x-auto scrollbar-hide">
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
                        data-slot="table-row"
                        data-state={row.getIsSelected() && "selected"}
                        onClick={(e) => {
                          // Don't fire row click if user clicked an interactive element
                          // (button, link, dropdown, checkbox, etc.)
                          const target = e.target as HTMLElement;
                          const interactive = target.closest(
                            "button, a, [role='menuitem'], [role='checkbox'], [data-slot='dropdown-menu-content']",
                          );
                          if (interactive) return;
                          onRowClick?.(row.original);
                        }}
                        className={cn(
                          "transition-colors hover:bg-white/3 data-[state=selected]:bg-primary/5 border-b border-white/5 last:border-0 group",
                          onRowClick && "cursor-pointer",
                        )}
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
                      <TableCell
                        colSpan={table.getVisibleFlatColumns().length}
                        className="p-0"
                      >
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
      {(() => {
        const paginationContent = (
          <div className="w-full px-8 py-4">
            <DataTablePagination
              table={table}
              serverPagination={serverPagination}
              clientPagination={
                !serverPagination
                  ? (() => {
                      const totalRows = table.getFilteredRowModel().rows.length;
                      const totalPages = Math.max(
                        1,
                        Math.ceil(totalRows / pagination.pageSize),
                      );
                      return {
                        pageSize: pagination.pageSize,
                        pageIndex: pagination.pageIndex,
                        totalPages,
                        canPrevPage: pagination.pageIndex > 0,
                        canNextPage: pagination.pageIndex < totalPages - 1,
                        setPageSize: (size: number) =>
                          setPagination((prev) => ({
                            ...prev,
                            pageSize: size,
                            pageIndex: 0,
                          })),
                        nextPage: () =>
                          setViewMode((prev) => {
                            // Scroll to top when changing page in card view
                            if (prev === "cards") {
                              document
                                .getElementById("layout-main-content")
                                ?.scrollTo({ top: 0, behavior: "smooth" });
                            }
                            setPagination((p) => ({
                              ...p,
                              pageIndex: Math.min(
                                p.pageIndex + 1,
                                totalPages - 1,
                              ),
                            }));
                            return prev;
                          }),
                        prevPage: () =>
                          setViewMode((prev) => {
                            // Scroll to top when changing page in card view
                            if (prev === "cards") {
                              document
                                .getElementById("layout-main-content")
                                ?.scrollTo({ top: 0, behavior: "smooth" });
                            }
                            setPagination((p) => ({
                              ...p,
                              pageIndex: Math.max(p.pageIndex - 1, 0),
                            }));
                            return prev;
                          }),
                      };
                    })()
                  : undefined
              }
            />
          </div>
        );

        // Try to teleport to the global footer if it exists
        if (typeof document !== "undefined") {
          const footer = document.getElementById("layout-sticky-footer");
          if (footer) {
            return createPortal(paginationContent, footer);
          }
        }

        // Fallback to inline rendering if footer doesn't exist (e.g., SSR or specific pages)
        return (
          <div className="mt-auto pt-6" id="data-table-pagination-container">
            {paginationContent}
          </div>
        );
      })()}
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
  viewMode = "table",
  renderCardSkeleton,
}: {
  rows?: number;
  columns?: number;
  viewMode?: "table" | "cards";
  renderCardSkeleton?: () => React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      {/* Toolbar Skeleton */}
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Skeleton className="h-11 w-80 bg-white/5 rounded-xl" />
            <Skeleton className="h-11 w-32 bg-white/5 rounded-xl" />
            <Skeleton className="h-11 w-32 bg-white/5 rounded-xl" />
          </div>
        </div>
        <div className="hidden lg:flex items-center border border-white/10 rounded-xl p-1 bg-white/5">
          <Skeleton className="h-9 w-9 bg-white/10 rounded-lg" />
          <Skeleton className="h-9 w-9 bg-transparent rounded-lg" />
        </div>
      </div>

      {viewMode === "cards" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={`skeleton-card-${i}`}>
              {renderCardSkeleton ? (
                renderCardSkeleton()
              ) : (
                <div className="bg-white/2 border border-white/5 p-6 rounded-3xl space-y-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-xl bg-white/5" />
                      <div className="space-y-2">
                        <Skeleton className="h-3 w-20 bg-white/5" />
                        <Skeleton className="h-3 w-12 bg-white/5" />
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Skeleton className="h-8 w-8 rounded-lg bg-white/5" />
                      <Skeleton className="h-8 w-8 rounded-lg bg-white/5" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-3/4 bg-white/5" />
                    <Skeleton className="h-3 w-1/2 bg-white/5" />
                  </div>
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <Skeleton className="h-4 w-24 bg-white/5" />
                    <Skeleton className="h-8 w-20 rounded-lg bg-white/5" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
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
      )}

      {/* Pagination Skeleton */}
      <div className="flex items-center justify-between pt-6 border-t border-white/5">
        <div className="flex items-center gap-6">
          <Skeleton className="h-10 w-24 bg-white/5 rounded-xl" />
          <Skeleton className="h-10 w-20 bg-white/5 rounded-xl" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-11 w-28 bg-white/5 rounded-xl" />
          <Skeleton className="h-11 w-20 bg-white/5 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
