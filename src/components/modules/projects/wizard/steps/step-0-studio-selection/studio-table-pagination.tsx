/**
 * Studio Table Pagination Component
 *
 * Reusable pagination controls for the studio selection table.
 * Features premium styling with page numbers, prev/next buttons,
 * and studio count display.
 */

"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  pageSize: number;
}

interface StudioTablePaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
  itemName?: string;
}

export function StudioTablePagination({
  pagination,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 15, 20, 50],
  className,
  itemName = "studios",
}: StudioTablePaginationProps) {
  const { currentPage, totalPages, totalItems, startIndex, endIndex } =
    pagination;

  // Don't show pagination if there's only one page or no items
  if (totalPages <= 1 && totalItems > 0) {
    return (
      <div
        className={cn("flex items-center justify-center px-8 py-6", className)}
      >
        <div className="text-xs text-white/40 font-medium">
          Showing all {totalItems} {itemName}
        </div>
      </div>
    );
  }

  if (totalItems === 0) {
    return null;
  }

  // Generate page numbers with ellipsis for large page counts
  const getPageNumbers = (): (number | "ellipsis")[] => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("ellipsis");
      }

      // Show pages around current
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push("ellipsis");
      }

      // Always show last page
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div
      className={cn(
        "flex items-center justify-between px-8 py-6 border-t border-white/5",
        className,
      )}
    >
      {/* Info Display */}
      <div className="flex items-center gap-4">
        <div className="text-xs text-white/40 font-medium">
          <span className="text-white/60 font-bold">{startIndex + 1}</span>
          <span className="mx-1">–</span>
          <span className="text-white/60 font-bold">
            {Math.min(endIndex, totalItems)}
          </span>
          <span className="mx-2">of</span>
          <span className="text-primary font-bold">{totalItems}</span>
          <span className="ml-1">{itemName}</span>
        </div>

        {/* Page Size Selector */}
        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/30">Show:</span>
            <div className="flex items-center gap-1">
              {pageSizeOptions.map((size) => (
                <Button
                  key={size}
                  variant="ghost"
                  size="sm"
                  onClick={() => onPageSizeChange(size)}
                  className={cn(
                    "h-6 w-8 p-0 text-[10px] font-bold",
                    pagination.pageSize === size
                      ? "bg-primary/10 text-primary"
                      : "text-white/30 hover:text-white/60 hover:bg-white/5",
                  )}
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center gap-1.5">
        {/* First Page */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="h-8 w-8 p-0 text-white/30 hover:text-white hover:bg-white/5 disabled:opacity-20 disabled:hover:bg-transparent"
          title="First page"
        >
          <ChevronsLeft className="h-3.5 w-3.5" />
        </Button>

        {/* Previous Page */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-8 w-8 p-0 text-white/30 hover:text-white hover:bg-white/5 disabled:opacity-20 disabled:hover:bg-transparent"
          title="Previous page"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1 mx-1">
          {pageNumbers.map((page, index) =>
            page === "ellipsis" ? (
              <span
                key={`ellipsis-${index}`}
                className="w-8 text-center text-xs text-white/20"
              >
                •••
              </span>
            ) : (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "ghost"}
                size="sm"
                onClick={() => onPageChange(page)}
                className={cn(
                  "h-8 w-8 p-0 text-xs font-bold transition-all",
                  currentPage === page
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-white/40 hover:text-white hover:bg-white/5",
                )}
              >
                {page}
              </Button>
            ),
          )}
        </div>

        {/* Next Page */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-8 w-8 p-0 text-white/30 hover:text-white hover:bg-white/5 disabled:opacity-20 disabled:hover:bg-transparent"
          title="Next page"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>

        {/* Last Page */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="h-8 w-8 p-0 text-white/30 hover:text-white hover:bg-white/5 disabled:opacity-20 disabled:hover:bg-transparent"
          title="Last page"
        >
          <ChevronsRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

/**
 * Hook to manage pagination state
 */
export function usePagination(totalItems: number, initialPageSize = 15) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  // Reset to page 1 if current page exceeds total pages
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(1);
  }

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  };

  const setPageSizeAndReset = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  return {
    pagination: {
      currentPage,
      totalPages,
      totalItems,
      startIndex,
      endIndex,
      pageSize,
    },
    goToPage,
    setPageSize: setPageSizeAndReset,
    paginateData: <T,>(data: T[]): T[] => data.slice(startIndex, endIndex),
  };
}

// Need to import useState for the hook
import { useState } from "react";
