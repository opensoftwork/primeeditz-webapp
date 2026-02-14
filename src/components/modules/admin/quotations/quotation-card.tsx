"use client";

import { format } from "date-fns";
import { Calendar, Download, FileText, Pencil, User } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { QuotationStatusBadge } from "@/components/modules/studio/quotations/shared/quotation-status-badge";
import type { AdminQuotation } from "./list-types";
import { DeleteQuotationAction } from "./delete-quotation-action";

interface QuotationCardProps {
  quotation: AdminQuotation;
}

export function QuotationCard({ quotation }: QuotationCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/quotations/${quotation._id}`);
  };

  return (
    <motion.div
      onClick={handleCardClick}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="group relative flex flex-col justify-between h-full p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/[0.07] hover:border-primary/20 transition-all duration-300 cursor-pointer overflow-hidden shadow-lg shadow-black/20"
    >
      {/* Glow Effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] rounded-full translate-x-12 -translate-y-12 group-hover:bg-primary/20 transition-colors duration-500" />

      <div className="relative z-10 space-y-4">
        {/* Top Row: Code & Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-tight text-white group-hover:text-primary transition-colors uppercase">
                {quotation.code}
              </span>
              <span className="px-1.5 py-0.5 rounded-sm bg-white/5 border border-white/10 text-[9px] font-bold text-white/50">
                v{quotation.version}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-white/40">
              <Calendar className="w-3 h-3" />
              {format(quotation._creationTime, "MMM dd, yyyy")}
            </div>
          </div>
          <QuotationStatusBadge
            status={quotation.status as AdminQuotation["status"]}
            className="scale-[0.85] origin-top-right transform-gpu"
          />
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-linear-to-r from-transparent via-white/10 to-transparent" />

        {/* Middle: Client Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-linear-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center shadow-inner group-hover:border-primary/30 transition-colors">
              <User className="w-3.5 h-3.5 text-white/60 group-hover:text-primary transition-colors" />
            </div>
            <span className="text-xs font-bold text-white/90 uppercase tracking-wide truncate">
              {quotation.studioName || "Direct Inquiry"}
            </span>
          </div>
          {(quotation.projectName || quotation.endClientName) && (
            <div className="pl-[2.35rem] text-[10px] font-semibold text-white/50 uppercase tracking-wider truncate">
              {quotation.projectName || quotation.endClientName}
            </div>
          )}
        </div>
      </div>

      {/* Footer: Price */}
      <div className="relative z-10 mt-5 pt-3 border-t border-white/5 flex items-end justify-between">
        <div className="flex items-center gap-3 pb-1">
          <div className="text-[9px] font-bold text-white/30 uppercase tracking-widest">
            Valuation
          </div>
          <div
            className="flex items-center gap-2 px-2 py-1 rounded-lg bg-black/20 border border-white/5 shadow-inner"
            onClick={(e) => e.stopPropagation()}
          >
            <Link
              href={`/quotations/${quotation._id}/edit`}
              title="Edit Quotation"
            >
              <Pencil className="w-3.5 h-3.5 text-white/20 hover:text-white transition-colors cursor-pointer" />
            </Link>
            <Link
              href={`/quotations/${quotation._id}/preview`}
              title="Professional Preview"
            >
              <FileText className="w-3.5 h-3.5 text-white/20 hover:text-white transition-colors cursor-pointer" />
            </Link>
            <Link
              href={`/quotations/${quotation._id}/preview?download=true`}
              title="Download PDF"
            >
              <Download className="w-3.5 h-3.5 text-white/20 hover:text-white transition-colors cursor-pointer" />
            </Link>
            {quotation.status === "draft" && (
              <DeleteQuotationAction
                quotationId={quotation._id}
                quotationCode={quotation.code}
                className="h-3.5 w-3.5 text-white/20 hover:text-red-400 transition-colors"
              />
            )}
          </div>
        </div>
        <div className="flex items-baseline gap-0.5">
          <span className="text-xs font-bold text-primary/60">₹</span>
          <span className="text-xl font-black text-white tracking-tight group-hover:text-primary/90 transition-colors">
            {quotation.total.toLocaleString("en-IN")}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
