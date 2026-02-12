"use client";

import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FilePreview } from "@/components/shared/file-preview";
import { StudioVersionsDialog } from "./studio-versions-dialog";
import { VersionStatusTracker } from "./versions-status-tracker";
import { cn } from "@/lib/utils";

interface DeliverableReviewCardProps {
  deliverable: {
    _id: Id<"deliverables">;
    name: string;
    version: number;
    status: string;
    minioKey?: string;
    sizeBytes?: number;
    mimeType?: string;
    isStudioApproved?: boolean;
    latestVersionStatus?: "pending" | "in_progress" | "resolved";
  };
  projectId: Id<"projects">;
  signedUrl?: string;
  onStatusChange?: () => void;
}

export function DeliverableReviewCard({
  deliverable,
  projectId,
  signedUrl,
  onStatusChange,
}: DeliverableReviewCardProps) {
  const [showVersionDialog, setShowVersionDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const studioApprove = useMutation(
    // @ts-ignore
    api.functions.deliverables.mutations.studioApproveDeliverable,
  );

  const handleApprove = async () => {
    setLoading(true);
    try {
      await studioApprove({
        deliverableId: deliverable._id,
        projectId,
      });
      toast.success(`"${deliverable.name}" approved`);
      onStatusChange?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to approve deliverable");
    } finally {
      setLoading(false);
    }
  };

  const isApproved = deliverable.isStudioApproved;
  const hasVersion = !!deliverable.latestVersionStatus;
  const isPendingVersion =
    deliverable.latestVersionStatus === "pending" ||
    deliverable.latestVersionStatus === "in_progress";

  return (
    <div
      className={cn(
        "group relative transition-all duration-300",
        "rounded-2xl border border-white/10 bg-white/3 overflow-hidden",
        isApproved && "border-emerald-500/30 bg-emerald-500/5",
      )}
    >
      {/* Thumbnail/Preview */}
      <div className="aspect-video relative overflow-hidden bg-black/40">
        {signedUrl ? (
          <FilePreview
            url={signedUrl}
            fileName={deliverable.name}
            mimeType={deliverable.mimeType}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white/10">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}

        {/* Status Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <Badge
            variant="secondary"
            className="bg-black/60 backdrop-blur-md border-white/10 text-[10px] font-black uppercase tracking-widest text-white/50"
          >
            v{deliverable.version}
          </Badge>

          {hasVersion && (
            <VersionStatusTracker status={deliverable.latestVersionStatus} />
          )}
        </div>

        {isApproved && (
          <div className="absolute inset-0 bg-emerald-950/20 backdrop-blur-[1px] flex items-center justify-center">
            <div className="bg-emerald-500 text-white rounded-full p-2 shadow-lg shadow-emerald-500/20">
              <CheckCircle className="h-6 w-6" />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h4
            className="text-sm font-bold text-white truncate pr-2"
            title={deliverable.name}
          >
            {deliverable.name}
          </h4>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          {isApproved ? (
            <div className="col-span-2 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <CheckCircle className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Approved✓
              </span>
            </div>
          ) : (
            <>
              <Button
                variant="outline"
                disabled={loading || isPendingVersion}
                className={cn(
                  "h-9 rounded-xl text-[10px] font-black uppercase tracking-wider",
                  "border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/40",
                )}
                onClick={handleApprove}
              >
                {loading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CheckCircle className="h-3.5 w-3.5 mr-1" />
                )}
                Approve
              </Button>
              <Button
                variant="outline"
                disabled={loading || isPendingVersion}
                className={cn(
                  "h-9 rounded-xl text-[10px] font-black uppercase tracking-wider",
                  "border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40",
                )}
                onClick={() => setShowVersionDialog(true)}
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                Versions
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Version Dialog */}
      <StudioVersionsDialog
        open={showVersionDialog}
        onOpenChange={setShowVersionDialog}
        deliverableId={deliverable._id}
        deliverableName={deliverable.name}
        projectId={projectId}
        onSuccess={onStatusChange}
      />
    </div>
  );
}
