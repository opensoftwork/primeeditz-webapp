"use client";

import { format } from "date-fns";
import {
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StudioFeedbackSectionProps {
  quotation: any;
}

export function StudioFeedbackSection({
  quotation,
}: StudioFeedbackSectionProps) {
  const hasFeedback =
    quotation.status === "changes_requested" ||
    quotation.status === "rejected" ||
    quotation.status === "approved" ||
    quotation.status === "quotation_approved";

  if (!hasFeedback) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.3em] px-1">
        Studio Response
      </h3>

      <div
        className={cn(
          "rounded-3xl p-8 border space-y-6 relative overflow-hidden group",
          quotation.status === "approved" ||
            quotation.status === "quotation_approved"
            ? "bg-green-500/5 border-green-500/10"
            : quotation.status === "changes_requested"
              ? "bg-indigo-500/5 border-indigo-500/10"
              : "bg-red-500/5 border-red-500/10",
        )}
      >
        {/* Status Header */}
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "h-12 w-12 rounded-2xl flex items-center justify-center border",
              quotation.status === "approved" ||
                quotation.status === "quotation_approved"
                ? "bg-green-500/10 border-green-500/20 text-green-400"
                : quotation.status === "changes_requested"
                  ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                  : "bg-red-500/10 border-red-500/20 text-red-400",
            )}
          >
            {quotation.status === "approved" ||
            quotation.status === "quotation_approved" ? (
              <CheckCircle2 className="h-6 w-6" />
            ) : quotation.status === "changes_requested" ? (
              <MessageSquare className="h-6 w-6" />
            ) : (
              <XCircle className="h-6 w-6" />
            )}
          </div>
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-widest leading-tight">
              {quotation.status === "approved" ||
              quotation.status === "quotation_approved"
                ? "Proposal Approved"
                : quotation.status === "changes_requested"
                  ? "Revision Requested"
                  : "Proposal Declined"}
            </h4>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mt-0.5">
              {format(
                quotation.approvedAt ||
                  quotation.changeRequestedAt ||
                  quotation.rejectedAt ||
                  Date.now(),
                "MMMM dd, yyyy 'at' hh:mm a",
              )}
            </p>
          </div>
        </div>

        {/* Reasons */}
        {quotation.changeReasons && (
          <div className="flex flex-wrap gap-2">
            {quotation.changeReasons.map((reason: string) => (
              <span
                key={reason}
                className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[9px] font-black text-white/60 uppercase tracking-widest"
              >
                {reason}
              </span>
            ))}
          </div>
        )}

        {quotation.rejectionReason && (
          <div className="px-3 py-1 rounded-full inline-block bg-red-500/10 border border-red-500/20 text-[9px] font-black text-red-400 uppercase tracking-widest">
            Reason: {quotation.rejectionReason}
          </div>
        )}

        {/* Notes/Signature */}
        {quotation.studioNotes && (
          <div className="space-y-2">
            <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">
              Studio Notes
            </span>
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 text-xs font-medium text-white/70 leading-relaxed italic">
              "{quotation.studioNotes}"
            </div>
          </div>
        )}

        {quotation.studioSignature && (
          <div className="flex items-center gap-2 pt-2">
            <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">
              Digitally Signed:
            </span>
            <span className="text-xs font-black text-white/80 italic">
              {quotation.studioSignature}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
