"use client";

import { format } from "date-fns";
import { Calendar, Eye, Hash, Receipt } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { QuotationStatusBadge } from "./quotation-status-badge";

interface QuotationCardProps {
  quotation: {
    _id: string;
    code: string;
    total: number;
    status: any;
    projectName?: string;
    validUntil?: number;
    approvedAt?: number;
    _creationTime: number;
  };
}

export function QuotationCard({ quotation }: QuotationCardProps) {
  const router = useRouter();

  return (
    <Link href={`/quotations/${quotation._id}`}>
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="group p-6 rounded-[1.5rem] bg-white/3 border border-white/5 hover:bg-white/5 hover:border-primary/20 transition-all duration-300 cursor-pointer relative overflow-hidden h-full flex flex-col justify-between"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[60px] rounded-full translate-x-16 -translate-y-16 group-hover:bg-primary/10 transition-colors" />

        <div className="relative space-y-4 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Hash className="h-3.5 w-3.5 text-primary/40" />
                <span className="text-lg font-black tracking-tight text-white group-hover:text-primary transition-colors uppercase">
                  {quotation.code}
                </span>
              </div>
              <span className="text-[9px] font-black text-primary/40 uppercase tracking-widest">
                Quotation
              </span>
            </div>
            <QuotationStatusBadge status={quotation.status} />
          </div>

          {/* Project Name (if any) */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-primary/20 transition-colors shrink-0">
              <Receipt className="h-3.5 w-3.5 text-white/40 group-hover:text-primary transition-colors" />
            </div>
            <span className="font-black text-white/80 uppercase tracking-tight text-sm truncate">
              {quotation.projectName || "Standard Quotation"}
            </span>
          </div>

          <div className="flex-1 min-h-4" />

          {/* Amount Section */}
          <div className="pt-3 border-t border-white/5">
            <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-1">
              Total Valuation
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-bold text-white/40 tracking-tighter">
                ₹
              </span>
              <span className="text-2xl font-black text-white tracking-tighter">
                {quotation.total.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Footer Info */}
          <div className="pt-3 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[9px] font-bold text-white/20 uppercase tracking-widest">
              <Calendar className="h-3 w-3" />
              {quotation.status === "approved"
                ? `Accepted ${format(quotation.approvedAt || quotation._creationTime, "MMM dd, yyyy")}`
                : `Issued ${format(quotation._creationTime, "MMM dd, yyyy")}`}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-primary hover:bg-primary/10 rounded-lg gap-1"
            >
              View <Eye className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
