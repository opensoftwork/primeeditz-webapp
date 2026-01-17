"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { QuotationCard } from "../shared/quotation-card";
import { QuotationListSkeleton } from "./quotation-list-skeleton";
import { Receipt, Search, Filter, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export function ClientQuotationList() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const quotations = useQuery(api.functions.quotations.queries.getMyQuotations);

  if (quotations === undefined) {
    return <QuotationListSkeleton />;
  }

  const filteredQuotations = quotations.filter((q) => {
    const matchesSearch =
      q.code.toLowerCase().includes(search.toLowerCase()) ||
      q.projectName?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen p-6 md:p-12 space-y-12 w-full">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-[1.5rem] bg-primary/10 border border-primary/20 flex items-center justify-center shadow-2xl shadow-primary/10">
              <Receipt className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white uppercase tracking-tighter">
                My Quotations
              </h1>
              <p className="text-xs font-bold text-white/80 uppercase tracking-widest mt-1">
                Review and manage your project proposals
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-72 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search by code or project..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-12 bg-white/2 border-white/5 rounded-2xl text-xs font-bold text-white placeholder:text-white/10 focus:bg-white/5 focus:border-primary/20 transition-all"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48 h-12 bg-white/2 border-white/5 rounded-2xl text-xs font-bold text-white focus:bg-white/5 focus:border-primary/20 transition-all">
              <div className="flex items-center gap-2">
                <Filter className="h-3.5 w-3.5 text-white/20" />
                <SelectValue placeholder="All Status" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 border-white/10 rounded-2xl outline-hidden">
              <SelectItem
                value="all"
                className="text-xs font-bold uppercase tracking-widest text-white/60 focus:text-white"
              >
                All Quotations
              </SelectItem>
              <SelectItem
                value="sent"
                className="text-xs font-bold uppercase tracking-widest text-white/60 focus:text-white"
              >
                Pending
              </SelectItem>
              <SelectItem
                value="approved"
                className="text-xs font-bold uppercase tracking-widest text-white/60 focus:text-white"
              >
                Accepted
              </SelectItem>
              <SelectItem
                value="changes_requested"
                className="text-xs font-bold uppercase tracking-widest text-white/60 focus:text-white"
              >
                Revision
              </SelectItem>
              <SelectItem
                value="rejected"
                className="text-xs font-bold uppercase tracking-widest text-white/60 focus:text-white"
              >
                Declined
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid Section */}
      {filteredQuotations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredQuotations.map((quotation, index) => (
              <motion.div
                key={quotation._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
              >
                <QuotationCard quotation={quotation as any} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="min-h-[400px] flex flex-col items-center justify-center rounded-[3rem] border border-dashed border-white/5 bg-white/1">
          <div className="h-20 w-20 rounded-3xl bg-white/2 flex items-center justify-center mb-6">
            <Receipt className="h-10 w-10 text-white/10" />
          </div>
          <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">
            No quotations found
          </h3>
          <p className="text-xs font-bold text-white/20 uppercase tracking-widest">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  );
}
