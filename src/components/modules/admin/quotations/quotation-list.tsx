"use client";

import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "motion/react";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DataTable, DataTableSkeleton } from "@/components/shared/data-table";
import { useSimplePaginatedQuery } from "@/hooks/use-simple-paginated-query";
import { columns } from "./columns";
import { QuotationCard } from "./quotation-card";
import { AdminQuotation } from "./list-types";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

/**
 * Admin-facing list of quotations.
 * Uses DataTable for consistent look & feel with Project Vault.
 */
export function QuotationList() {
  const router = useRouter();
  const [pageSize, setPageSize] = useState(15);
  const [statusFilter, setStatusFilter] = useState<
    AdminQuotation["status"] | undefined
  >(undefined);

  const query = useSimplePaginatedQuery(
    api.functions.quotations.queries.getAdminQuotationsPaginated,
    {
      status: statusFilter,
    },
    { initialNumItems: pageSize },
  );

  const quotations: AdminQuotation[] = useMemo(() => {
    if (query.status === "loaded") {
      const results = query as {
        status: "loaded";
        currentResults: { page: AdminQuotation[] };
      };
      return results.currentResults.page;
    }
    return [];
  }, [query]);

  const statusOptions = [
    { label: "Initiated", value: "initiated" },
    { label: "Draft", value: "draft" },
    { label: "Sent", value: "sent" },
    { label: "Viewed", value: "viewed" },
    { label: "Accepted", value: "approved" },
    { label: "Changes Requested", value: "changes_requested" },
    { label: "Rejected", value: "rejected" },
    { label: "Expired", value: "expired" },
    { label: "Superseded", value: "superseded" },
  ];

  const handleInitiateQuotation = () => {
    router.push("/quotations/new");
  };

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
              ADMINISTRATIVE CONTROL
            </span>
            <h1 className="text-4xl xl:text-5xl font-black uppercase tracking-tighter text-white">
              Quotations
            </h1>
          </motion.div>
        </div>
        <DataTableSkeleton rows={6} columns={6} />
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
            ADMINISTRATIVE CONTROL
          </span>
          <h1 className="text-4xl xl:text-5xl font-black uppercase tracking-tighter text-white">
            Quotations
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Button
            onClick={handleInitiateQuotation}
            className="h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[11px] bg-primary text-primary-foreground hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20 gap-2"
          >
            <Plus className="h-4 w-4" />
            NEW QUOTATION
          </Button>
        </motion.div>
      </div>

      <DataTable
        columns={columns}
        data={quotations}
        isLoading={query.isLoading}
        emptyTitle="No Quotations Found"
        emptyDescription="No quotations match your current filters. Try adjusting your search criteria."
        renderCard={(quotation) => <QuotationCard quotation={quotation} />}
        defaultView="table"
        showViewToggle={true}
        toolbar={{
          search: {
            column: "code",
            placeholder: "Search by code or client...",
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
