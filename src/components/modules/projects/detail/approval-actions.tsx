"use client";

import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, RotateCcw, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { ClientRevisionDialog } from "./revision-dialog";

interface ApprovalActionsProps {
  projectId: string;
  revisionCount?: number;
}

export function ApprovalActions({ projectId, revisionCount = 0 }: ApprovalActionsProps) {
  const [isApproving, setIsApproving] = useState(false);
  const [showRevisionDialog, setShowRevisionDialog] = useState(false);

  const approveAll = useMutation(api.functions.deliverables.mutations.clientApproveDeliverables);
  const requestRevision = useMutation(api.functions.deliverables.mutations.clientRequestRevision);

  const handleApproveAll = async () => {
    setIsApproving(true);
    try {
      await approveAll({ projectId: projectId as Id<"projects"> });
      toast.success("Deliverables approved! Preparing for final delivery.");
    } catch (error: any) {
      toast.error(error.message || "Failed to approve deliverables");
    } finally {
      setIsApproving(false);
    }
  };

  const handleRequestRevision = async (notes: string) => {
    try {
      await requestRevision({ 
        projectId: projectId as Id<"projects">, 
        revisionNotes: notes 
      });
      toast.success("Revision request submitted successfully.");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit revision request");
      throw error;
    }
  };

  return (
    <div className="p-8 rounded-[2.5rem] bg-zinc-900/50 border border-white/5 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h3 className="text-xl font-black uppercase tracking-tight text-white leading-tight">
            Review Complete?
          </h3>
          <p className="text-xs font-bold text-white/30 uppercase tracking-widest leading-relaxed max-w-md">
            Once you approve all deliverables, the project will move to the final delivery phase where you can access high-resolution assets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setShowRevisionDialog(true)}
            className="rounded-2xl h-14 border-white/5 bg-white/2 gap-3 px-6 hover:bg-white/5 transition-all group"
          >
            <RotateCcw className="h-4 w-4 text-white/40 group-hover:rotate-180 transition-transform duration-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/80">
              Request Revision
            </span>
          </Button>

          <Button
            onClick={handleApproveAll}
            disabled={isApproving}
            className="rounded-2xl h-14 bg-emerald-600 hover:bg-emerald-500 text-white gap-3 px-10 shadow-lg shadow-emerald-600/20 transition-all border-none"
          >
            {isApproving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            <span className="text-[10px] font-black uppercase tracking-widest">
              Approve All
            </span>
          </Button>
        </div>
      </div>

      {revisionCount >= 3 && (
        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-500/80 leading-relaxed">
            Note: You have used {revisionCount} revisions. Additional revisions may incur supplemental charges as per our service agreement.
          </p>
        </div>
      )}

      <ClientRevisionDialog
        open={showRevisionDialog}
        onOpenChange={setShowRevisionDialog}
        onSubmit={handleRequestRevision}
      />
    </div>
  );
}
