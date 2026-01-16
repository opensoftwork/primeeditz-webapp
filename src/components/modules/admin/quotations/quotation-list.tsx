"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, FileText, Filter, Receipt } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { QuotationCard } from "./quotation-card";

export function QuotationList() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const quotations = useQuery(api.admin.getAdminQuotations, {
    status:
      statusFilter === "all"
        ? undefined
        : (statusFilter as
            | "draft"
            | "approved"
            | "sent"
            | "viewed"
            | "changes_requested"
            | "rejected"
            | "expired"
            | "superseded"),
  });

  const filteredQuotations = quotations?.filter((q) => {
    const searchLower = search.toLowerCase();
    const matchesSearch =
      !search ||
      q.code.toLowerCase().includes(searchLower) ||
      (q.clientName && q.clientName.toLowerCase().includes(searchLower)) ||
      (q.projectName && q.projectName.toLowerCase().includes(searchLower));
    return matchesSearch;
  });

  if (quotations === undefined) {
    return (
      <div className="p-8 md:p-12 space-y-8 w-full">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-56 bg-white/5" />
            <Skeleton className="h-3 w-40 bg-white/5" />
          </div>
          <Skeleton className="h-12 w-36 bg-white/5 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-64 bg-white/5 rounded-[2rem]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 md:p-12 space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Receipt className="h-5 w-5 text-primary" />
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
              Quotations
            </h1>
          </div>
          <p className="text-white/50 text-xs font-medium">
            Manage professional estimates and client pricing proposals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => router.push("/quotations/new")}
            className="bg-primary text-primary-foreground font-bold h-12 px-6 rounded-xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Quotation
          </Button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 p-1 rounded-xl bg-white/3 border border-white/5">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
          <Input
            placeholder="Search by code, client or project..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 bg-transparent border-none text-white h-11 text-sm font-bold placeholder:text-white/10 focus:ring-0"
          />
        </div>

        <div className="h-6 w-px bg-white/5 self-center hidden md:block" />

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48 bg-transparent border-none text-white h-11 rounded-lg px-4 font-semibold text-xs focus:ring-0">
            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-white/40" />
              <SelectValue placeholder="All Status" />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-zinc-900/95 backdrop-blur-xl border-white/10 text-white">
            <SelectItem value="all" className="text-xs font-semibold">
              All Status
            </SelectItem>
            <SelectItem value="draft" className="text-xs font-bold">
              Draft
            </SelectItem>
            <SelectItem value="sent" className="text-xs font-bold">
              Sent
            </SelectItem>
            <SelectItem value="viewed" className="text-xs font-bold">
              Viewed
            </SelectItem>
            <SelectItem value="approved" className="text-xs font-bold">
              Approved
            </SelectItem>
            <SelectItem value="changes_requested" className="text-xs font-bold">
              Revisions
            </SelectItem>
            <SelectItem value="rejected" className="text-xs font-bold">
              Rejected
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {filteredQuotations?.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex flex-col items-center justify-center p-20 rounded-[2rem] border border-dashed border-white/10 bg-white/2 space-y-4"
          >
            <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center">
              <Receipt className="h-8 w-8 text-white/20" />
            </div>
            <div className="text-center">
              <h3 className="text-white text-lg font-bold">
                {search ? "No matching quotations" : "No quotations found"}
              </h3>
              <p className="text-sm text-white/40 mt-1">
                {search
                  ? "Try adjusting your search criteria"
                  : "Create your first quotation to get started"}
              </p>
            </div>
            {!search && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/quotations/new")}
                className="text-primary border-primary/20 hover:bg-primary/10 font-bold"
              >
                Create First Quotation
              </Button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6"
          >
            {filteredQuotations?.map((quotation, idx) => (
              <motion.div
                key={quotation._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
              >
                <QuotationCard
                  quotation={quotation}
                  onView={(id) => router.push(`/quotations/${id}`)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
