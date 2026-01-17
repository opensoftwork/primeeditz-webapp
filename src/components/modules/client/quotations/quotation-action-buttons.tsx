"use client";

import { useState } from "react";
import { CheckCircle2, MessageSquare, XCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AcceptQuotationDrawer } from "./accept-quotation-drawer";
import { RequestChangesDrawer } from "./request-changes-drawer";
import { RejectQuotationDrawer } from "./reject-quotation-drawer";
import { format } from "date-fns";

interface QuotationActionButtonsProps {
  status: string;
  quotation: {
    _id: any;
    code: string;
    total: number;
    approvedAt?: number;
    clientSignature?: string;
    rejectionReason?: string;
  };
  className?: string;
}

export function QuotationActionButtons({
  status,
  quotation,
  className,
}: QuotationActionButtonsProps) {
  const [isAcceptDrawerOpen, setIsAcceptDrawerOpen] = useState(false);
  const [isRequestChangesDrawerOpen, setIsRequestChangesDrawerOpen] =
    useState(false);
  const [isRejectDrawerOpen, setIsRejectDrawerOpen] = useState(false);
  const isActionable = ["sent", "viewed", "changes_requested"].includes(status);

  if (status === "approved") {
    return (
      <div
        className={cn(
          "p-8 rounded-[2.5rem] bg-green-500/5 border border-green-500/10 space-y-4 shadow-2xl shadow-green-500/5 relative overflow-hidden group",
          className,
        )}
      >
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity">
          <CheckCircle2 className="h-32 w-32 rotate-12" />
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <div className="h-10 w-10 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5 text-green-400" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-sm font-black text-white uppercase tracking-widest">
              Quotation Accepted
            </h3>
            <p className="text-[10px] font-bold text-green-400/60 uppercase tracking-[0.2em]">
              Successfully confirmed on{" "}
              {format(quotation.approvedAt || Date.now(), "MMM dd, yyyy")}
            </p>
          </div>
        </div>
        {quotation.clientSignature && (
          <div className="pt-4 border-t border-green-500/10 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/30 relative z-10">
            <span>Digitally Signed by:</span>
            <span className="text-white/60 italic">
              {quotation.clientSignature}
            </span>
          </div>
        )}
      </div>
    );
  }

  if (status === "changes_requested") {
    return (
      <div
        className={cn(
          "p-8 rounded-[2.5rem] bg-indigo-500/5 border border-indigo-500/10 space-y-4 shadow-2xl shadow-indigo-500/5 relative overflow-hidden group",
          className,
        )}
      >
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity">
          <MessageSquare className="h-32 w-32 rotate-12" />
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-indigo-400" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-sm font-black text-white uppercase tracking-widest">
              Changes Requested
            </h3>
            <p className="text-[10px] font-bold text-indigo-400/60 uppercase tracking-[0.2em]">
              Waiting for studio to revise the proposal
            </p>
          </div>
        </div>
        <p className="text-[10px] font-medium text-white/30 leading-relaxed italic relative z-10">
          The studio has been notified of your concerns. You will receive an
          update once the proposal is revised.
        </p>
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div
        className={cn(
          "p-8 rounded-[2.5rem] bg-red-500/5 border border-red-500/10 space-y-4 shadow-2xl shadow-red-500/5 relative overflow-hidden group",
          className,
        )}
      >
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity">
          <XCircle className="h-32 w-32 rotate-12" />
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <div className="h-10 w-10 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <XCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-sm font-black text-white uppercase tracking-widest">
              Proposal Declined
            </h3>
            <p className="text-[10px] font-bold text-red-400/60 uppercase tracking-[0.2em]">
              Quotation rejected by client
            </p>
          </div>
        </div>
        {quotation.rejectionReason && (
          <div className="pt-4 border-t border-red-500/10 space-y-1 relative z-10">
            <span className="text-[9px] font-black uppercase tracking-widest text-white/20">
              Reason:
            </span>
            <p className="text-[10px] font-medium text-white/40 uppercase tracking-widest">
              {quotation.rejectionReason}
            </p>
          </div>
        )}
      </div>
    );
  }

  if (!isActionable) {
    return (
      <div
        className={cn(
          "p-8 rounded-[2.5rem] bg-white/2 border border-white/5 text-center",
          className,
        )}
      >
        <p className="text-xs font-bold text-white/20 uppercase tracking-[0.2em]">
          No further actions available for this {status} quotation
        </p>
      </div>
    );
  }

  return (
    <>
      <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-6", className)}>
        {/* Accept Button */}
        <Button
          onClick={() => setIsAcceptDrawerOpen(true)}
          className="group h-24 rounded-[2rem] bg-primary hover:bg-primary/90 text-zinc-950 flex flex-col items-center justify-center gap-1 shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 stroke-[3px]" />
            <span className="text-lg font-black uppercase tracking-tighter">
              Accept Proposal
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">
            Proceed to production
          </span>
        </Button>

        {/* Request Changes Button */}
        <Button
          variant="outline"
          onClick={() => setIsRequestChangesDrawerOpen(true)}
          className="group h-24 rounded-[2rem] bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white flex flex-col items-center justify-center gap-1 transition-all hover:scale-[1.02] active:scale-95"
        >
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            <span className="text-lg font-black uppercase tracking-tighter">
              Request Changes
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
            Modify scope or pricing
          </span>
        </Button>

        {/* Reject Button */}
        <Button
          variant="outline"
          onClick={() => setIsRejectDrawerOpen(true)}
          className="group h-24 rounded-[2rem] bg-red-500/5 border-red-500/10 hover:bg-red-500/10 hover:border-red-500/20 text-red-400 flex flex-col items-center justify-center gap-1 transition-all hover:scale-[1.02] active:scale-95"
        >
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5" />
            <span className="text-lg font-black uppercase tracking-tighter text-red-400">
              Decline
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-red-500/40">
            I don't wish to proceed
          </span>
        </Button>
      </div>

      <AcceptQuotationDrawer
        isOpen={isAcceptDrawerOpen}
        onClose={() => setIsAcceptDrawerOpen(false)}
        quotation={quotation}
      />

      <RequestChangesDrawer
        isOpen={isRequestChangesDrawerOpen}
        onClose={() => setIsRequestChangesDrawerOpen(false)}
        quotation={quotation}
      />

      <RejectQuotationDrawer
        isOpen={isRejectDrawerOpen}
        onClose={() => setIsRejectDrawerOpen(false)}
        quotation={quotation}
      />
    </>
  );
}
