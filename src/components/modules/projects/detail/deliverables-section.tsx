"use client";

import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useQuery, useAction } from "convex/react";
import { ShieldCheck, Info, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { DeliverableCard } from "@/components/modules/admin/projects/project-detail/deliverables/list/deliverable-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ApprovalProgressBanner } from "./approval-progress-banner";
import { DeliverableReviewCard } from "./deliverable-review-card";

interface DeliverablesSectionProps {
  projectId: string;
  actionState?: string;
  versionCount?: number;
}

export function DeliverablesSection({
  projectId,
  actionState,
  versionCount,
}: DeliverablesSectionProps) {
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [loadingUrls, setLoadingUrls] = useState(false);

  const deliverables = useQuery(
    api.functions.deliverables.queries.getClientDeliverables,
    { projectId: projectId as Id<"projects"> },
  );

  const getSignedUrlsAction = useAction(
    api.functions.storage.actions.getSignedFileUrls,
  );

  useEffect(() => {
    async function fetchUrls() {
      if (
        deliverables &&
        deliverables.length > 0 &&
        !loadingUrls &&
        Object.keys(signedUrls).length === 0
      ) {
        setLoadingUrls(true);
        try {
          const keys = deliverables
            .map((d) => d.minioKey)
            .filter(Boolean) as string[];
          if (keys.length > 0) {
            const urlsMap = await getSignedUrlsAction({ storageKeys: keys });
            const validUrls: Record<string, string> = {};
            for (const key of Object.keys(urlsMap)) {
              if (urlsMap[key]) validUrls[key] = urlsMap[key]!;
            }
            setSignedUrls(validUrls);
          }
        } catch (error) {
          console.error("Error fetching signed URLs:", error);
        } finally {
          setLoadingUrls(false);
        }
      }
    }
    fetchUrls();
  }, [deliverables, getSignedUrlsAction]);

  if (deliverables === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full rounded-2xl bg-white/5" />
        <Skeleton className="h-24 w-full rounded-2xl bg-white/5" />
      </div>
    );
  }

  if (deliverables.length === 0) {
    return null;
  }

  const isReviewMode = actionState === "awaiting_review";

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
            {isReviewMode
              ? "Please review each deliverable individually. You can approve them one by one or request changes if needed. Once all items are approved, you can finalize the review."
              : "Review your deliverables below. You can preview them directly in your browser or download them for offline review."}
          </p>
        </div>
      </div>

      {isReviewMode && (
        <ApprovalProgressBanner
          projectId={projectId}
          deliverables={deliverables}
          versionCount={versionCount}
        />
      )}

      {/* Deliverables Grid */}
      <div
        className={cn(
          "grid gap-6",
          isReviewMode
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            : "grid-cols-1",
        )}
      >
        {deliverables.map((item) =>
          isReviewMode ? (
            <DeliverableReviewCard
              key={item._id}
              deliverable={item}
              projectId={projectId as Id<"projects">}
              signedUrl={signedUrls[item.minioKey]}
            />
          ) : (
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
              signedUrl={signedUrls[item.minioKey]}
            />
          ),
        )}
      </div>
    </motion.div>
  );
}
