"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Receipt } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { QuotationCard } from "../quotation-card";
import { QuotationListSkeleton } from "./quotation-list-skeleton";

/**
 * Client-facing quotation listing component.
 * Features: Search by code/project, status filtering, and full-width responsive grid.
 */
export function ClientQuotationList() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const quotations = useQuery(api.functions.quotations.queries.getMyQuotations);

  const filteredQuotations = quotations?.filter((q) => {
    const searchLower = search.toLowerCase();
    const matchesSearch =
      !search ||
      q.code.toLowerCase().includes(searchLower) ||
      (q.projectName && q.projectName.toLowerCase().includes(searchLower));

    const matchesStatus = statusFilter === "all" || q.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (quotations === undefined) {
    return <QuotationListSkeleton />;
  }

  return (
    <div className="p-8 md:p-12 space-y-10 w-full">
      {/* Header - High Contrast */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Receipt className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter">
            My Quotations
          </h1>
        </div>
        <p className="text-white/80 text-sm font-bold uppercase tracking-widest ml-13">
          Review and approve your project proposals
        </p>
      </div>

      {/* Control Bar - Premium Glassmorphism */}
      <div className="flex flex-col md:flex-row gap-4 p-2 rounded-2xl bg-white/3 border border-white/10 backdrop-blur-md">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <Input
            placeholder="Search by quotation code or project..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 bg-transparent border-none text-white h-12 text-sm font-bold placeholder:text-white/20 focus:ring-1 focus:ring-white/10 rounded-xl transition-all"
          />
        </div>

        <div className="h-8 w-px bg-white/10 self-center hidden md:block" />

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-56 bg-white/5 border-white/5 text-white h-12 rounded-xl px-4 font-bold text-[10px] uppercase tracking-widest focus:ring-1 focus:ring-white/10 hover:bg-white/10 transition-all">
            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-primary" />
              <SelectValue placeholder="Filter by Status" />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-zinc-950/95 backdrop-blur-2xl border-white/10 text-white rounded-xl shadow-2xl">
            <SelectItem
              value="all"
              className="text-[10px] font-black uppercase tracking-widest hover:bg-white/5 py-3"
            >
              All Status
            </SelectItem>
            <SelectItem
              value="sent"
              className="text-[10px] font-black uppercase tracking-widest text-blue-400 hover:bg-white/5 py-3"
            >
              Sent
            </SelectItem>
            <SelectItem
              value="viewed"
              className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:bg-white/5 py-3"
            >
              Viewed
            </SelectItem>
            <SelectItem
              value="approved"
              className="text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:bg-white/5 py-3"
            >
              Approved
            </SelectItem>
            <SelectItem
              value="changes_requested"
              className="text-[10px] font-black uppercase tracking-widest text-amber-500 hover:bg-white/5 py-3"
            >
              Revisions
            </SelectItem>
            <SelectItem
              value="rejected"
              className="text-[10px] font-black uppercase tracking-widest text-red-400 hover:bg-white/5 py-3"
            >
              Declined
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
            className="flex flex-col items-center justify-center py-32 rounded-[3rem] border-2 border-dashed border-white/5 bg-white/2 space-y-6"
          >
            <div className="h-20 w-20 rounded-[2rem] bg-white/5 flex items-center justify-center border border-white/5">
              <Receipt className="h-10 w-10 text-white/10" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-white text-2xl font-black uppercase tracking-tighter">
                {search ? "No matches found" : "No pending proposals"}
              </h3>
              <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] max-w-xs">
                {search
                  ? "Try searching with a different keyword or quotation code"
                  : "We'll notify you when a new project proposal is ready for review"}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredQuotations?.map((quotation, idx) => (
              <motion.div
                key={quotation._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: idx * 0.05,
                  type: "spring",
                  stiffness: 100,
                  damping: 20,
                }}
              >
                <QuotationCard quotation={quotation as any} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
