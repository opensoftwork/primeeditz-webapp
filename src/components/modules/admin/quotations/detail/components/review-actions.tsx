"use client";

import { cn } from "@/lib/utils";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { CheckCircle2, Loader2, ShieldAlert, XCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface ReviewActionsProps {
  quotation: {
    _id: Id<"quotations">;
    status: string;
    assignedEmployeeId?: Id<"profiles">;
  };
}

export function ReviewActions({ quotation }: ReviewActionsProps) {
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Queries & Mutations
  const approveQuotation = useMutation(
    // @ts-ignore
    api.functions.quotations.mutations.approveQuotation,
  );
  const rejectQuotation = useMutation(
    api.functions.quotations.mutations.rejectQuotationByAdmin,
  );

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await approveQuotation({
        quotationId: quotation._id,
      });
      toast.success("Quotation approved and projects initialized");
      setIsApproveDialogOpen(false);
    } catch (err) {
      toast.error("Failed to approve quotation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    setIsSubmitting(true);
    try {
      await rejectQuotation({
        quotationId: quotation._id,
        reason: rejectionReason,
      });
      toast.success("Quotation rejected");
      setIsRejectDialogOpen(false);
    } catch (err) {
      toast.error("Failed to reject quotation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canReview = ["initiated", "draft", "changes_requested"].includes(
    quotation.status,
  );

  if (
    !canReview &&
    quotation.status !== "sent" &&
    quotation.status !== "viewed"
  ) {
    return null;
  }

  const isPendingAction =
    quotation.status === "initiated" ||
    quotation.status === "changes_requested";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "p-6 rounded-4xl space-y-6 transition-all duration-300",
        isPendingAction
          ? "bg-red-500/5 border-2 border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
          : "bg-amber-400/5 border border-amber-400/10",
      )}
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-amber-400/10 flex items-center justify-center text-amber-400">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-tight text-white">
            Review Protocol
          </h3>
          <p className="text-[10px] font-bold text-amber-400/50 uppercase tracking-widest">
            Action Required by Admin
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => setIsApproveDialogOpen(true)}
            className="h-11 rounded-xl bg-emerald-500 text-black font-black uppercase tracking-widest text-[10px] hover:bg-emerald-400 transition-all hover:scale-[1.02]"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Approve Quotation
          </Button>
          <Button
            onClick={() => setIsRejectDialogOpen(true)}
            variant="outline"
            className="h-11 rounded-xl bg-white/5 border-white/10 text-white font-black uppercase tracking-widest text-[10px] hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Reject
          </Button>
        </div>
      </div>

      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white rounded-4xl">
          <DialogHeader className="space-y-4">
            <DialogTitle className="text-2xl font-black uppercase tracking-tight">
              Initialize Production?
            </DialogTitle>
            <DialogDescription className="text-white/40 font-bold uppercase tracking-widest text-[10px] leading-relaxed">
              This will approve the quotation and automatically initialize all
              associated projects. The Studio will be notified to start
              uploading assets.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4">
            <Button
              variant="ghost"
              onClick={() => setIsApproveDialogOpen(false)}
              className="text-white/40 font-bold uppercase tracking-widest text-[10px]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              className="bg-emerald-500 text-black font-extrabold uppercase tracking-widest text-[10px] px-8 rounded-xl h-11"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Confirm Approval"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white rounded-4xl">
          <DialogHeader className="space-y-4">
            <DialogTitle className="text-2xl font-black uppercase tracking-tight">
              Reject Request?
            </DialogTitle>
            <DialogDescription className="text-white/40 font-bold uppercase tracking-widest text-[10px] leading-relaxed">
              Provide a clear reason for rejection. The studio will see this
              reason and can re-initiate the request.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter rejection reason..."
              className="min-h-[120px] bg-white/3 border-white/10 rounded-2xl text-white font-medium p-4 focus:ring-red-500/20 focus:border-red-500/30"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsRejectDialogOpen(false)}
              className="text-white/40 font-bold uppercase tracking-widest text-[10px]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              className="bg-red-500 text-white font-extrabold uppercase tracking-widest text-[10px] px-8 rounded-xl h-11"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Confirm Rejection"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
