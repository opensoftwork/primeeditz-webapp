"use client";

import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useQuery, useMutation, useAction } from "convex/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertTriangle, FileBox, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { FilePreview } from "@/components/shared/file-preview";
import { VersionReferenceViewer } from "./versions-reference-viewer";
import { ReviseVersionDrawer } from "./revise-version-drawer";
import { useBreadcrumbStore } from "@/store/breadcrumb-store";

interface VersionsWorkspaceProps {
  projectId: string;
  deliverableId: string;
  requestId?: string;
}

export function VersionsWorkspace({
  projectId,
  deliverableId,
  requestId,
}: VersionsWorkspaceProps) {
  const router = useRouter();
  const { setOverride, removeOverride } = useBreadcrumbStore();

  // Queries
  const deliverable = useQuery(
    //@ts-ignore
    api.functions.deliverables.queries.getDeliverable,
    { deliverableId: deliverableId as Id<"deliverables"> },
  );

  useEffect(() => {
    if (deliverable) {
      setOverride(deliverableId, deliverable.name);
    }
    return () => removeOverride(deliverableId);
  }, [deliverableId, deliverable, setOverride, removeOverride]);

  const versionRequests = useQuery(
    //@ts-ignore
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
  const [isReviseOpen, setIsReviseOpen] = useState(false);

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
  const activeRequest = requestId
    ? versionRequests.find((r) => r._id === requestId)
    : versionRequests.find(
        (r) => r.status === "pending" || r.status === "in_progress",
      ) || versionRequests[versionRequests.length - 1]; // Fallback to last resolved if none active

  return (
    <div className="h-screen bg-zinc-950 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-zinc-950/80 backdrop-blur-xl z-20 shrink-0">
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
                {requestId ? "Version Detail" : "Versions Workspace"}
              </h1>
            </div>
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">
              {requestId
                ? `Reviewing version instructions for ${activeRequest?.versionNumber ? `v${activeRequest.versionNumber}` : "request"}`
                : "Address corrections and upload a new version"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {activeRequest && activeRequest.status !== "resolved" && (
            <Button
              className="rounded-2xl h-11 bg-indigo-600 hover:bg-indigo-500 text-white gap-3 px-6 shadow-lg shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-50 disabled:bg-zinc-800 disabled:shadow-none"
              onClick={() => setIsReviseOpen(true)}
              disabled={deliverable.status === "approved"}
            >
              <FileBox className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                {deliverable.status === "approved"
                  ? "Revision Approved"
                  : "Upload Revised Version"}
              </span>
            </Button>
          )}

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
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Panel: Preview (Fixed) */}
        <div className="lg:col-span-4 border-r border-white/5 flex flex-col h-full bg-zinc-900/50 overflow-hidden">
          <div className="p-4 border-b border-white/5 bg-black/20 shrink-0">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
              Original Deliverable (Current Version)
            </h3>
          </div>
          <div className="flex-1 p-6 flex flex-col items-start overflow-hidden">
            <div className="w-full">
              <AspectRatio ratio={9 / 16}>
                <FilePreview
                  url={fileUrl}
                  fileName={deliverable.name}
                  mimeType={deliverable.mimeType}
                  className="h-full w-full rounded-2xl shadow-2xl ring-1 ring-white/10"
                />
              </AspectRatio>
            </div>
          </div>
        </div>

        {/* Right Panel: Workspace (Scrollable) */}
        <div className="lg:col-span-8 flex flex-col h-full overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-8">
            {/* Version Details */}
            {activeRequest ? (
              <section className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="text-lg font-black uppercase tracking-tight text-white">
                      Version Instructions
                    </h2>
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest leading-relaxed">
                      {activeRequest.status === "resolved"
                        ? "This request has been addressed."
                        : "Follow these instructions to complete the correction."}
                    </p>
                  </div>
                </div>
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
          </div>
        </div>
      </div>
      <ReviseVersionDrawer
        open={isReviseOpen}
        onOpenChange={setIsReviseOpen}
        projectId={projectId}
        deliverableId={deliverableId}
        deliverableName={deliverable.name}
      />
    </div>
  );
}
