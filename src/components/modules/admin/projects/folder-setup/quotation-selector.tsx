"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useQuery } from "convex/react";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  HardDrive,
  Link as LinkIcon,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuotationOption {
  _id: Id<"quotations">;
  code: string;
  status: string;
  total: number;
  approvedAt?: number;
  linkedProjectCount: number;
  storageInfo: {
    totalGB: number;
    allocatedGB: number;
    remainingGB: number;
  };
}

interface QuotationSelectorProps {
  studioId: Id<"profiles"> | undefined;
  selectedQuotationId: Id<"quotations"> | null;
  onSelect: (quotation: QuotationOption | null) => void;
  linkedQuotation?: QuotationOption | null;
}

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

export function QuotationSelector({
  studioId,
  selectedQuotationId,
  onSelect,
  linkedQuotation,
}: QuotationSelectorProps) {
  const quotations = useQuery(
    api.functions.quotations.queries.getClientApprovedQuotations,
    studioId ? { studioId } : "skip",
  );

  if (!studioId) {
    return (
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-amber-500" />
          <div>
            <p className="text-white/80 text-sm font-medium">
              No Client Assigned
            </p>
            <p className="text-white/40 text-xs">
              This project has no client. Cannot link to quotations.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (quotations === undefined) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-white/20" />
        <span className="ml-2 text-white/40 text-sm">
          Loading quotations...
        </span>
      </div>
    );
  }

  if (quotations.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-white/30" />
          <div>
            <p className="text-white/60 text-sm font-medium">
              No Approved Quotations
            </p>
            <p className="text-white/40 text-xs">
              This client has no approved quotations. Create and approve a
              quotation first.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show currently linked quotation if exists
  if (linkedQuotation) {
    return (
      <div className="space-y-3">
        {/* Currently Linked */}
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <LinkIcon className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-emerald-400 font-bold text-sm">
                  {linkedQuotation.code}
                </p>
                <span className="text-emerald-500/60 text-xs font-medium">
                  LINKED
                </span>
              </div>
              <div className="flex items-center gap-4 mt-2 text-white/40 text-xs">
                <span>{formatCurrency(linkedQuotation.total)}</span>
                <span className="flex items-center gap-1">
                  <HardDrive className="h-3 w-3" />
                  {linkedQuotation.storageInfo.remainingGB} GB remaining
                </span>
              </div>
            </div>
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </div>
        </div>

        {/* Option to change */}
        {quotations.length > 1 && (
          <p className="text-white/30 text-xs font-medium px-1">
            Or select a different quotation:
          </p>
        )}

        {/* Other quotations */}
        <div className="space-y-2">
          {quotations
            .filter((q) => q._id !== linkedQuotation._id)
            .map((quotation) => (
              <QuotationCard
                key={quotation._id}
                quotation={quotation}
                isSelected={selectedQuotationId === quotation._id}
                onSelect={() => onSelect(quotation)}
              />
            ))}
        </div>
      </div>
    );
  }

  // No linked quotation - show all options
  return (
    <div className="space-y-2">
      {quotations.map((quotation) => (
        <QuotationCard
          key={quotation._id}
          quotation={quotation}
          isSelected={selectedQuotationId === quotation._id}
          onSelect={() => onSelect(quotation)}
        />
      ))}
    </div>
  );
}

interface QuotationCardProps {
  quotation: QuotationOption;
  isSelected: boolean;
  onSelect: () => void;
}

function QuotationCard({
  quotation,
  isSelected,
  onSelect,
}: QuotationCardProps) {
  const hasStorage = quotation.storageInfo.remainingGB > 0;

  return (
    <button
      onClick={onSelect}
      disabled={!hasStorage}
      className={cn(
        "w-full p-4 rounded-xl border transition-all text-left",
        isSelected
          ? "bg-primary/10 border-primary/30"
          : hasStorage
            ? "bg-white/3 border-white/10 hover:bg-white/5 hover:border-white/20"
            : "bg-white/2 border-white/5 opacity-50 cursor-not-allowed",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p
              className={cn(
                "font-bold text-sm",
                isSelected ? "text-primary" : "text-white",
              )}
            >
              {quotation.code}
            </p>
            {quotation.linkedProjectCount > 0 && (
              <span className="text-white/30 text-[10px] font-medium uppercase">
                {quotation.linkedProjectCount} project
                {quotation.linkedProjectCount > 1 ? "s" : ""}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 mt-2">
            <span className="text-white/60 text-xs font-medium">
              {formatCurrency(quotation.total)}
            </span>
            {quotation.approvedAt && (
              <span className="text-white/30 text-xs">
                Approved {formatDate(quotation.approvedAt)}
              </span>
            )}
          </div>

          {/* Storage Info */}
          <div className="mt-3 pt-3 border-t border-white/5">
            <div className="flex items-center gap-2">
              <HardDrive
                className={cn(
                  "h-3.5 w-3.5",
                  hasStorage ? "text-emerald-500" : "text-red-500",
                )}
              />
              <span
                className={cn(
                  "text-xs font-medium",
                  hasStorage ? "text-emerald-500" : "text-red-500",
                )}
              >
                {quotation.storageInfo.remainingGB} GB remaining
              </span>
              <span className="text-white/20 text-xs">
                / {quotation.storageInfo.totalGB} GB total
              </span>
            </div>

            {/* Storage progress bar */}
            <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  hasStorage ? "bg-emerald-500" : "bg-red-500",
                )}
                style={{
                  width: `${Math.min(
                    (quotation.storageInfo.allocatedGB /
                      quotation.storageInfo.totalGB) *
                      100,
                    100,
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>

        {isSelected && (
          <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
        )}
      </div>

      {!hasStorage && (
        <div className="mt-2 flex items-center gap-2 text-red-500/80 text-xs">
          <AlertCircle className="h-3 w-3" />
          <span>No storage remaining</span>
        </div>
      )}
    </button>
  );
}
