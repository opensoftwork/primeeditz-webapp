"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { CheckCircle2, AlertTriangle, X, ArrowRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
    //@ts-ignore
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
            "p-4 rounded-2xl border flex items-start gap-4 animate-in fade-in slide-in-from-top-2 duration-300",
            change.status === "approved"
              ? "bg-emerald-500/10 border-emerald-500/20"
              : "bg-amber-500/10 border-amber-500/20",
          )}
        >
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {change.status === "approved" ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
                )}
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
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {(role === "employee" ||
                  role === "admin" ||
                  role === "studio") &&
                  change.status === "version_requested" && (
                    <Button
                      variant="ghost"
                      asChild
                      className="h-9 px-4 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-[9px] font-black uppercase tracking-widest border border-amber-500/20 transition-all"
                    >
                      <Link
                        href={
                          role === "employee"
                            ? change.latestVersionRequestId
                              ? `/assigned-work/${projectId}/deliverables/${change._id}/versions/${change.latestVersionRequestId}`
                              : `/assigned-work/${projectId}/deliverables/${change._id}/versions`
                            : change.latestVersionRequestId
                              ? `/projects/${projectId}/deliverables/${change._id}/versions/${change.latestVersionRequestId}`
                              : `/projects/${projectId}/deliverables/${change._id}/versions`
                        }
                      >
                        Open Versions <ArrowRight className="h-3 w-3 ml-2" />
                      </Link>
                    </Button>
                  )}

                {change.status === "approved" && (
                  <Button
                    variant="ghost"
                    asChild
                    className="h-9 px-4 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 text-[9px] font-black uppercase tracking-widest border border-emerald-500/20 transition-all"
                  >
                    <Link
                      href={
                        role === "employee"
                          ? `/assigned-work/${projectId}/deliverables/${change._id}`
                          : `/projects/${projectId}/deliverables/${change._id}`
                      }
                    >
                      View Details <ArrowRight className="h-3 w-3 ml-2" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>

            {change.versionFeedback &&
              change.status === "version_requested" && (
                <div className="mt-3 ml-8 text-xs text-white/60 bg-white/5 p-3 rounded-xl border border-white/5 italic">
                  "{change.versionFeedback}"
                </div>
              )}
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
