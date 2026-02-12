"use client";

import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useQuery, useMutation, useAction } from "convex/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertTriangle, FileBox, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FilePreview } from "@/components/shared/file-preview";
import { VersionReferenceViewer } from "./versions-reference-viewer";
import { CorrectedUpload } from "./corrected-upload";
import { VersionsTimeline } from "@/components/shared/versions-timeline";

interface VersionsWorkspaceProps {
  projectId: string;
  deliverableId: string;
}

export function VersionsWorkspace({
  projectId,
  deliverableId,
}: VersionsWorkspaceProps) {
  const router = useRouter();

  // Queries
  const deliverable = useQuery(
    api.functions.deliverables.queries.getDeliverable,
    { deliverableId: deliverableId as Id<"deliverables"> },
  );

  const versionRequests = useQuery(
    api.functions.deliverables.queries.getDeliverableVersionRequests,
    { deliverableId: deliverableId as Id<"deliverables"> },
  );

  const getSignedUrl = useAction(
    api.functions.storage.actions.getSignedFileUrl,
  );

  // Mutations
  const updateStatus = useMutation(
    api.functions.deliverables.mutations.updateVersionRequestStatus,
  );

  // Local state
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  // Auto-mark as in_progress when first viewed
  useEffect(() => {
    if (versionRequests) {
      const latestPending = versionRequests.find((r) => r.status === "pending");
      if (latestPending) {
        updateStatus({ requestId: latestPending._id, status: "in_progress" });
      }
    }
  }, [versionRequests, updateStatus]);

  // Fetch deliverable file URL
  useEffect(() => {
    async function fetchUrl() {
      if (deliverable?.minioKey) {
        try {
          const url = await getSignedUrl({ storageKey: deliverable.minioKey });
          setFileUrl(url);
        } catch (error) {
          console.error("Error fetching deliverable URL:", error);
        }
      }
    }
    fetchUrl();
  }, [deliverable?.minioKey, getSignedUrl]);

  // Loading state
  if (deliverable === undefined || versionRequests === undefined) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 h-[calc(100vh-100px)] gap-8 p-12">
        <Skeleton className="h-full w-full bg-white/5 rounded-3xl" />
        <Skeleton className="h-full w-full bg-white/5 rounded-3xl" />
      </div>
    );
  }

  // Not found
  if (deliverable === null) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] space-y-4">
        <AlertTriangle className="h-12 w-12 text-red-500/50" />
        <h2 className="text-xl font-black uppercase text-white">
          Deliverable Not Found
        </h2>
        <Button
          variant="link"
          onClick={() => router.back()}
          className="text-indigo-400 font-bold uppercase tracking-widest text-xs"
        >
          Return to Project
        </Button>
      </div>
    );
  }

  // Get active requested version
  const activeRequest =
    versionRequests.find(
      (r) => r.status === "pending" || r.status === "in_progress",
    ) || versionRequests[versionRequests.length - 1]; // Fallback to last resolved if none active

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Header */}
      <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between sticky top-0 bg-zinc-950/80 backdrop-blur-xl z-20">
        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-xl hover:bg-white/5"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black uppercase tracking-tight text-white">
                Versions Workspace
              </h1>
              <ChevronRight className="h-4 w-4 text-white/20" />
              <span className="text-sm font-bold text-indigo-400 uppercase tracking-widest px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                {deliverable.name}
              </span>
            </div>
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">
              Address corrections and upload a new version
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
              Current Version
            </span>
            <span className="text-sm font-black text-white">
              v{deliverable.version}
            </span>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <FileBox className="h-6 w-6 text-white/10" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden h-full">
        {/* Left Panel: Preview (60%) */}
        <div className="lg:col-span-7 border-r border-white/5 flex flex-col h-full bg-zinc-900/50">
          <div className="p-6 border-b border-white/5 bg-black/20">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
              Original Deliverable (Current Version)
            </h3>
          </div>
          <div className="flex-1 p-8 overflow-hidden relative">
            <FilePreview
              url={fileUrl}
              fileName={deliverable.name}
              mimeType={deliverable.mimeType}
              className="h-full w-full rounded-2xl shadow-2xl ring-1 ring-white/10"
            />
          </div>
        </div>

        {/* Right Panel: Workspace (40%) */}
        <div className="lg:col-span-5 flex flex-col h-full overflow-y-auto custom-scrollbar">
          <div className="p-8 space-y-12">
            {/* Version Details */}
            {activeRequest ? (
              <section className="space-y-6">
                <VersionReferenceViewer
                  notes={activeRequest.notes}
                  versionNumber={activeRequest.versionNumber}
                  requestedBy={activeRequest.requestedByName}
                  requestedByRole={activeRequest.requestedByRole.toUpperCase()}
                  createdAt={activeRequest.createdAt}
                  referenceImages={activeRequest.referenceImages}
                />
              </section>
            ) : (
              <div className="p-12 text-center space-y-4 bg-white/2 rounded-3xl border border-white/5 border-dashed">
                <AlertTriangle className="h-10 w-10 text-white/10 mx-auto" />
                <p className="text-sm font-black uppercase text-white/20 tracking-widest">
                  No active version requests found
                </p>
              </div>
            )}

            <div className="h-px w-full bg-linear-to-r from-transparent via-white/5 to-transparent" />

            {/* Upload Area */}
            <section className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-lg font-black uppercase tracking-tight text-white">
                  Action Required
                </h2>
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest leading-relaxed">
                  Upload the corrected version below to notify the QC team.
                </p>
              </div>

              <CorrectedUpload
                projectId={projectId}
                parentDeliverableId={deliverableId}
                deliverableName={deliverable.name}
              />
            </section>

            <div className="h-px w-full bg-linear-to-r from-transparent via-white/5 to-transparent" />

            {/* Full History */}
            <section>
              <VersionsTimeline
                deliverableId={deliverableId as Id<"deliverables">}
              />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
