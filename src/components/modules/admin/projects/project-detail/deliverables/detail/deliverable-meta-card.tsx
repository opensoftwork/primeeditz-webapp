"use client";

import { CheckCircle, Clock, User, XCircle, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeliverableMetaCardProps {
  status: "pending_qc" | "approved" | "revision_needed" | "revision_requested";
  uploadedByName: string;
}

export function DeliverableMetaCard({
  status,
  uploadedByName,
}: DeliverableMetaCardProps) {
  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-6">
        {/* Status */}
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/30">
            Current Status
          </p>
          <div
            className={cn(
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider",
              status === "approved"
                ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/10"
                : status === "revision_requested"
                  ? "text-red-400 border-red-500/20 bg-red-500/10"
                  : status === "revision_needed"
                    ? "text-orange-400 border-orange-500/20 bg-orange-500/10"
                    : "text-amber-400 border-amber-500/20 bg-amber-500/10"
            )}
          >
            {status === "approved" && <CheckCircle className="h-3.5 w-3.5" />}
            {(status === "revision_requested" || status === "revision_needed") && (
              <XCircle className="h-3.5 w-3.5" />
            )}
            {status === "pending_qc" && <Clock className="h-3.5 w-3.5" />}
            {status.replace(/_/g, " ")}
          </div>
        </div>

        {/* Submitted By */}
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/30">
            Submitted By
          </p>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
              <User className="h-4 w-4 text-indigo-400" />
            </div>
            <span className="text-sm font-bold text-white">
              {uploadedByName}
            </span>
          </div>
        </div>
      </div>

      {/* QC Info Card */}
      <div className="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10">
        <div className="flex gap-4">
          <ShieldCheck className="h-5 w-5 text-indigo-400 shrink-0 mt-1" />
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-indigo-300">
              Quality Control
            </h4>
            <p className="text-[10px] font-medium text-indigo-200/60 mt-2 leading-relaxed">
              Verify technical specs, resolution, and format compliance before
              sending to studio.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
