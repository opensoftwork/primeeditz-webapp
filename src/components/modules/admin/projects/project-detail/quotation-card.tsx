"use client";

import type { Id } from "@convex/_generated/dataModel";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink,
  Eye,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface QuotationStatus {
  _id: Id<"quotations">;
  code: string;
  status: string;
  total: number;
  sentAt?: number;
  viewedAt?: number;
  approvedAt?: number;
}

interface QuotationCardProps {
  quotation?: QuotationStatus | null;
  projectId: Id<"projects">;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: typeof FileText; color: string; bgColor: string }
> = {
  draft: {
    label: "Draft",
    icon: FileText,
    color: "text-white/40",
    bgColor: "bg-white/5 border-white/10",
  },
  sent: {
    label: "Awaiting Response",
    icon: Clock,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10 border-amber-500/20",
  },
  viewed: {
    label: "Viewed by Client",
    icon: Eye,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10 border-blue-500/20",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10 border-emerald-500/20",
  },
  changes_requested: {
    label: "Changes Requested",
    icon: AlertCircle,
    color: "text-orange-400",
    bgColor: "bg-orange-500/10 border-orange-500/20",
  },
  rejected: {
    label: "Rejected",
    icon: AlertCircle,
    color: "text-red-400",
    bgColor: "bg-red-500/10 border-red-500/20",
  },
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function QuotationCard({ quotation, projectId }: QuotationCardProps) {
  if (!quotation) {
    // No quotation linked yet
    return (
      <div className="p-8 rounded-[2.5rem] bg-zinc-900/50 border border-white/5 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/40">
            <FileText className="h-5 w-5" />
          </div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
            Quotation
          </h3>
        </div>

        <div className="text-center py-4">
          <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-4">
            No quotation linked yet
          </p>
          <Button
            asChild
            variant="outline"
            className="rounded-xl border-primary/20 bg-primary/5 hover:bg-primary/10 text-[10px] font-black uppercase tracking-widest text-primary"
          >
            <Link href={`/quotations/new?projectId=${projectId}`}>
              Create Quotation
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const config = STATUS_CONFIG[quotation.status] || STATUS_CONFIG.draft;
  const StatusIcon = config.icon;

  return (
    <div className="p-8 rounded-[2.5rem] bg-zinc-900/50 border border-white/5 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
              Quotation
            </h3>
            <p className="text-sm font-black text-white">{quotation.code}</p>
          </div>
        </div>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-white/40 hover:text-primary hover:bg-primary/10 rounded-lg"
        >
          <Link href={`/quotations/${quotation._id}`}>
            <ExternalLink className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Status Badge */}
      <div className={`p-4 rounded-xl ${config.bgColor} border`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusIcon className={`h-4 w-4 ${config.color}`} />
            <span
              className={`text-[10px] font-black uppercase tracking-widest ${config.color}`}
            >
              {config.label}
            </span>
          </div>
        </div>
      </div>

      {/* Total */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-white/30">
          Total Amount
        </span>
        <span className="text-lg font-black text-primary">
          {formatCurrency(quotation.total)}
        </span>
      </div>

      {/* Timestamps */}
      <div className="space-y-2 text-[9px] font-bold text-white/20 uppercase tracking-widest">
        {quotation.sentAt && (
          <div className="flex justify-between">
            <span>Sent</span>
            <span>{new Date(quotation.sentAt).toLocaleDateString()}</span>
          </div>
        )}
        {quotation.viewedAt && (
          <div className="flex justify-between">
            <span>Viewed</span>
            <span>{new Date(quotation.viewedAt).toLocaleDateString()}</span>
          </div>
        )}
        {quotation.approvedAt && (
          <div className="flex justify-between">
            <span>Approved</span>
            <span>{new Date(quotation.approvedAt).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          asChild
          variant="outline"
          className="flex-1 rounded-xl border-white/10 hover:bg-white/5 text-[10px] font-black uppercase tracking-widest"
        >
          <Link href={`/quotations/${quotation._id}`}>View Details</Link>
        </Button>
        {quotation.status === "draft" && (
          <Button
            asChild
            className="flex-1 rounded-xl bg-primary hover:bg-primary/90 text-black text-[10px] font-black uppercase tracking-widest"
          >
            <Link href={`/quotations/${quotation._id}/edit`}>Edit</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
