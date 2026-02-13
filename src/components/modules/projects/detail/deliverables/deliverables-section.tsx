"use client";

import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useQuery, useAction } from "convex/react";
import { ShieldCheck, Info, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { DeliverableCard } from "@/components/modules/admin/projects/project-detail/deliverables/list/deliverable-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ApprovalProgressBanner } from "./approval-progress-banner";
import { DeliverableReviewCard } from "./deliverable-review-card";
import { DetailSection } from "../shared";

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
    //@ts-ignore
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

  // Loading state
  if (deliverables === undefined) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Section Header Skeleton */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-lg bg-white/5" />
          <Skeleton className="h-3 w-36 rounded bg-white/5" />
        </div>

        {/* Stats Row Skeleton */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-3 w-28 rounded bg-white/5" />
          <Skeleton className="h-3 w-36 rounded bg-white/5" />
        </div>

        {/* Card Skeletons */}
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 rounded-2xl bg-white/3 border border-white/5"
            >
              <Skeleton className="h-12 w-12 rounded-xl bg-white/5 shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48 rounded bg-white/5" />
                <Skeleton className="h-3 w-32 rounded bg-white/5" />
              </div>
              <div className="text-right">
                <Skeleton className="h-3 w-20 rounded bg-white/5 mb-2" />
                <Skeleton className="h-3 w-16 rounded bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (deliverables.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <DetailSection
          title="Final Deliverables"
          icon={<ShieldCheck className="h-5 w-5" />}
          noContainer
        >
          <div className="flex flex-col items-center justify-center py-16 text-center rounded-3xl bg-white/3 border border-white/5">
            <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
              <ShieldCheck className="h-7 w-7 text-white/20" />
            </div>
            <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-2">
              No Deliverables Yet
            </h3>
            <p className="text-[11px] font-medium text-white/30 uppercase tracking-widest max-w-md leading-relaxed">
              Your finalized media files will appear here once uploaded and
              approved by the quality control team
            </p>
          </div>
        </DetailSection>
      </motion.div>
    );
  }

  const isReviewMode = actionState === "awaiting_review";

  // Compute approved count
  const approvedCount = deliverables.filter(
    (d) => d.status === "approved",
  ).length;

  // Get contextual status badge config
  const getStatusBadge = () => {
    if (actionState === "awaiting_review") {
      return {
        label: "AWAITING REVIEW",
        className: "bg-amber-500/10 border-amber-500/20 text-amber-500",
      };
    }
    if (actionState === "review_approved") {
      return {
        label: "APPROVED",
        className: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
      };
    }
    return {
      label: "DELIVERED",
      className: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
    };
  };

  const statusBadge = getStatusBadge();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-0"
    >
      <DetailSection
        title="Final Deliverables"
        icon={<ShieldCheck className="h-5 w-5" />}
        noContainer
        action={
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
              {deliverables.length} Deliverables
            </span>
            <span
              className={cn(
                "px-3 py-1 rounded-full text-[9px] tracking-[0.2em] font-black uppercase border",
                statusBadge.className,
              )}
            >
              {statusBadge.label}
            </span>
            <Link
              href={`/projects/${projectId}/deliverables`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest text-primary/80 bg-primary/5 border border-primary/10 hover:bg-primary/10 hover:border-primary/20 hover:text-primary transition-all"
            >
              View All
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        }
      >
        {/* Stats Row */}
        <div className="flex flex-wrap items-center gap-4 mb-6 mt-2">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
              {approvedCount}/{deliverables.length} Approved
            </span>
          </div>
          {versionCount != null && versionCount > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400/60">
                {versionCount} Version Request{versionCount > 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>

        {/* Info Banner */}
        <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-start gap-4 mb-6">
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

        {/* Approval Progress Banner (Review Mode Only) */}
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
          {deliverables.map((item, index) =>
            isReviewMode ? (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                <DeliverableReviewCard
                  deliverable={item}
                  projectId={projectId as Id<"projects">}
                  signedUrl={signedUrls[item.minioKey]}
                />
              </motion.div>
            ) : (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
              >
                <DeliverableCard
                  id={item._id}
                  projectId={projectId}
                  name={item.name}
                  version={item.version}
                  sizeBytes={item.sizeBytes}
                  status={item.status}
                  createdAt={item._creationTime}
                  uploadedByName={item.uploadedByName || "PrimeEditz Team"}
                  signedUrl={signedUrls[item.minioKey]}
                  href={`/projects/${projectId}/deliverables/${item._id}`}
                />
              </motion.div>
            ),
          )}
        </div>
      </DetailSection>
    </motion.div>
  );
}
