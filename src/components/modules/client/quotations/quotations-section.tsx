"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { QuotationCard } from "./shared/quotation-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Receipt, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";

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
              {quotations.length} total • Action required on pending
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
            <QuotationCard quotation={quotation as any} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
