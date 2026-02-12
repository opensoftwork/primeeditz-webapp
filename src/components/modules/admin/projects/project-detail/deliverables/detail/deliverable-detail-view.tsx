"use client";

import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery, useAction } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  FileIcon,
  CheckCircle,
  Clock,
  XCircle,
  RotateCcw,
  Send,
  Loader2,
  History,
  ShieldCheck,
  User,
  Calendar,
  HardDrive,
  Eye,
  MessageSquare,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { DeliverablePreview } from "./deliverable-preview";
import { DeliverableMetaCard } from "./deliverable-meta-card";
import { DeliverableActions } from "./deliverable-actions";
import { VersionHistory } from "./version-history";
import { VersionDialog } from "./versions-dialog";
import { useBreadcrumbStore } from "@/store/breadcrumb-store";

export function DeliverableDetailView() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const deliverableId = params.deliverableId as string;
  const { setOverride, removeOverride } = useBreadcrumbStore();

  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [viewedVersion, setViewedVersion] = useState<{
    version: number;
    minioKey: string;
    mimeType?: string;
    description?: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [versionDialogOpen, setVersionDialogOpen] = useState(false);
  const [versionNotes, setVersionNotes] = useState("");

  // Queries
  const deliverable = useQuery(
    // @ts-ignore
    api.functions.deliverables.queries.getDeliverable,
    { deliverableId: deliverableId as Id<"deliverables"> },
  );

  const versions = useQuery(
    api.functions.deliverables.queries.getDeliverableVersions,
    deliverable
      ? {
          deliverableId: deliverableId as Id<"deliverables">,
        }
      : "skip",
  );

  const versionRequests = useQuery(
    api.functions.deliverables.queries.getDeliverableVersionRequests,
    { deliverableId: deliverableId as Id<"deliverables"> },
  );

  // @ts-ignore
  const project = useQuery(api.admin.getAdminProject, {
    projectId: projectId as Id<"projects">,
  });

  // Mutations
  const approveMutation = useMutation(
    api.functions.deliverables.mutations.approveDeliverable,
  );
  const sendToStudioMutation = useMutation(
    api.functions.deliverables.mutations.sendToStudio,
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

  // Sync viewed version with latest deliverable when loaded
  useEffect(() => {
    if (deliverable && !viewedVersion) {
      setViewedVersion({
        version: deliverable.version,
        minioKey: deliverable.minioKey,
        mimeType: deliverable.mimeType,
        description: deliverable.description,
      });
    }
  }, [deliverable, viewedVersion]);

  // Fetch signed URL for the VIEWED version
  useEffect(() => {
    async function fetchUrl() {
      if (viewedVersion?.minioKey) {
        try {
          const url = await getSignedUrlAction({
            storageKey: viewedVersion.minioKey,
          });
          setFileUrl(url);
        } catch (error) {
          console.error("Error fetching signed URL:", error);
        }
      }
    }
    fetchUrl();
  }, [viewedVersion?.minioKey, getSignedUrlAction]);

  // Computed permissions
  const canApprove =
    deliverable?.status === "pending_qc" ||
    deliverable?.status === "version_needed" ||
    deliverable?.status === "version_requested" ||
    deliverable?.status === "revision_requested";
  const canRequestVersion =
    deliverable?.status === "pending_qc" || deliverable?.status === "approved";
  const canSendToStudio =
    deliverable?.status === "approved" &&
    project?.actionState !== "awaiting_review" &&
    project?.actionState !== "review_approved" &&
    project?.phase !== "delivery";

  // Handlers
  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await approveMutation({
        deliverableId: deliverableId as Id<"deliverables">,
      });
      toast.success("Deliverable approved!");
    } catch (error: any) {
      toast.error(error.message || "Failed to approve deliverable");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestVersion = () => {
    router.push(
      `/projects/${projectId}/deliverables/${deliverableId}/versions/new`,
    );
  };

  const handleSendToStudio = async () => {
    setIsSubmitting(true);
    try {
      await sendToStudioMutation({
        deliverableId: deliverableId as Id<"deliverables">,
      });
      toast.success("Sent to studio for review!");
    } catch (error: any) {
      toast.error(error.message || "Failed to send to studio");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVersionSelect = (v: any) => {
    setViewedVersion({
      version: v.versionNumber,
      minioKey: v.minioKey,
      mimeType: v.mimeType,
      description: v.description,
    });
    // Scroll preview into view if on mobile
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Loading state
  if (deliverable === undefined) {
    return (
      <div className="flex min-h-[calc(100vh-120px)] w-full flex-col px-8 pt-10 pb-12">
        <div className="flex items-center gap-4 mb-10">
          <Skeleton className="h-11 w-11 rounded-xl bg-white/5" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 bg-white/5" />
            <Skeleton className="h-8 w-64 bg-white/5" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <Skeleton className="h-[600px] w-full bg-white/5 rounded-3xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 w-full bg-white/5 rounded-3xl" />
            <Skeleton className="h-32 w-full bg-white/5 rounded-3xl" />
            <Skeleton className="h-24 w-full bg-white/5 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  // Not found
  if (deliverable === null) {
    return (
      <div className="flex min-h-[calc(100vh-120px)] w-full items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto border border-white/10">
            <FileIcon className="h-8 w-8 text-white/20" />
          </div>
          <h1 className="text-xl font-black text-white">
            Deliverable Not Found
          </h1>
          <p className="text-sm text-white/40">
            This deliverable may have been removed or doesn't exist.
          </p>
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mt-4 rounded-xl border-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const statusConfig = {
    pending_qc: {
      color: "amber",
      icon: Clock,
      label: "Pending QC",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      text: "text-amber-400",
    },
    approved: {
      color: "emerald",
      icon: CheckCircle,
      label: "Approved",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      text: "text-emerald-400",
    },
    version_needed: {
      color: "orange",
      icon: RotateCcw,
      label: "Version Needed",
      bg: "bg-orange-500/10",
      border: "border-orange-500/20",
      text: "text-orange-400",
    },
    version_requested: {
      color: "red",
      icon: XCircle,
      label: "Version Requested",
      bg: "bg-red-500/10",
      border: "border-red-500/20",
      text: "text-red-400",
    },
    revision_requested: {
      color: "red",
      icon: XCircle,
      label: "Revision Requested",
      bg: "bg-red-500/10",
      border: "border-red-500/20",
      text: "text-red-400",
    },
  } as const;

  const currentStatus =
    statusConfig[deliverable.status as keyof typeof statusConfig] ||
    statusConfig.pending_qc;
  const StatusIcon = currentStatus.icon;

  return (
    <div className="flex min-h-[calc(100vh-120px)] w-full flex-col px-8 pt-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="flex items-center gap-5">
          <Button
            variant="outline"
            size="icon"
            className="rounded-xl h-11 w-11 border-white/10 bg-white/5 hover:bg-white/10 transition-all shadow-lg shrink-0"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5 text-white/60" />
          </Button>

          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400/60">
                DELIVERABLE REVIEW
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border",
                  currentStatus.bg,
                  currentStatus.border,
                  currentStatus.text,
                )}
              >
                <StatusIcon className="h-3 w-3" />
                {currentStatus.label}
              </span>
            </div>
            <h1 className="text-3xl xl:text-4xl font-black uppercase tracking-tighter text-white">
              {deliverable.name}
            </h1>
            <div className="flex items-center gap-3 mt-1.5">
              <p className="text-xs text-indigo-400 uppercase tracking-widest font-black">
                Viewing v{viewedVersion?.version ?? deliverable.version}
              </p>
              <span className="text-white/20">|</span>
              <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">
                {(deliverable.sizeBytes / (1024 * 1024)).toFixed(2)} MB •{" "}
                {format(deliverable._creationTime, "MMM dd, yyyy")}
              </p>
            </div>
          </div>
        </div>

        {/* Version History Button */}
        <Button
          variant="outline"
          onClick={() =>
            router.push(
              `/projects/${projectId}/deliverables/${deliverableId}/versions`,
            )
          }
          className="rounded-xl border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 hover:border-indigo-500/40 text-indigo-400 font-black uppercase tracking-widest text-[10px] h-11 px-5 gap-2 transition-all"
        >
          <History className="h-4 w-4" />
          Version History
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Left: Preview */}
        <div className="lg:col-span-2 space-y-6">
          {viewedVersion && viewedVersion.version !== deliverable.version && (
            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                <p className="text-xs font-bold text-indigo-300">
                  You are viewing a historical version (v{viewedVersion.version}
                  ). Actions below still apply to the latest version.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white"
                onClick={() =>
                  handleVersionSelect({
                    versionNumber: deliverable.version,
                    minioKey: deliverable.minioKey,
                    mimeType: deliverable.mimeType,
                    description: deliverable.description,
                  })
                }
              >
                Back to Latest
              </Button>
            </div>
          )}
          <DeliverablePreview
            url={fileUrl}
            fileName={deliverable.name}
            mimeType={viewedVersion?.mimeType ?? deliverable.mimeType}
            description={viewedVersion?.description ?? deliverable.description}
            versionFeedback={deliverable.versionFeedback}
          />
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-6">
          {/* Status & Meta */}
          <DeliverableMetaCard
            status={
              deliverable.status as
                | "pending_qc"
                | "approved"
                | "version_needed"
                | "version_requested"
            }
            uploadedByName={deliverable.uploadedByName || "Unknown"}
          />

          {/* Version History */}
          {versions && versions.length > 1 && (
            <VersionHistory
              versions={versions}
              currentVersionNumber={
                viewedVersion?.version ?? deliverable.version
              }
              onSelect={handleVersionSelect}
            />
          )}

          {/* Version Requests Timeline */}
          {versionRequests && versionRequests.length > 0 && (
            <div className="p-5 rounded-3xl bg-white/5 border border-white/5 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-white/50 flex items-center gap-2">
                <History className="h-3.5 w-3.5 text-indigo-400" />
                Version Requests
              </h3>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {versionRequests.map((req) => (
                  <button
                    key={req._id}
                    onClick={() =>
                      router.push(
                        `/projects/${projectId}/deliverables/${deliverableId}/versions/${req._id}`,
                      )
                    }
                    className="w-full text-left p-3 rounded-2xl bg-white/3 border border-white/5 hover:border-indigo-500/30 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/30">
                        #{req.versionNumber}
                      </span>
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border",
                          req.status === "resolved"
                            ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/10"
                            : req.status === "in_progress"
                              ? "text-blue-400 border-blue-500/20 bg-blue-500/10"
                              : "text-amber-400 border-amber-500/20 bg-amber-500/10",
                        )}
                      >
                        {req.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-xs text-white/60 line-clamp-2 mb-1.5">
                      {req.notes}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-white/30 font-bold">
                        by {req.requestedByName}
                      </span>
                      <span className="text-[10px] text-white/30 font-bold">
                        {format(req.createdAt, "MMM dd")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-[10px] text-indigo-400/60 font-bold group-hover:text-indigo-400 transition-colors">
                      <Eye className="h-3 w-3" />
                      View Details
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <DeliverableActions
            canApprove={canApprove}
            canRequestVersion={canRequestVersion}
            canSendToStudio={canSendToStudio}
            isSubmitting={isSubmitting}
            onApprove={handleApprove}
            onRequestVersion={handleRequestVersion}
            onSendToStudio={handleSendToStudio}
          />
        </div>
      </div>
    </div>
  );
}
