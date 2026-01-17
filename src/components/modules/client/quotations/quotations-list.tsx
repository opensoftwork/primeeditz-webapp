"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { FileText, Loader2, Eye, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  sent: { label: "Pending Review", color: "amber", icon: Clock },
  viewed: { label: "Viewed", color: "blue", icon: Eye },
  approved: { label: "Approved", color: "emerald", icon: CheckCircle2 },
  changes_requested: { label: "Changes Requested", color: "orange", icon: AlertCircle },
  rejected: { label: "Rejected", color: "red", icon: AlertCircle },
};

export function ClientQuotationsList() {
  const quotations = useQuery(api.functions.quotations.queries.getMyQuotations);

  if (quotations === undefined) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white/20" />
      </div>
    );
  }

  if (quotations.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
        <div className="p-6 rounded-full bg-white/5 mb-6">
          <FileText className="h-12 w-12 text-white/20" />
        </div>
        <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
          No Quotations Yet
        </h2>
        <p className="text-white/40 max-w-md">
          When you receive quotations for your projects, they will appear here for your review.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 md:p-12 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
          My Quotations
        </h1>
        <p className="text-white/40 font-medium mt-1">
          Review and respond to quotations from PrimeEditz
        </p>
      </div>

      {/* Quotations List */}
      <div className="space-y-4">
        {quotations.map((quotation) => {
          const status = statusConfig[quotation.status] || statusConfig.sent;
          const StatusIcon = status.icon;

          return (
            <Link
              key={quotation._id}
              href={`/quotations/${quotation._id}`}
              className="block p-6 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-white/10 transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 group-hover:bg-primary/15 transition-colors">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-white font-bold text-lg group-hover:text-primary transition-colors">
                        {quotation.code}
                      </h3>
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-1",
                          `bg-${status.color}-500/10 text-${status.color}-500`
                        )}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </span>
                    </div>
                    {quotation.projectName && (
                      <p className="text-white/40 text-sm mt-1">
                        Project: {quotation.projectName}
                      </p>
                    )}
                    <p className="text-white/30 text-xs mt-2">
                      Received {formatDate(quotation._creationTime)}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-white font-bold text-xl">
                    {formatCurrency(quotation.total)}
                  </p>
                  <p className="text-white/30 text-xs mt-1 uppercase tracking-wider">
                    Total Amount
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
