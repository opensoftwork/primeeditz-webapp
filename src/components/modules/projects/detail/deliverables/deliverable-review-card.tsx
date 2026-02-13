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
import { useRouter } from "next/navigation";
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
    displayVersion?: number;
  };
  projectId: string;
  signedUrl?: string;
  onStatusChange?: () => void;
}

export function DeliverableReviewCard({
  deliverable,
  projectId,
  signedUrl,
  onStatusChange,
}: DeliverableReviewCardProps) {
  const router = useRouter();
  const [showVersionDialog, setShowVersionDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const studioApprove = useMutation(
    // @ts-ignore
    api.functions.deliverables.mutations.studioApproveDeliverable,
  );

  const handleApprove = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setLoading(true);
    try {
      await studioApprove({
        deliverableId: deliverable._id,
        projectId: projectId as Id<"projects">,
      });
      toast.success(`"${deliverable.name}" approved`);
      onStatusChange?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to approve deliverable");
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = () => {
    router.push(`/projects/${projectId}/deliverables/${deliverable._id}`);
  };

  const isApproved = deliverable.isStudioApproved;
  const hasVersion = !!deliverable.latestVersionStatus;
  const isPendingVersion =
    deliverable.latestVersionStatus === "pending" ||
    deliverable.latestVersionStatus === "in_progress";

  return (
    <div
      onClick={handleNavigate}
      className={cn(
        "group relative flex flex-col sm:flex-row sm:items-center justify-between transition-all gap-4 cursor-pointer",
        "p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/30 overflow-hidden",
        isApproved &&
          "border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50",
      )}
    >
      <div className="flex items-center gap-4 flex-1">
        {/* Thumbnail/Preview */}
        <div className="h-16 w-16 rounded-xl overflow-hidden bg-black/40 border border-white/10 shrink-0 relative">
          {signedUrl ? (
            <FilePreview
              url={signedUrl}
              fileName={deliverable.name}
              mimeType={deliverable.mimeType}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white/10">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          )}

          {isApproved && (
            <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-[1px] flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-emerald-500" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4
            className="text-sm font-bold text-white truncate mb-1"
            title={deliverable.name}
          >
            {deliverable.name}
          </h4>

          <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase font-bold tracking-wider text-white/40">
            <div className="flex items-center gap-1.5 bg-white/5 px-2 py-0.5 rounded-md">
              <span className="text-white/30 text-[9px]">VERSION</span>
              <span className="text-white">
                v{deliverable.displayVersion || deliverable.version}
              </span>
            </div>

            {hasVersion && (
              <>
                <span>•</span>
                <VersionStatusTracker
                  status={deliverable.latestVersionStatus}
                />
              </>
            )}

            {deliverable.sizeBytes && (
              <>
                <span>•</span>
                <span>
                  {(deliverable.sizeBytes / (1024 * 1024)).toFixed(2)} MB
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pl-20 sm:pl-0">
        {isApproved ? (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <CheckCircle className="h-3.5 w-3.5" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Approved
            </span>
          </div>
        ) : (
          <>
            <Button
              variant="outline"
              disabled={loading || isPendingVersion}
              className={cn(
                "h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
                "border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/40",
                "shadow-lg shadow-emerald-500/5",
              )}
              onClick={handleApprove}
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle className="h-3.5 w-3.5 mr-2" />
              )}
              Approve
            </Button>
            <Button
              variant="outline"
              disabled={loading || isPendingVersion}
              className={cn(
                "h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
                "border-white/10 text-white/60 hover:bg-white/5 hover:border-white/20",
              )}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowVersionDialog(true);
              }}
            >
              <RotateCcw className="h-3.5 w-3.5 mr-2" />
              Versions
            </Button>
          </>
        )}
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
