"use client";

import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";
import { ArrowRight, CheckCircle2, Receipt } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PendingQuotationCard } from "./pending-quotation-card";

/**
 * Admin Dashboard widget showing quotations created by studios pending review.
 * Story: 15.2 - Quotation Review Notification Widget
 */
export function PendingQuotationsSection() {
  const pendingQuotations = useQuery(
    api.functions.quotations.queries.getPendingQuotationsForAdmin,
    { limit: 5 },
  );

  if (pendingQuotations === undefined) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48 bg-white/5" />
          <Skeleton className="h-8 w-24 bg-white/5" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              className="h-40 rounded-2xl bg-white/5 border border-white/5"
            />
          ))}
        </div>
      </div>
    );
  }

  const { quotations, totalCount } = pendingQuotations;

  // If no pending quotations, show empty state
  if (quotations.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/30 text-primary shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <Receipt className="h-4 w-4" />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70 font-mono">
              Review Quotations
            </h3>
          </div>
          <Button
            variant="link"
            className="text-[9px] font-black uppercase tracking-widest text-primary/60 hover:text-primary transition-colors"
            asChild
          >
            <Link href="/quotations">View Full List</Link>
          </Button>
        </div>

        <div className="py-16 text-center space-y-6 rounded-[2.5rem] border border-white/5 bg-white/2 relative overflow-hidden group">
          <div className="absolute inset-0 bg-grid-white/[0.01] bg-size-[30px_30px]" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="p-4 rounded-full bg-white/5 border border-white/10 mb-4 group-hover:scale-110 transition-transform duration-500">
              <CheckCircle2 className="h-10 w-10 text-emerald-500/40" />
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight text-white/50">
              Operations Fluid
            </h3>
            <p className="text-[11px] font-bold text-white/30 uppercase tracking-widest mt-2">
              All quotation reviews have been processed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/30 text-primary shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            <Receipt className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70 font-mono">
              Review Quotations
            </h3>
            <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">
              {totalCount} pending • Action required
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-primary group"
          asChild
        >
          <Link href="/quotations">
            View All
            <ArrowRight className="ml-2 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quotations.map((quotation, index) => (
          <motion.div
            key={quotation._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <PendingQuotationCard quotation={quotation} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
