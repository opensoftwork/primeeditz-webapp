"use client";

import { format } from "date-fns";
import { Receipt, FileText, Eye, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DownloadQuotation } from "../../../preview";
import type { Project, QuotationData, QuotationSection } from "../../types";

interface ReviewHeaderProps {
  quotation: QuotationData;
  sections: QuotationSection[];
  projects: Project[];
  isPreviewLoading: boolean;
  isLoading: boolean;
  isSavingForSend: boolean;
  onPreview: () => void;
  onSendToStudio: () => void;
}

export function ReviewHeader({
  quotation,
  sections,
  projects,
  isPreviewLoading,
  isLoading,
  isSavingForSend,
  onPreview,
  onSendToStudio,
}: ReviewHeaderProps) {
  return (
    <div className="shrink-0 flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-lg shadow-primary/5">
          <Receipt className="h-5 w-5 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-xl font-black text-white uppercase tracking-tight">
              {quotation.code}
            </h1>
            <span className="text-[8px] font-black uppercase tracking-widest text-primary/60 bg-primary/5 border border-primary/10 px-1.5 py-0.5 rounded">
              v{quotation.version}
            </span>
          </div>
          <p className="text-white/20 text-[10px] font-black uppercase tracking-widest">
            Preview • {format(new Date(), "MMM dd, yyyy")}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Draft Badge */}
        <div
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl border",
            "bg-zinc-400/10 border-zinc-400/20 text-zinc-400",
          )}
        >
          <FileText className="h-4 w-4" />
          <span className="text-xs font-black uppercase tracking-widest">
            Draft
          </span>
        </div>

        {/* Preview Button */}
        <Button
          variant="outline"
          className="h-10 px-4 rounded-xl bg-white/5 border-white/10 text-white font-bold text-xs hover:bg-white/10"
          onClick={onPreview}
          disabled={isLoading || isSavingForSend || isPreviewLoading}
        >
          {isPreviewLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </>
          )}
        </Button>

        {/* Download PDF Button */}
        <DownloadQuotation
          quotation={quotation}
          sections={sections}
          projects={projects}
          variant="default"
          size="sm"
          className="h-10 px-4 rounded-xl font-bold text-xs"
        />

        {/* Send to Studio Button */}
        <Button
          onClick={onSendToStudio}
          disabled={isLoading || isSavingForSend}
          className="h-10 px-6 rounded-xl bg-primary hover:bg-primary/90 text-zinc-950 font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 transition-all active:scale-95"
        >
          {isSavingForSend ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send to Studio
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
