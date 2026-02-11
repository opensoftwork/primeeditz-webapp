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
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard")}
          className="h-9 px-3 -ml-3 text-white/40 hover:text-white font-bold text-xs rounded-lg transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
          Back to Dashboard
        </Button>

        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-2xl shadow-primary/10">
            <Receipt className="h-7 w-7 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
                {quotation.code}
              </h1>
              <span className="text-[10px] font-black uppercase tracking-widest text-primary/60 bg-primary/5 border border-primary/10 px-2.5 py-1 rounded-lg">
                v{quotation.version}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-white/20 text-[10px] font-black uppercase tracking-widest">
                Issued {format(quotation._creationTime, "MMMM dd, yyyy")}
              </p>
              {quotation.validUntil && (
                <>
                  <span className="h-1 w-1 rounded-full bg-white/10" />
                  <p className="text-amber-500/60 text-[10px] font-black uppercase tracking-widest">
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
