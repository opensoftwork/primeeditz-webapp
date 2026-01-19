"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { format } from "date-fns";
import {
  Receipt,
  Copy,
  ArrowLeft,
  Edit,
  Send,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { DownloadQuotation } from "../../preview";

interface DetailHeaderProps {
  quotation: any;
  sections: any[];
  status: any;
  quotationId: string;
  onSend: () => void;
}

export function DetailHeader({
  quotation,
  sections,
  status,
  quotationId,
  onSend,
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
          className="h-9 px-3 -ml-3 text-white/40 hover:text-white font-bold text-xs rounded-lg transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Quotations
        </Button>

        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-lg shadow-primary/5">
            <Receipt className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-xl font-black text-white uppercase tracking-tight">
                {quotation.code}
              </h1>
              <div className="flex items-center gap-1">
                <button
                  onClick={copyCode}
                  className="p-1 rounded-lg hover:bg-white/5 text-white/20 hover:text-white transition-colors"
                  title="Copy code"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
                <span className="text-[8px] font-black uppercase tracking-widest text-primary/60 bg-primary/5 border border-primary/10 px-1.5 py-0.5 rounded">
                  v{quotation.version}
                </span>
              </div>
            </div>
            <p className="text-white/20 text-[10px] font-black uppercase tracking-widest">
              Generated on {format(quotation._creationTime, "MMM dd, yyyy")}
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
            status.color,
          )}
        >
          <StatusIcon className="h-4 w-4" />
          <span className="text-xs font-black uppercase tracking-widest">
            {status.label}
          </span>
        </div>

        <Button
          variant="outline"
          onClick={() => router.push(`/quotations/${quotationId}/preview`)}
          className="h-10 px-4 rounded-xl bg-white/5 border-white/10 text-white font-bold text-xs hover:bg-white/10"
        >
          <FileText className="h-4 w-4 mr-2" />
          Preview
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push(`/quotations/${quotationId}/edit`)}
          className="h-10 px-4 rounded-xl bg-white/5 border-white/10 text-white font-bold text-xs hover:bg-white/10"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <DownloadQuotation
          quotation={quotation}
          sections={sections}
          variant="default"
          size="sm"
          className="h-10 px-4 rounded-xl font-bold text-xs"
        />

        <Button
          onClick={onSend}
          disabled={
            !["draft", "sent", "viewed", "changes_requested"].includes(
              quotation.status,
            )
          }
          className={cn(
            "h-10 px-6 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg transition-all active:scale-95",
            quotation.status === "draft"
              ? "bg-primary hover:bg-primary/90 text-zinc-950 shadow-primary/20"
              : "bg-white/5 border border-white/10 text-white hover:bg-white/10",
          )}
        >
          <Send className="h-4 w-4 mr-2" />
          {quotation.status === "draft" ? "Send to Client" : "Resend"}
        </Button>
      </div>
    </div>
  );
}
