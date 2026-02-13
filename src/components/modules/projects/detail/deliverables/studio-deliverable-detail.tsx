"use client";

import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useQuery, useAction, useMutation } from "convex/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileIcon,
  Download,
  ShieldCheck,
  Calendar,
  HardDrive,
  CheckCircle,
  RotateCcw,
  Loader2,
  Info,
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useBreadcrumbStore } from "@/store/breadcrumb-store";
import { DeliverablePreview } from "@/components/modules/admin/projects/project-detail/deliverables/detail/deliverable-preview";
import { VersionHistory } from "@/components/modules/admin/projects/project-detail/deliverables/detail/version-history";
import type { DeliverableVersion } from "@/components/modules/admin/projects/project-detail/deliverables/detail/types";
import Link from "next/link";
import { toast } from "sonner";

interface StudioDeliverableDetailViewProps {
  projectId: string;
  deliverableId: string;
}

export function StudioDeliverableDetailView({
  projectId,
  deliverableId,
}: StudioDeliverableDetailViewProps) {
  const { setOverride, removeOverride } = useBreadcrumbStore();
  const router = useRouter();

  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [viewedVersion, setViewedVersion] = useState<{
    version: number;
    minioKey: string;
    mimeType?: string;
    description?: string;
  } | null>(null);
  const [isApproving, setIsApproving] = useState(false);

  // Queries
  const deliverable = useQuery(
    //@ts-ignore
    api.functions.deliverables.queries.getDeliverable,
    { deliverableId: deliverableId as Id<"deliverables"> },
  );

  const versions = useQuery(
    api.functions.deliverables.queries.getDeliverableVersions,
    deliverable
      ? { deliverableId: deliverableId as Id<"deliverables"> }
      : "skip",
  );

  // Check if studio has ever requested versions for this deliverable
  const versionRequests = useQuery(
    api.functions.deliverables.queries.getDeliverableVersionRequests,
    deliverable
      ? { deliverableId: deliverableId as Id<"deliverables"> }
      : "skip",
  );

  // Mutations
  const studioApprove = useMutation(
    // @ts-ignore
    api.functions.deliverables.mutations.studioApproveDeliverable,
  );

  // Actions
  const getSignedUrlAction = useAction(
    api.functions.storage.actions.getSignedFileUrl,
  );

  // Breadcrumb override
  useEffect(() => {
    if (deliverable) {
      setOverride(deliverableId, deliverable.name);
    }
    return () => removeOverride(deliverableId);
  }, [deliverableId, deliverable, setOverride, removeOverride]);

  // Fetch signed URL for current file (or viewed version)
  useEffect(() => {
    async function fetchUrl() {
      const keyToFetch = viewedVersion?.minioKey || deliverable?.minioKey;
      if (keyToFetch) {
        try {
          const url = await getSignedUrlAction({
            storageKey: keyToFetch,
          });
          setFileUrl(url);
        } catch (error) {
          console.error("Error fetching signed URL:", error);
        }
      }
    }
    fetchUrl();
  }, [deliverable?.minioKey, viewedVersion?.minioKey, getSignedUrlAction]);

  // Handle version selection
  const handleVersionSelect = (version: any) => {
    setViewedVersion({
      version: version.displayVersionNumber || version.versionNumber,
      minioKey: version.minioKey,
      mimeType: version.mimeType,
      description: version.description,
    });
    setFileUrl(null); // Reset to fetch new URL
  };

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await studioApprove({
        deliverableId: deliverableId as Id<"deliverables">,
        projectId: projectId as Id<"projects">,
      });
      toast.success(`"${deliverable?.name}" approved`);
    } catch (error: any) {
      toast.error(error.message || "Failed to approve deliverable");
    } finally {
      setIsApproving(false);
    }
  };

  // Loading state
  if (deliverable === undefined) {
    return <StudioDeliverableDetailSkeleton />;
  }

  // Not found
  if (deliverable === null) {
    return (
      <div className="p-8 md:p-12 text-center space-y-4">
        <p className="text-white/40 text-sm uppercase tracking-widest font-bold">
          Deliverable not found
        </p>
        <Button variant="outline" className="rounded-xl" asChild>
          <Link href={`/projects/${projectId}/deliverables`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Deliverables
          </Link>
        </Button>
      </div>
    );
  }

  const formattedSize = (deliverable.sizeBytes / (1024 * 1024)).toFixed(2);
  const hasMultipleVersions = versions && versions.length > 1;
  // Only show version history if the studio has actually requested changes
  const studioHasRequestedVersions =
    versionRequests && versionRequests.length > 0;
  const currentVersionNumber =
    viewedVersion?.version || deliverable.studioVersion || 1;
  const currentMimeType = viewedVersion?.mimeType || deliverable.mimeType;
  const currentDescription =
    viewedVersion?.description || deliverable.description;
  const isApproved = deliverable.isStudioApproved;
  const isPendingVersion =
    deliverable.latestVersionStatus === "pending" ||
    deliverable.latestVersionStatus === "in_progress";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 md:p-12 space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4">
        <div className="flex items-center gap-5">
          <Button
            variant="outline"
            size="icon"
            asChild
            className="h-11 w-11 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 border-white/10 shrink-0 shadow-lg"
          >
            <Link href={`/projects/${projectId}/deliverables`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400/60">
                DELIVERABLE REVIEW
              </span>
              {isApproved && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                  <CheckCircle className="h-3 w-3" />
                  Approved
                </span>
              )}
            </div>
            <h1 className="text-2xl xl:text-3xl font-black uppercase tracking-tighter text-white">
              {deliverable.name}
            </h1>
            <div className="flex items-center gap-3 mt-1.5 opacity-60">
              <p className="text-xs text-indigo-400 uppercase tracking-widest font-black">
                Viewing v{currentVersionNumber}
              </p>
              <span className="text-white/20">|</span>
              <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">
                {formattedSize} MB • {format(deliverable._creationTime, "PPP")}
              </p>
            </div>
          </div>
        </div>

        {fileUrl && (
          <Button
            variant="outline"
            asChild
            className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest h-11 px-6 transition-all"
          >
            <a
              href={fileUrl}
              download={deliverable.name}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download className="h-4 w-4 mr-2" />
              Download File
            </a>
          </Button>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Preview — 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {viewedVersion &&
            viewedVersion.version !== (deliverable.studioVersion || 1) && (
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Info className="h-4 w-4 text-indigo-400" />
                  <p className="text-xs font-bold text-indigo-300">
                    Viewing a historical version. Actions apply to the latest
                    release.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white"
                  onClick={() => setViewedVersion(null)}
                >
                  Back to Latest
                </Button>
              </div>
            )}
          <DeliverablePreview
            url={fileUrl}
            fileName={deliverable.name}
            mimeType={currentMimeType}
            description={currentDescription}
          />
        </div>

        {/* Sidebar — 1/3 width */}
        <div className="space-y-6">
          {/* Status & Meta Card */}
          <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5 space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <FileIcon className="h-12 w-12" />
            </div>
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-white/30">
                File Details
              </h3>
              <div className="space-y-4">
                <MetaItem
                  icon={<ShieldCheck className="h-4 w-4" />}
                  label="Review Status"
                  value={
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border",
                        isApproved
                          ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/10"
                          : "text-amber-400 border-amber-500/20 bg-amber-500/10",
                      )}
                    >
                      {isApproved ? "Approved" : "Pending Review"}
                    </span>
                  }
                />
                <MetaItem
                  icon={<HardDrive className="h-4 w-4" />}
                  label="File Info"
                  value={
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">
                        {formattedSize} MB
                      </span>
                      <span className="text-white/20 px-1.5">•</span>
                      <span className="text-xs font-bold text-white/60 lowercase">
                        {currentMimeType?.split("/")[1] || "File"}
                      </span>
                    </div>
                  }
                />
                <MetaItem
                  icon={<Calendar className="h-4 w-4" />}
                  label="Delivered On"
                  value={
                    <span className="text-sm font-bold text-white">
                      {format(
                        deliverable._creationTime,
                        "MMM dd, yyyy • HH:mm",
                      )}
                    </span>
                  }
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-white/5 space-y-3">
              {isApproved ? (
                <div className="flex items-center justify-center gap-2 py-4 px-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Deliverable Approved
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  <Button
                    onClick={handleApprove}
                    disabled={isApproving || isPendingVersion}
                    className="h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-600/20 border-none transition-all"
                  >
                    {isApproving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Approve Deliverable
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      router.push(
                        `/projects/${projectId}/deliverables/${deliverableId}/versions/new`,
                      )
                    }
                    disabled={isApproving || isPendingVersion}
                    className="h-12 rounded-2xl border-white/10 hover:bg-white/5 text-white/80 font-black uppercase tracking-widest text-[10px] transition-all"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Request Changes
                  </Button>
                </div>
              )}
              {isPendingVersion && (
                <p className="text-[9px] font-black text-center text-amber-500/60 uppercase tracking-widest">
                  Changes requested • Awaiting new version
                </p>
              )}
            </div>
          </div>

          {/* Version History List — only shown when studio has requested changes */}
          {hasMultipleVersions && studioHasRequestedVersions && (
            <VersionHistory
              versions={versions as DeliverableVersion[]}
              currentVersionNumber={currentVersionNumber}
              onSelect={handleVersionSelect}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Helpers ──────────────────────────────────────────────

function MetaItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 text-white/30">
        {icon}
        <span className="text-[10px] font-black uppercase tracking-widest">
          {label}
        </span>
      </div>
      <div>{value}</div>
    </div>
  );
}

function StudioDeliverableDetailSkeleton() {
  return (
    <div className="p-6 md:p-12 space-y-8 animate-pulse">
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-9 rounded-lg bg-white/5" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-48 rounded bg-white/5" />
          <Skeleton className="h-3 w-32 rounded bg-white/5" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Skeleton className="lg:col-span-2 h-[500px] rounded-3xl bg-white/5" />
        <div className="space-y-6">
          <Skeleton className="h-12 rounded-xl bg-white/5" />
          <Skeleton className="h-64 rounded-3xl bg-white/5" />
        </div>
      </div>
    </div>
  );
}
