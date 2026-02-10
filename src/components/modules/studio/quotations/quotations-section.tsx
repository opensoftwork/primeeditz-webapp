"use client";

import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";
import { ArrowRight, Receipt } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { QuotationCard } from "./shared/quotation-card";

export function QuotationsSection() {
  const router = useRouter();
  const quotations = useQuery(api.functions.quotations.queries.getMyQuotations);

  if (quotations === undefined) {
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

  // Filter pending/active ones for the top section if many
  const activeQuotations = quotations.slice(0, 3);

  if (quotations.length === 0) {
    return null; // Don't show anything if no quotations yet
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/40 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
            <Receipt className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70 font-mono">
              Review Quotations
            </h3>
            <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">
              {quotations.length} pending • Action required
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          onClick={() => router.push("/quotations")}
          className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white group"
        >
          View All
          <ArrowRight className="ml-2 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeQuotations.map((quotation, index) => (
          <motion.div
            key={quotation._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <QuotationCard quotation={quotation} variant="compact" />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
