"use client";

import { Copy, Download, Send, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { DownloadQuotation } from "../../preview";
import { DeleteQuotationAction } from "../../delete-quotation-action";
import { Project } from "../../types";
import type { Id } from "@convex/_generated/dataModel";

interface QuotationLineItem {
  id: string;
  description: string;
  rate: number;
  quantity: number;
  unit: string;
  sectionId?: string;
  projectId?: string;
  subItems?: {
    description: string;
    rate: number;
    quantity: number;
    unit: string;
  }[];
}

interface QuickActionsProps {
  quotation: {
    status: string;
    code: string;
    version: number;
    lineItems: QuotationLineItem[];
    taxRate?: number;
    discountAmount?: number;
    terms?: string;
    validUntil?: number;
    _id: Id<"quotations"> | string;
    _creationTime: number;
    studioName?: string;
    projectId?: string;
    projectIds?: string[];
  };
  sections: { _id: string; name: string; color?: string }[];
  projects?: Project[];
  onSend: () => void;
  onDuplicate: () => void;
}

export function QuickActions({
  quotation,
  sections,
  projects = [],
  onSend,
  onDuplicate,
}: QuickActionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="p-5 rounded-2xl bg-white/2 border border-white/5"
    >
      <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4">
        Quick Actions
      </h3>
      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start h-10 rounded-xl bg-white/5 border-white/10 text-white font-bold text-xs hover:bg-white/10"
          onClick={onSend}
          disabled={
            !["draft", "sent", "viewed", "changes_requested"].includes(
              quotation.status,
            )
          }
        >
          <Send className="h-4 w-4 mr-2 text-primary" />
          Send to Studio
        </Button>

        <DownloadQuotation
          quotation={quotation}
          sections={sections}
          projects={projects}
          variant="outline"
          label="Download Quotation"
          icon={<Download className="h-4 w-4 mr-2 text-white/40" />}
          className="w-full justify-start h-10 rounded-xl bg-white/5 border-white/10 text-white font-bold text-xs hover:bg-white/10"
        />

        <Button
          variant="outline"
          className="w-full justify-start h-10 rounded-xl bg-white/5 border-white/10 text-white font-bold text-xs hover:bg-white/10"
          onClick={onDuplicate}
        >
          <Copy className="h-4 w-4 mr-2 text-white/40" />
          Duplicate as New
        </Button>

        <DeleteQuotationAction
          quotationId={quotation._id as Id<"quotations">}
          quotationCode={quotation.code}
        >
          <Button
            variant="outline"
            className="w-full justify-start h-10 rounded-xl bg-red-500/5 border-red-500/20 text-red-400 font-bold text-xs hover:bg-red-500/10 hover:text-red-300"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Quotation
          </Button>
        </DeleteQuotationAction>
      </div>
    </motion.div>
  );
}
