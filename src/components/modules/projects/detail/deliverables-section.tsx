"use client";

import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { ShieldCheck, Info } from "lucide-react";
import { motion } from "motion/react";
import { DeliverableCard } from "@/components/modules/admin/projects/project-detail/deliverables/list/deliverable-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ApprovalActions } from "./approval-actions";

interface DeliverablesSectionProps {
  projectId: string;
  actionState?: string;
  revisionCount?: number;
}

export function DeliverablesSection({ 
  projectId, 
  actionState, 
  revisionCount 
}: DeliverablesSectionProps) {
  const deliverables = useQuery(
    api.functions.deliverables.queries.getClientDeliverables,
    { projectId: projectId as Id<"projects"> }
  );

  if (deliverables === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full rounded-2xl bg-white/5" />
        <Skeleton className="h-24 w-full rounded-2xl bg-white/5" />
      </div>
    );
  }

  if (deliverables.length === 0) {
    return (
      <div className="p-12 rounded-[2.5rem] border border-dashed border-white/10 bg-white/2 text-center space-y-4">
        <div className="h-16 w-16 rounded-full bg-white/5 border border-white/5 flex items-center justify-center mx-auto">
          <ShieldCheck className="h-8 w-8 text-white/20" />
        </div>
        <div>
          <h3 className="text-lg font-black uppercase tracking-tight text-white/40">
            No Deliverables Ready
          </h3>
          <p className="text-xs font-bold text-white/20 uppercase tracking-widest mt-2 max-w-xs mx-auto">
            Once our team completes the QC process, your finalized assets will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-3">
            Final Deliverables
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] tracking-[0.2em] font-black uppercase">
              QC APPROVED
            </span>
          </h2>
          <p className="text-sm font-bold text-white/40 uppercase tracking-widest mt-1">
            Review and approve your finalized media files
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-start gap-4">
        <div className="h-8 w-8 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shrink-0 mt-0.5">
          <Info className="h-4 w-4 text-indigo-400" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-indigo-300 uppercase tracking-tight">
            Review Instructions
          </h4>
          <p className="text-[11px] font-medium text-indigo-300/60 leading-relaxed uppercase tracking-widest">
            Please review the deliverables below. You can preview them directly in your browser or download them for offline review. 
            Once approved, they are finalized for delivery.
          </p>
        </div>
      </div>

      {actionState === "awaiting_review" && (
        <ApprovalActions
          projectId={projectId}
          revisionCount={revisionCount}
        />
      )}

      {/* Deliverables Grid */}
      <div className="grid grid-cols-1 gap-4">
        {deliverables.map((item) => (
          <DeliverableCard
            key={item._id}
            id={item._id}
            projectId={projectId}
            name={item.name}
            version={item.version}
            sizeBytes={item.sizeBytes}
            status={item.status}
            createdAt={item._creationTime}
            uploadedByName="PrimeEditz Team"
          />
        ))}
      </div>
    </motion.div>
  );
}
