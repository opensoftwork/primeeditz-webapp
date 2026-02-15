"use client";

import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useQuery, useAction, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  MessageSquare,
  ImageIcon,
  Clock,
  CheckCircle,
  Loader2,
  User,
  Calendar,
  FileIcon,
  Maximize2,
  Play,
  Hash,
  Send,
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DeliverablePreview } from "./deliverable-preview";
import { useBreadcrumbStore } from "@/store/breadcrumb-store";
import {
  AssetSlider,
  type ViewerAsset,
} from "@/components/shared/asset-viewer";

interface VersionRequestDetailProps {
  projectId: string;
  deliverableId: string;
  versionId: string;
}

export function VersionRequestDetailView({
  projectId,
  deliverableId,
  versionId,
}: VersionRequestDetailProps) {
  const router = useRouter();
  const { setOverride, removeOverride } = useBreadcrumbStore();
  const [deliverableFileUrl, setDeliverableFileUrl] = useState<string | null>(
    null,
  );
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [currentAssetIndex, setCurrentAssetIndex] = useState(0);

  // Queries
  const versionRequest = useQuery(
    // @ts-ignore
    api.functions.deliverables.queries.getVersionRequest,
    { requestId: versionId as Id<"versionRequests"> },
  );

  const deliverable = useQuery(
    api.functions.deliverables.queries.getDeliverable,
    { deliverableId: deliverableId as Id<"deliverables"> },
  );

  // Mutations
  const updateStatusMutation = useMutation(
    api.functions.deliverables.mutations.updateVersionRequestStatus,
  );

  // Actions
  const getSignedUrlAction = useAction(
    api.functions.storage.actions.getSignedFileUrl,
  );

  // Breadcrumb
  useEffect(() => {
    if (versionRequest) {
      setOverride(versionId, `Request #${versionRequest.versionNumber}`);
    }
    if (deliverable) {
      setOverride(deliverableId, deliverable.name);
    }
    return () => {
      removeOverride(versionId);
      removeOverride(deliverableId);
    };
  }, [
    versionId,
    versionRequest,
    deliverableId,
    deliverable,
    setOverride,
    removeOverride,
  ]);

  // Fetch deliverable file URL
  useEffect(() => {
    async function fetchUrl() {
      if (deliverable?.minioKey) {
        try {
          const url = await getSignedUrlAction({
            storageKey: deliverable.minioKey,
          });
          setDeliverableFileUrl(url);
        } catch (error) {
          console.error("Error fetching deliverable URL:", error);
        }
      }
    }
    fetchUrl();
  }, [deliverable, getSignedUrlAction]);

  // Fetch reference image URLs
  useEffect(() => {
    async function fetchImageUrls() {
      if (versionRequest?.referenceImages?.length) {
        const urls: Record<string, string> = {};
        for (const img of versionRequest.referenceImages) {
          try {
            const url = await getSignedUrlAction({
              storageKey: img.minioKey,
            });
            if (url) {
              urls[img.minioKey] = url;
            }
          } catch (error) {
            console.error("Error fetching image URL:", error);
          }
        }
        setImageUrls(urls);
      }
    }
    fetchImageUrls();
  }, [versionRequest, getSignedUrlAction]);

  // Prepare assets for the viewer
  const viewerAssets: ViewerAsset[] = useMemo(() => {
    const assets: ViewerAsset[] = [];

    // Add main deliverable first if it exists
    if (deliverable && deliverableFileUrl) {
      const mimeType = deliverable.mimeType || "application/octet-stream";
      let type: "image" | "pdf" | "video" | "audio" | "other" = "other";

      if (mimeType.startsWith("image/")) type = "image";
      else if (mimeType === "application/pdf") type = "pdf";
      else if (mimeType.startsWith("video/")) type = "video";
      else if (mimeType.startsWith("audio/")) type = "audio";

      assets.push({
        url: deliverableFileUrl,
        fileName: deliverable.name,
        fileId: deliverable._id,
        type,
      });
    }

    // Add reference images
    if (versionRequest?.referenceImages) {
      versionRequest.referenceImages.forEach((img) => {
        if (imageUrls[img.minioKey]) {
          assets.push({
            url: imageUrls[img.minioKey],
            fileName: img.fileName,
            fileId: img.minioKey,
            type: "image",
          });
        }
      });
    }

    return assets;
  }, [deliverable, deliverableFileUrl, versionRequest, imageUrls]);

  // Handlers
  const handleOpenAsset = (index: number, isReferenceImage = false) => {
    const offset =
      isReferenceImage && deliverable && deliverableFileUrl ? 1 : 0;
    setCurrentAssetIndex(index + offset);
    setIsSliderOpen(true);
  };
  const handleUpdateStatus = async (status: "in_progress" | "resolved") => {
    setIsUpdating(true);
    try {
      await updateStatusMutation({
        requestId: versionId as Id<"versionRequests">,
        status,
      });
      toast.success(
        status === "in_progress"
          ? "Marked as in progress!"
          : "Version request resolved!",
      );
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  // Loading
  if (versionRequest === undefined || deliverable === undefined) {
    return (
      <div className="flex min-h-[calc(100vh-120px)] w-full flex-col px-8 pt-10 pb-12">
        <div className="flex items-center gap-4 mb-10">
          <Skeleton className="h-11 w-11 rounded-xl bg-white/5" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-40 bg-white/5" />
            <Skeleton className="h-8 w-72 bg-white/5" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <Skeleton className="h-[600px] w-full bg-white/5 rounded-3xl" />
          <div className="space-y-6">
            <Skeleton className="h-48 w-full bg-white/5 rounded-3xl" />
            <Skeleton className="h-64 w-full bg-white/5 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  // Not found
  if (versionRequest === null) {
    return (
      <div className="flex min-h-[calc(100vh-120px)] w-full items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto border border-white/10">
            <MessageSquare className="h-8 w-8 text-white/20" />
          </div>
          <h1 className="text-xl font-black text-white">
            Version Request Not Found
          </h1>
          <p className="text-sm text-white/40">
            This version request may have been removed or doesn't exist.
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
    pending: {
      label: "Pending",
      icon: Clock,
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      text: "text-amber-400",
      dotColor: "bg-amber-400",
    },
    in_progress: {
      label: "In Progress",
      icon: Play,
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      text: "text-blue-400",
      dotColor: "bg-blue-400",
    },
    resolved: {
      label: "Resolved",
      icon: CheckCircle,
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      text: "text-emerald-400",
      dotColor: "bg-emerald-400",
    },
  } as const;

  const currentStatus =
    statusConfig[versionRequest.status as keyof typeof statusConfig] ||
    statusConfig.pending;
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
                VERSION REQUEST
              </span>
              <Badge
                variant="outline"
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                  currentStatus.bg,
                  currentStatus.border,
                  currentStatus.text,
                )}
              >
                <StatusIcon className="h-3 w-3" />
                {currentStatus.label}
              </Badge>
            </div>
            <h1 className="text-4xl xl:text-5xl font-black uppercase tracking-tighter text-white">
              Request #{versionRequest.versionNumber}
            </h1>
            <p className="text-xs text-white/30 mt-1 uppercase tracking-widest font-bold">
              {versionRequest.deliverableName} •{" "}
              {format(versionRequest.createdAt, "MMM dd, yyyy • HH:mm")}
            </p>
          </div>
        </div>

        {/* Status Actions */}
        <div className="flex items-center gap-3">
          {versionRequest.status === "pending" && (
            <Button
              onClick={() => handleUpdateStatus("in_progress")}
              disabled={isUpdating}
              className={cn(
                "text-white font-black px-6 py-5 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 gap-2 text-xs uppercase tracking-widest",
                versionRequest.requestedByRole === "studio"
                  ? "bg-indigo-500 hover:bg-indigo-600 shadow-[0_0_30px_rgba(99,102,241,0.2)]"
                  : "bg-blue-500 hover:bg-blue-600 shadow-[0_0_30px_rgba(59,130,246,0.2)]",
              )}
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : versionRequest.requestedByRole === "studio" ? (
                <Send className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {versionRequest.requestedByRole === "studio"
                ? "Forward to Employee"
                : "Mark In Progress"}
            </Button>
          )}
          {versionRequest.status === "in_progress" && (
            <Button
              onClick={() => handleUpdateStatus("resolved")}
              disabled={isUpdating}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-black px-6 py-5 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.2)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 gap-2 text-xs uppercase tracking-widest"
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Mark Resolved
            </Button>
          )}
          {versionRequest.status === "resolved" && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-black uppercase tracking-widest text-emerald-400">
                Resolved
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Left: Deliverable Preview */}
        <div className="sticky top-24 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xs font-black uppercase tracking-widest text-white/30">
              Original Deliverable
            </h2>
          </div>
          <div
            className="cursor-pointer group relative"
            onClick={() => handleOpenAsset(0)}
          >
            <DeliverablePreview
              url={deliverableFileUrl}
              fileName={deliverable?.name || "Unknown"}
              mimeType={deliverable?.mimeType}
            />
            <div className="absolute top-4 right-4 h-10 w-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all shadow-2xl">
              <Maximize2 className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Right: Version Request Details */}
        <div className="space-y-8">
          {/* Request Meta */}
          <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-5">
            <h3 className="text-xs font-black uppercase tracking-widest text-white/50 flex items-center gap-2">
              <Hash className="h-3.5 w-3.5 text-indigo-400" />
              Request Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">
                  Version Number
                </p>
                <p className="text-sm font-bold text-white">
                  #{versionRequest.versionNumber}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">
                  Requested By
                </p>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                    <User className="h-3 w-3 text-indigo-400" />
                  </div>
                  <span className="text-sm font-bold text-white">
                    {versionRequest.requestedByName}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">
                  Role
                </p>
                <span
                  className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest border",
                    versionRequest.requestedByRole === "admin"
                      ? "text-indigo-400 border-indigo-500/20 bg-indigo-500/10"
                      : "text-purple-400 border-purple-500/20 bg-purple-500/10",
                  )}
                >
                  {versionRequest.requestedByRole}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">
                  Created At
                </p>
                <p className="text-sm font-bold text-white/60">
                  {format(versionRequest.createdAt, "MMM dd, yyyy HH:mm")}
                </p>
              </div>
              {versionRequest.resolvedAt && (
                <div className="col-span-2 space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/30">
                    Resolved At
                  </p>
                  <p className="text-sm font-bold text-emerald-400/80">
                    {format(versionRequest.resolvedAt, "MMM dd, yyyy HH:mm")}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Notes / Feedback */}
          <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-white/50 flex items-center gap-2">
              <MessageSquare className="h-3.5 w-3.5 text-indigo-400" />
              General Feedback
            </h3>
            <div className="p-4 rounded-2xl bg-white/3 border border-white/5">
              <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
                {versionRequest.notes}
              </p>
            </div>
          </div>

          {/* Reference Images */}
          {versionRequest.referenceImages &&
            versionRequest.referenceImages.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-2">
                  <ImageIcon className="h-4 w-4 text-indigo-400" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-white/50">
                    Reference Images
                  </h3>
                  <span className="ml-auto text-[10px] font-bold text-white/30 bg-white/5 px-2 py-0.5 rounded-md">
                    {versionRequest.referenceImages.length} image
                    {versionRequest.referenceImages.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {versionRequest.referenceImages.map((img, index) => {
                    const url = imageUrls[img.minioKey];
                    return (
                      <div
                        key={img.minioKey}
                        className="group relative flex flex-col bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/5"
                      >
                        {/* Image */}
                        <div className="relative aspect-video w-full overflow-hidden bg-black/40">
                          {url ? (
                            <img
                              src={url}
                              alt={img.fileName}
                              className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Loader2 className="h-6 w-6 text-white/20 animate-spin" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                          {/* Expand */}
                          {url && (
                            <button
                              onClick={() => handleOpenAsset(index, true)}
                              className="absolute top-2 right-2 h-7 w-7 rounded-lg bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white/30"
                            >
                              <Maximize2 className="h-3.5 w-3.5" />
                            </button>
                          )}

                          <div
                            className="absolute bottom-2 left-2 truncate max-w-[80%] cursor-pointer"
                            onClick={() => handleOpenAsset(index, true)}
                          >
                            <p className="text-[10px] font-medium text-white/60 truncate drop-shadow-md">
                              {img.fileName}
                            </p>
                          </div>
                        </div>

                        {/* Note */}
                        {img.note && (
                          <div className="p-3 space-y-1.5">
                            <div className="flex items-center gap-1.5">
                              <MessageSquare className="h-3 w-3 text-indigo-400" />
                              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                                Note
                              </span>
                            </div>
                            <p className="text-xs text-white/60 leading-relaxed">
                              {img.note}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </motion.div>
              </div>
            )}
        </div>
      </div>

      {/* Full Asset Viewer */}
      <AssetSlider
        assets={viewerAssets}
        initialIndex={currentAssetIndex}
        open={isSliderOpen}
        onOpenChange={setIsSliderOpen}
      />
    </div>
  );
}
