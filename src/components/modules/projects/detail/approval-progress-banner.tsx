"use client";

import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  RotateCcw,
  Loader2,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ApprovalProgressBannerProps {
  projectId: string;
  deliverables: any[];
  versionCount?: number;
}

export function ApprovalProgressBanner({
  projectId,
  deliverables,
  versionCount = 0,
}: ApprovalProgressBannerProps) {
  const [isApproving, setIsApproving] = useState(false);

  const approveAll = useMutation(
    // @ts-ignore
    api.functions.deliverables.mutations.clientApproveDeliverables,
  );

  const approvedCount = deliverables.filter((d) => d.isStudioApproved).length;
  const totalCount = deliverables.length;
  const progress = (approvedCount / totalCount) * 100;

  const versionsCount = deliverables.filter(
    (d) => !!d.latestVersionStatus && d.latestVersionStatus !== "resolved",
  ).length;
  const allReviewed = approvedCount + versionsCount === totalCount;
  const fullyApproved = approvedCount === totalCount;

  const handleConfirmAll = async () => {
    setIsApproving(true);
    try {
      await approveAll({ projectId: projectId as Id<"projects"> });
      toast.success(
        "All deliverables approved! Processing for final delivery.",
      );
    } catch (error: any) {
      toast.error(error.message || "Failed to finalize approval");
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="p-8 rounded-[2.5rem] bg-zinc-900/50 border border-white/5 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-4 flex-1">
          <div className="space-y-2">
            <h3 className="text-xl font-black uppercase tracking-tight text-white leading-tight flex items-center gap-3">
              Review Progress
              {fullyApproved && (
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  Ready to Finalize
                </span>
              )}
            </h3>
            <p className="text-xs font-bold text-white/30 uppercase tracking-widest leading-relaxed max-w-md">
              {approvedCount} of {totalCount} deliverables approved.
              {versionsCount > 0 &&
                ` • ${versionsCount} version request(s) active.`}
            </p>
          </div>

          <div className="space-y-2">
            <Progress
              value={progress}
              className="h-1.5 bg-white/5"
              indicatorClassName="bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
            />
            <div className="flex justify-between text-[9px] font-black uppercase tracking-[0.2em] text-white/20">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3 shrink-0">
          <Button
            onClick={handleConfirmAll}
            disabled={isApproving || !fullyApproved}
            className={cn(
              "rounded-2xl h-14 min-w-[200px] gap-3 px-10 shadow-lg transition-all border-none font-black uppercase tracking-widest",
              fullyApproved
                ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20"
                : "bg-white/5 text-white/20 cursor-not-allowed",
            )}
          >
            {isApproving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShieldCheck className="h-4 w-4" />
            )}
            Confirm All Approved
          </Button>

          {!fullyApproved && (
            <p className="text-[9px] font-black uppercase tracking-widest text-amber-500/50 animate-pulse">
              Approve all items to finalize
            </p>
          )}
        </div>
      </div>

      {versionCount >= 3 && (
        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-500/80 leading-relaxed">
            Major Versions: {versionCount}/3 used.
          </p>
        </div>
      )}
    </div>
  );
}
