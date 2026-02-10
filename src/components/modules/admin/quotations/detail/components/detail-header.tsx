"use client";

import { format } from "date-fns";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Edit,
  FileText,
  Receipt,
  Send,
} from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DownloadQuotation } from "../../preview";
import { Project } from "../../types";

interface DetailHeaderProps {
  quotation: {
    code: string;
    version: number;
    status: string;
    _creationTime: number;
    lineItems: {
      id: string;
      description: string;
      rate: number;
      quantity: number;
      unit: string;
      sectionId?: string;
      projectId?: string;
    }[];
    [key: string]: unknown;
  };
  sections: { _id: string; name: string; color?: string }[];
  projects?: Project[];
  status: {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgColor: string;
    borderColor: string;
  };
  quotationId: string;
  onSend: () => void;
  onApprove: () => void;
}

export function DetailHeader({
  quotation,
  sections,
  projects = [],
  status,
  quotationId,
  onSend,
  onApprove,
}: DetailHeaderProps) {
  const router = useRouter();
  const StatusIcon = status.icon;

  const copyCode = async () => {
    await navigator.clipboard.writeText(quotation.code);
    toast.success("Quotation code copied!");
  };

  return (
    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
      <div className="flex items-center gap-6">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.back()}
          className="h-10 w-10 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 border-white/10 shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
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
          projects={projects}
          variant="default"
          size="sm"
          className="h-10 px-4 rounded-xl font-bold text-xs"
        />

        {quotation.status === "initiated" ? (
          <Button
            onClick={onApprove}
            className="h-10 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Approve Quotation
          </Button>
        ) : (
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
            {quotation.status === "draft" ? "Send to Studio" : "Resend"}
          </Button>
        )}
      </div>
    </div>
  );
}
