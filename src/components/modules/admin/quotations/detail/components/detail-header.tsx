"use client";

import { motion } from "motion/react";
import { format } from "date-fns";
import { Receipt, Copy, ArrowLeft, Edit, Download, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface DetailHeaderProps {
  quotation: any;
  status: any;
  quotationId: string;
}

export function DetailHeader({
  quotation,
  status,
  quotationId,
}: DetailHeaderProps) {
  const router = useRouter();
  const StatusIcon = status.icon;

  const copyCode = async () => {
    await navigator.clipboard.writeText(quotation.code);
    toast.success("Quotation code copied!");
  };

  return (
    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
      <div className="space-y-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/quotations")}
          className="h-8 px-3 -ml-3 text-white/40 hover:text-white font-bold text-xs"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
          Back to Quotations
        </Button>

        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Receipt className="h-6 w-6 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
                {quotation.code}
              </h1>
              <button
                onClick={copyCode}
                className="p-1.5 rounded-lg hover:bg-white/5 text-white/20 hover:text-white transition-colors"
                title="Copy code"
              >
                <Copy className="h-4 w-4" />
              </button>
              <span className="text-[10px] font-black uppercase tracking-widest text-white/20 bg-white/5 px-2 py-1 rounded-lg">
                v{quotation.version}
              </span>
            </div>
            <p className="text-white/40 text-sm font-medium">
              Created on {format(quotation._creationTime, "MMMM dd, yyyy")}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl border",
            status.bgColor,
            status.borderColor,
            status.color
          )}
        >
          <StatusIcon className="h-4 w-4" />
          <span className="text-xs font-black uppercase tracking-widest">
            {status.label}
          </span>
        </div>

        <Button
          variant="outline"
          onClick={() => router.push(`/quotations/${quotationId}/edit`)}
          className="h-10 px-4 rounded-xl bg-white/5 border-white/10 text-white font-bold text-xs"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button
          onClick={() => toast.info("PDF generation coming soon!")}
          className="h-10 px-4 rounded-xl font-bold text-xs"
        >
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
      </div>
    </div>
  );
}
