"use client";

import { api } from "@convex/_generated/api";
import { motion } from "motion/react";
import { useState, useMemo } from "react";
import { DataTable, DataTableSkeleton } from "@/components/shared/data-table";
import { useSimplePaginatedQuery } from "@/hooks/use-simple-paginated-query";
import { columns } from "./list/columns";
import { QuotationCard } from "./shared/quotation-card";
import { StudioQuotation } from "./list/types";

/**
 * Studio-facing list of quotations.
 * Uses DataTable for consistent look & feel with Projects module.
 */
export function StudioQuotationsList() {
  const [pageSize, setPageSize] = useState(15);
  const [statusFilter, setStatusFilter] = useState<any>(undefined);

  const query = useSimplePaginatedQuery(
    api.functions.quotations.queries.getMyQuotationsPaginated,
    {
      status: statusFilter,
    },
    { initialNumItems: pageSize },
  );

  const quotations: StudioQuotation[] = useMemo(() => {
    if (query.status === "loaded") {
      const results = query as {
        status: "loaded";
        currentResults: { page: StudioQuotation[] };
      };
      return results.currentResults.page;
    }
    return [];
  }, [query]);

  const statusOptions = [
    { label: "Pending Review", value: "sent" },
    { label: "Viewed", value: "viewed" },
    { label: "Approved", value: "approved" },
    { label: "Changes Requested", value: "changes_requested" },
    { label: "Rejected", value: "rejected" },
    { label: "Expired", value: "expired" },
    { label: "Superseded", value: "superseded" },
  ];

  if (query.status === "loading" && !quotations.length) {
    return (
      <div className="flex-1 p-8 md:p-12 w-full">
        <div className="mb-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">
              OVERVIEW
            </span>
            <h1 className="text-4xl xl:text-5xl font-black uppercase tracking-tighter text-white">
              My Quotations
            </h1>
          </motion.div>
        </div>
        <DataTableSkeleton rows={6} columns={5} />
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 md:p-12 w-full">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">
            OVERVIEW
          </span>
          <h1 className="text-4xl xl:text-5xl font-black uppercase tracking-tighter text-white">
            My Quotations
          </h1>
        </motion.div>
      </div>

      <DataTable
        columns={columns}
        data={quotations}
        isLoading={query.isLoading}
        emptyTitle="No Quotations Found"
        emptyDescription="When you receive quotations for your projects, they will appear here for your review."
        renderCard={(quotation) => (
          <QuotationCard quotation={quotation as any} />
        )}
        defaultView="table"
        showViewToggle={true}
        toolbar={{
          search: {
            column: "code",
            placeholder: "Search by quotation code...",
          },
          filters: [
            {
              column: "status",
              title: "Status",
              options: statusOptions,
            },
          ],
        }}
        serverPagination={{
          loadNext: query.loadNext,
          loadPrev: query.loadPrev,
          currentPage: query.currentPageNum,
          isLoading: query.isLoading,
          hasNextPage:
            query.status === "loaded" ? query.nextCursor !== null : false,
          setPageSize: (size) => {
            setPageSize(size);
            query.setPageSize(size);
          },
          pageSize,
        }}
      />
    </div>
  );
}
