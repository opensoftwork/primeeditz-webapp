"use client";

import { format } from "date-fns";
import { ArrowLeft, Download, Printer, Receipt } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { DownloadQuotation } from "@/components/modules/admin/quotations/preview/download-quotation";
import { Button } from "@/components/ui/button";
import { QuotationStatusBadge } from "../../shared/quotation-status-badge";

interface QuotationDetailHeaderProps {
  quotation: any;
  sections: any[];
  onPrint?: () => void;
}

export function QuotationDetailHeader({
  quotation,
  sections,
  onPrint,
}: QuotationDetailHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.back()}
          className="h-9 w-9 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 border-white/10 shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-125 group-hover:bg-primary/30 transition-all opacity-50" />
            <div className="relative w-12 h-12 rounded-xl bg-linear-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center group-hover:border-primary/40 transition-all shadow-xl shadow-primary/10">
              <Receipt className="h-5 w-5 text-primary" />
            </div>
          </div>

          <div className="space-y-0">
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-primary/60">
                Quotation View • ID: {quotation.code}
              </span>
              <span className="text-[8px] font-black uppercase tracking-widest text-primary/60 bg-primary/5 border border-primary/10 px-1.5 py-0.5 rounded">
                v{quotation.version}
              </span>
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tighter text-white leading-none">
              {quotation.code}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-white/30 text-[10px] font-black uppercase tracking-tight">
                Issued {format(quotation._creationTime, "MMMM dd, yyyy")}
              </p>
              {quotation.validUntil && (
                <>
                  <span className="h-1 w-1 rounded-full bg-white/10" />
                  <p className="text-amber-500/60 text-[10px] font-black uppercase tracking-tight">
                    Valid Until {format(quotation.validUntil, "MMMM dd")}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 self-end md:self-center">
        <QuotationStatusBadge status={quotation.status} className="px-5 py-2" />

        <DownloadQuotation
          quotation={quotation}
          sections={sections}
          variant="outline"
          label=""
          icon={<Download className="h-4 w-4" />}
          className="h-10 w-10 p-0 rounded-xl bg-white/5 border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all"
        />

        {/* {onPrint && (
          <Button
            variant="outline"
            onClick={onPrint}
            className="h-10 w-10 p-0 rounded-xl bg-white/5 border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all"
            title="Print Quotation"
          >
            <Printer className="h-4 w-4" />
          </Button>
        )} */}
      </div>
    </div>
  );
}
