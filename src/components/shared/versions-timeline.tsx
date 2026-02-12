"use client";

import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useQuery, useAction } from "convex/react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckCircle,
  Clock,
  Loader2,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  User,
  ExternalLink,
  History,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface VersionRequest {
  _id: Id<"versionRequests">;
  _creationTime: number;
  deliverableId: Id<"deliverables">;
  projectId: Id<"projects">;
  versionNumber: number;
  notes: string;
  requestedBy: Id<"profiles">;
  requestedByRole: string;
  requestedByName: string;
  status: "pending" | "in_progress" | "resolved";
  createdAt: number;
  referenceImages?: Array<{
    fileName: string;
    fileSize: number;
    mimeType: string;
    minioKey: string;
    note?: string;
  }>;
  resolvedAt?: number;
  resolvedDeliverableId?: Id<"deliverables">;
}

interface VersionsTimelineProps {
  deliverableId: Id<"deliverables">;
  maxInitialVisible?: number;
}

export function VersionsTimeline({
  deliverableId,
  maxInitialVisible = 2,
}: VersionsTimelineProps) {
  const versionRequests = useQuery(
    api.functions.deliverables.queries.getDeliverableVersionRequests,
    { deliverableId },
  ) as VersionRequest[] | undefined;

  const [showAll, setShowAll] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (versionRequests === undefined) {
    return (
      <div className="space-y-4 py-8">
        <Skeleton className="h-4 w-32 bg-white/5" />
        <div className="space-y-3">
          <Skeleton className="h-32 w-full bg-white/5 rounded-2xl" />
          <Skeleton className="h-32 w-full bg-white/5 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!versionRequests || versionRequests.length === 0) {
    return null;
  }

  const reversed = [...versionRequests].reverse();
  const visible = showAll ? reversed : reversed.slice(0, maxInitialVisible);
  const hasMore = reversed.length > maxInitialVisible;

  return (
    <div className="space-y-6 pt-8 border-t border-white/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
            <History className="h-4 w-4 text-indigo-400" />
          </div>
          <h3 className="text-sm font-black uppercase tracking-widest text-white">
            Version History
          </h3>
        </div>
        <Badge
          variant="outline"
          className="bg-white/5 border-white/10 text-white/40 px-3 font-bold"
        >
          {versionRequests.length} REQUESTS
        </Badge>
      </div>

      <div className="relative space-y-4">
        {/* Timeline Line */}
        <div className="absolute left-6 top-2 bottom-2 w-px bg-white/5 z-0" />

        <AnimatePresence mode="popLayout">
          {visible.map((request, idx) => (
            <VersionCard
              key={request._id}
              request={request}
              isExpanded={
                expandedIds.has(request._id as string) ||
                (idx === 0 && !showAll)
              } // Expand latest by default if not showing all
              onToggle={() => toggleExpand(request._id)}
            />
          ))}
        </AnimatePresence>
      </div>

      {hasMore && (
        <Button
          variant="ghost"
          onClick={() => setShowAll(!showAll)}
          className="w-full h-12 rounded-2xl border border-white/5 hover:bg-white/5 text-[10px] font-black uppercase tracking-widest gap-2 text-white/40 hover:text-white"
        >
          {showAll ? (
            <>
              <ChevronUp className="h-3 w-3" />
              Collapse History
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" />
              Show {reversed.length - maxInitialVisible} older version requests
            </>
          )}
        </Button>
      )}
    </div>
  );
}

function VersionCard({
  request,
  isExpanded,
  onToggle,
}: {
  request: VersionRequest;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const getSignedUrls = useAction(
    api.functions.storage.actions.getSignedFileUrls,
  );
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [loadingUrls, setLoadingUrls] = useState(false);

  useEffect(() => {
    async function fetchUrls() {
      if (
        isExpanded &&
        request.referenceImages &&
        request.referenceImages.length > 0 &&
        Object.keys(imageUrls).length === 0
      ) {
        setLoadingUrls(true);
        try {
          const keys = request.referenceImages.map((img) => img.minioKey);
          const urlsMap = await getSignedUrls({ storageKeys: keys });

          // Filter out nulls and cast to Record<string, string>
          const validUrls: Record<string, string> = {};
          for (const key of Object.keys(urlsMap)) {
            const url = urlsMap[key];
            if (url) validUrls[key] = url;
          }

          setImageUrls(validUrls);
        } catch (error) {
          console.error("Error fetching reference image URLs:", error);
        } finally {
          setLoadingUrls(false);
        }
      }
    }
    fetchUrls();
  }, [isExpanded, request.referenceImages, getSignedUrls, imageUrls]);

  const statusConfig = {
    pending: {
      color: "amber",
      icon: Clock,
      label: "Pending",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      text: "text-amber-400",
    },
    in_progress: {
      color: "blue",
      icon: Loader2,
      label: "In Progress",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      text: "text-blue-400",
    },
    resolved: {
      color: "emerald",
      icon: CheckCircle,
      label: "Resolved",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      text: "text-emerald-400",
    },
  };

  const config =
    statusConfig[request.status as keyof typeof statusConfig] ||
    statusConfig.pending;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="relative z-10 pl-12"
    >
      {/* Timeline Dot */}
      <div
        className={cn(
          "absolute left-[21px] top-6 h-[7px] w-[7px] rounded-full ring-4 ring-zinc-950 z-20",
          config.bg.replace("/10", ""), // Use solid color for dot
          request.status === "resolved"
            ? "bg-emerald-500"
            : request.status === "in_progress"
              ? "bg-blue-500"
              : "bg-amber-500",
        )}
      />

      <div
        className={cn(
          "group rounded-3xl border transition-all duration-300 overflow-hidden",
          isExpanded
            ? "bg-white/5 border-white/10 shadow-2xl"
            : "bg-white/2 border-white/5 hover:border-white/10",
        )}
      >
        {/* Header - Clickable */}
        <div
          className="p-5 flex items-center justify-between cursor-pointer"
          onClick={onToggle}
        >
          <div className="flex items-center gap-4">
            <Badge
              variant="outline"
              className={cn(
                "px-2 py-0.5 font-black text-[9px]",
                config.bg,
                config.border,
                config.text,
              )}
            >
              <Icon
                className={cn(
                  "h-3 w-3 mr-1",
                  request.status === "in_progress" && "animate-spin",
                )}
              />
              {config.label.toUpperCase()}
            </Badge>
            <div className="space-y-0.5">
              <h4 className="text-xs font-black text-white uppercase tracking-tight">
                Version #{request.versionNumber}
              </h4>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                {format(request._creationTime, "MMM d, h:mm a")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {request.referenceImages &&
              request.referenceImages.length > 0 &&
              !isExpanded && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5">
                  <ImageIcon className="h-3 w-3 text-white/40" />
                  <span className="text-[10px] font-bold text-white/40">
                    {request.referenceImages.length}
                  </span>
                </div>
              )}
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-white/20" />
            ) : (
              <ChevronDown className="h-4 w-4 text-white/20" />
            )}
          </div>
        </div>

        {/* Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="px-5 pb-6 space-y-5 border-t border-white/5 pt-5">
                {/* Requester Info */}
                <div className="flex items-center gap-3 text-xs">
                  <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <User className="h-4 w-4 text-white/40" />
                  </div>
                  <div>
                    <p className="font-bold text-white/60">
                      {request.requestedByName}
                    </p>
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                      {request.requestedByRole}
                    </p>
                  </div>
                </div>

                {/* Notes */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 leading-relaxed text-sm text-white/80 whitespace-pre-wrap font-medium">
                  {request.notes}
                </div>

                {/* Reference Images */}
                {request.referenceImages &&
                  request.referenceImages.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-3 w-3 text-white/20" />
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-white/20">
                          Reference Visuals ({request.referenceImages.length})
                        </h5>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {request.referenceImages.map((img, idx: number) => (
                          <div
                            key={img.minioKey}
                            className="group/img relative aspect-square rounded-xl bg-black/40 border border-white/5 overflow-hidden cursor-zoom-in"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (imageUrls[img.minioKey])
                                window.open(imageUrls[img.minioKey], "_blank");
                            }}
                          >
                            {imageUrls[img.minioKey] ? (
                              <Image
                                src={imageUrls[img.minioKey]}
                                alt={`Ref ${idx}`}
                                fill
                                className="object-cover transition-transform group-hover/img:scale-110"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                {loadingUrls ? (
                                  <Loader2 className="h-4 w-4 text-white/10 animate-spin" />
                                ) : (
                                  <AlertTriangle className="h-4 w-4 text-white/5" />
                                )}
                              </div>
                            )}

                            {img.note && (
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity p-3 flex items-center justify-center">
                                <p className="text-[10px] text-white font-bold text-center leading-tight">
                                  {img.note}
                                </p>
                              </div>
                            )}

                            <div className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity">
                              <ExternalLink className="h-3 w-3 text-white" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Status Specific Info */}
                {request.status === "resolved" && request.resolvedAt && (
                  <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                      Resolved on {format(request.resolvedAt, "MMM d, yyyy")}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
