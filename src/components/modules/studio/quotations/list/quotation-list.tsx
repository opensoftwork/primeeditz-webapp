"use client";

import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { DataTable, DataTableSkeleton } from "@/components/shared/data-table";
import { useSimplePaginatedQuery } from "@/hooks/use-simple-paginated-query";
import { QuotationCard } from "../shared/quotation-card";
import { columns } from "./columns";
import type { StudioQuotation } from "./types";

export function StudioQuotationList() {
  const [pageSize, setPageSize] = useState(15);
  const [statusFilter, setStatusFilter] = useState<any>(undefined);

  const query = useSimplePaginatedQuery(
    // @ts-ignore
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
    { label: "Pending Review", value: "initiated" },
    { label: "Awaiting Response", value: "sent" },
    { label: "Viewed", value: "viewed" },
    { label: "Approved", value: "approved" },
    { label: "Changes Requested", value: "changes_requested" },
    { label: "Rejected", value: "rejected" },
  ];

  if (query.status === "loading" && !quotations.length) {
    return (
      <div className="flex-1 w-full px-8 pt-10 pb-12">
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
    <div className="flex-1 w-full px-8 pt-10 pb-12">
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
        emptyDescription="You haven't received any quotations yet or none match your filters."
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
