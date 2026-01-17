"use client";

import { motion } from "motion/react";
import { format } from "date-fns";
import { Receipt, Calendar, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuotationStatusBadge } from "./quotation-status-badge";
import { useRouter } from "next/navigation";

interface QuotationCardProps {
  quotation: {
    _id: string;
    code: string;
    total: number;
    status: any;
    validUntil?: number;
    approvedAt?: number;
    _creationTime: number;
  };
}

export function QuotationCard({ quotation }: QuotationCardProps) {
  const router = useRouter();

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-white/2 p-6 transition-all hover:border-white/10 hover:bg-white/4"
    >
      <div className="flex flex-col h-full gap-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Receipt className="h-4 w-4 text-primary" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                {quotation.code}
              </span>
            </div>
          </div>
          <QuotationStatusBadge status={quotation.status} />
        </div>

        {/* Amount */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">
            Total Valuation
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-bold text-white/40 tracking-tighter">
              ₹
            </span>
            <span className="text-3xl font-black text-white tracking-tighter leading-none">
              {quotation.total.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-linear-to-r from-transparent via-white/5 to-transparent" />

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-white/20" />
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
              {quotation.status === "approved"
                ? `Accepted: ${format(quotation.approvedAt || quotation._creationTime, "MMM dd")}`
                : `Valid: ${format(quotation.validUntil || quotation._creationTime + 30 * 24 * 60 * 60 * 1000, "MMM dd, yyyy")}`}
            </span>
          </div>

          <Button
            size="sm"
            onClick={() => router.push(`/quotations/${quotation._id}`)}
            className="rounded-xl h-10 px-4 bg-white/5 border border-white/5 text-white/60 hover:text-white hover:bg-white/10 group/btn font-bold text-xs"
          >
            Review Details
            <ArrowUpRight className="ml-2 h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
