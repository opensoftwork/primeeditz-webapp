"use client";

import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";
import { ArrowRight, CheckCircle2, Receipt } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { QuotationCard } from "@/components/modules/studio/quotations/shared/quotation-card";

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
        <div className="flex items-center justify-between px-2">
          <Skeleton className="h-8 w-48 bg-white/5" />
          <Skeleton className="h-8 w-24 bg-white/5" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              className="h-64 rounded-[2.5rem] bg-white/5 border border-white/5"
            />
          ))}
        </div>
      </div>
    );
  }

  const { quotations, totalCount } = pendingQuotations;

  // If no pending quotations, show empty state
  if (quotations.length === 0) {
    return null; // Keep it clean if nothing to review
  }

  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Receipt className="h-5 w-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-xl font-black text-white uppercase tracking-tighter">
              Review Quotations
            </h2>
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">
              {totalCount} total • Action required on pending
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white group"
          asChild
        >
          <Link href="/quotations">
            View All
            <ArrowRight className="ml-2 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quotations.map((quotation, index) => (
          <motion.div
            key={quotation._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <QuotationCard quotation={quotation as any} variant="tall" />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
