"use client";

import { format } from "date-fns";
import { Calendar, Eye, Hash, User } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { QuotationStatusBadge } from "@/components/modules/studio/quotations/shared/quotation-status-badge";

interface PendingQuotation {
  _id: string;
  code: string;
  status: string;
  total: number;
  studioId?: string;
  studioName?: string;
  projectId?: string;
  projectName?: string;
  endClientName?: string;
  _creationTime: number;
  sentAt?: number;
}

interface PendingQuotationCardProps {
  quotation: PendingQuotation;
}

/**
 * Compact quotation notification card for Admin dashboard.
 * Displays pending quotations from studios that need review.
 * Story: 15.2
 */
export function PendingQuotationCard({ quotation }: PendingQuotationCardProps) {
  return (
    <Link href={`/quotations/${quotation._id}`}>
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="group p-4 rounded-xl bg-white/3 border border-white/5 hover:bg-white/5 hover:border-primary/20 transition-all duration-300 cursor-pointer relative overflow-hidden"
      >
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-2xl rounded-full translate-x-12 -translate-y-12 group-hover:bg-primary/10 transition-colors" />

        <div className="relative space-y-3">
          {/* Header: Code & Status */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Hash className="h-3 w-3 text-primary/40" />
                <span className="text-sm font-black tracking-tight text-white group-hover:text-primary transition-colors uppercase">
                  {quotation.code}
                </span>
              </div>
              <span className="text-[9px] font-black text-primary/40 uppercase tracking-widest">
                Quotation Review
              </span>
            </div>
            <QuotationStatusBadge
              status={quotation.status as any}
              className="scale-90"
            />
          </div>

          {/* Studio Info */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-primary/20 transition-colors shrink-0">
              <User className="h-3 w-3 text-white/40 group-hover:text-primary transition-colors" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-white/80 uppercase tracking-tight text-xs truncate">
                {quotation.studioName || "Unknown Studio"}
              </span>
              {(quotation.projectName || quotation.endClientName) && (
                <span className="text-[9px] font-medium text-white/40 truncate">
                  {quotation.projectName || quotation.endClientName}
                </span>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px w-full bg-linear-to-r from-transparent via-white/10 to-transparent" />

          {/* Footer: Amount & Date */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-0.5">
              <span className="text-[10px] font-bold text-primary/60">₹</span>
              <span className="text-base font-black text-white tracking-tight">
                {quotation.total.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-[9px] font-bold text-white/20 uppercase tracking-widest">
                <Calendar className="h-2.5 w-2.5" />
                {format(quotation._creationTime, "MMM dd")}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-primary hover:bg-primary/10 rounded-md gap-1"
              >
                Review <Eye className="h-2.5 w-2.5" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
