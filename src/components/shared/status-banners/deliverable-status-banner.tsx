"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { CheckCircle2, AlertTriangle, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface DeliverableStatusBannerProps {
  projectId: Id<"projects">;
  role: "employee" | "studio" | "admin";
}

export function DeliverableStatusBanner({
  projectId,
  role,
}: DeliverableStatusBannerProps) {
  const [dismissed, setDismissed] = useState<string[]>([]);

  // Get recent deliverable status changes
  const recentChanges = useQuery(
    api.functions.deliverables.queries.getRecentStatusChanges,
    { projectId },
  );

  if (!recentChanges?.length) return null;

  const visibleChanges = recentChanges.filter(
    (c) => !dismissed.includes(c._id),
  );

  if (!visibleChanges.length) return null;

  return (
    <div className="space-y-3">
      {visibleChanges.map((change) => (
        <div
          key={change._id}
          className={cn(
            "p-4 rounded-2xl border flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300",
            change.status === "approved"
              ? "bg-emerald-500/10 border-emerald-500/20"
              : "bg-amber-500/10 border-amber-500/20",
          )}
        >
          {change.status === "approved" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          )}

          <div className="flex-1">
            <p
              className={cn(
                "text-sm font-bold uppercase tracking-tight",
                change.status === "approved"
                  ? "text-emerald-300"
                  : "text-amber-300",
              )}
            >
              {change.status === "approved"
                ? `Deliverable "${change.name}" approved! 🎉`
                : `Version change requested on "${change.name}"`}
            </p>

            {change.versionFeedback &&
              change.status === "version_requested" && (
                <div className="mt-2 text-xs text-white/60 bg-white/5 p-3 rounded-xl border border-white/5 italic">
                  "{change.versionFeedback}"
                </div>
              )}

            <div className="mt-3 flex items-center gap-4">
              <Link
                href={
                  role === "employee" && change.status === "version_requested"
                    ? `/assigned-work/${projectId}/deliverables/${change._id}/versions`
                    : `/projects/${projectId}/deliverables/${change._id}`
                }
                className={cn(
                  "text-[10px] font-black uppercase tracking-widest hover:underline",
                  change.status === "approved"
                    ? "text-emerald-400/80"
                    : "text-amber-400/80",
                )}
              >
                {role === "employee" && change.status === "version_requested"
                  ? "Open Versions Workspace →"
                  : "View Details →"}
              </Link>
            </div>
          </div>

          <button
            onClick={() => setDismissed([...dismissed, change._id])}
            className="text-white/30 hover:text-white/60 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
