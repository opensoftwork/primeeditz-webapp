"use client";

import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useQuery, useAction } from "convex/react";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  FileIcon,
  Download,
  ShieldCheck,
  Calendar,
  HardDrive,
  User,
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

interface StudioDeliverableDetailViewProps {
  projectId: string;
  deliverableId: string;
}

export function StudioDeliverableDetailView({
  projectId,
  deliverableId,
}: StudioDeliverableDetailViewProps) {
  const { setOverride, removeOverride } = useBreadcrumbStore();

  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [viewedVersion, setViewedVersion] = useState<{
    version: number;
    minioKey: string;
    mimeType?: string;
    description?: string;
  } | null>(null);

  // Queries
  const deliverable = useQuery(
    api.functions.deliverables.queries.getDeliverable,
    { deliverableId: deliverableId as Id<"deliverables"> },
  );

  const versions = useQuery(
    api.functions.deliverables.queries.getDeliverableVersions,
    deliverable
      ? { deliverableId: deliverableId as Id<"deliverables"> }
      : "skip",
  );

  // Signed URL
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
      if (keyToFetch && !fileUrl) {
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
  }, [deliverable?.minioKey, viewedVersion?.minioKey, getSignedUrlAction, fileUrl]);

  // Handle version selection
  const handleVersionSelect = (version: DeliverableVersion) => {
    setViewedVersion({
      version: version.versionNumber,
      minioKey: version.minioKey,
      mimeType: version.mimeType,
      description: version.description,
    });
    setFileUrl(null); // Reset to fetch new URL
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
          <Link href={`/projects/${projectId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Project
          </Link>
        </Button>
      </div>
    );
  }

  const formattedSize = (deliverable.sizeBytes / (1024 * 1024)).toFixed(2);
  const hasMultipleVersions = versions && versions.length > 1;
  const currentVersionNumber = viewedVersion?.version || deliverable.version;
  const currentMimeType = viewedVersion?.mimeType || deliverable.mimeType;
  const currentDescription = viewedVersion?.description || deliverable.description;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 md:p-12 space-y-8"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          asChild
          className="h-9 w-9 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 border-white/10 shrink-0"
        >
          <Link href={`/projects/${projectId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
            <FileIcon className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-lg font-black uppercase tracking-tight text-white">
              {deliverable.name}
            </h1>
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-white/40">
              <span className="bg-white/5 px-2 py-0.5 rounded-md">
                v{currentVersionNumber}
              </span>
              <span>•</span>
              <span>{formattedSize} MB</span>
              <span>•</span>
              <span>{format(deliverable._creationTime, "PPP")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Preview — 2/3 width */}
        <div className="lg:col-span-2">
          <DeliverablePreview
            url={fileUrl}
            fileName={deliverable.name}
            mimeType={currentMimeType}
            description={currentDescription}
          />
        </div>

        {/* Sidebar — 1/3 width */}
        <div className="space-y-6">
          {/* Download Button */}
          {fileUrl && (
            <a
              href={fileUrl}
              download={deliverable.name}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-600/20 transition-all"
            >
              <Download className="h-4 w-4" />
              Download File
            </a>
          )}

          {/* File Metadata Card */}
          <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-5">
            <MetaItem
              icon={<ShieldCheck className="h-4 w-4" />}
              label="Status"
              value={
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border",
                    deliverable.status === "approved"
                      ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/10"
                      : "text-amber-400 border-amber-500/20 bg-amber-500/10",
                  )}
                >
                  {deliverable.status.replace(/_/g, " ")}
                </span>
              }
            />
            <MetaItem
              icon={<User className="h-4 w-4" />}
              label="Submitted By"
              value={
                <span className="text-sm font-bold text-white">
                  {deliverable.uploadedByName || "PrimeEditz Team"}
                </span>
              }
            />
            <MetaItem
              icon={<HardDrive className="h-4 w-4" />}
              label="File Size"
              value={
                <span className="text-sm font-bold text-white">
                  {formattedSize} MB
                </span>
              }
            />
            <MetaItem
              icon={<Calendar className="h-4 w-4" />}
              label="Uploaded"
              value={
                <span className="text-sm font-bold text-white">
                  {format(deliverable._creationTime, "PPP p")}
                </span>
              }
            />
          </div>

          {/* Version History */}
          {hasMultipleVersions && (
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
