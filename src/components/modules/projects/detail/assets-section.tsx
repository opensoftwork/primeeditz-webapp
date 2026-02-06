"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { AlertCircle, CheckCircle2, Eye, Loader2, Lock, Send, Upload } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { FolderGrid } from "@/components/shared/project-folders";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AssetsSectionProps {
  projectId: string;
}

export function AssetsSection({ projectId }: AssetsSectionProps) {
  const router = useRouter();

  const updateFolderStatus = useMutation(
    api.functions.folders.mutations.updateFolderStatus,
  );

  const project = useQuery(api.functions.projects.queries.getProject, {
    projectId: projectId as Id<"projects">,
  });

  const folders = useQuery(api.functions.folders.queries.getMyProjectFolders, {
    projectId: projectId as Id<"projects">,
  });

  const completeOnboarding = useMutation(
    api.functions.projects.mutations.completeOnboarding,
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLocked = project?.uploadEligibility?.isAllowed === false;
  const isUploadComplete = project?.uploadEligibility?.reason?.toLowerCase().includes("complete");

  const canSubmit = 
    project?.actionState === "awaiting_uploads" && 
    folders && 
    folders.length > 0 && 
    folders.every((f: any) => f.status === "completed");

  const handleProjectSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    try {
      await completeOnboarding({
        projectId: projectId as Id<"projects">,
      });
      toast.success("Assets submitted successfully. Uploads are now disabled.");
    } catch (error) {
      toast.error("Failed to submit assets");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFolderClick = (folder: any) => {
    // Allow viewing folders even when locked (view-only mode)
    router.push(`/projects/${projectId}/folders/${folder._id}`);
  };

  const handleFolderComplete = async (folder: any) => {
    if (isLocked) {
      toast.error("Upload phase is complete. Contact admin to re-enable uploads.");
      return;
    }
    try {
      await updateFolderStatus({
        folderId: folder._id,
        status: "completed",
      });
      toast.success(`Folder ${folder.name} marked as complete`);
    } catch (error) {
      toast.error("Failed to update folder status");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      viewport={{ once: true }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-3">
            Project Assets
            {isLocked && (
              <span className={cn(
                "px-3 py-1 rounded-full text-[10px] tracking-[0.2em] font-black border",
                isUploadComplete
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                  : "bg-amber-500/10 border-amber-500/20 text-amber-500"
              )}>
                {isUploadComplete ? "UPLOAD COMPLETE" : "LOCKED"}
              </span>
            )}
          </h2>
          <p className="text-sm font-bold text-white/40 uppercase tracking-widest mt-1">
            {isLocked
              ? "View-only mode • Uploads are disabled"
              : "Click a folder to upload files"}
          </p>
        </div>

        {canSubmit && (
          <Button
            onClick={handleProjectSubmit}
            disabled={isSubmitting}
            className="rounded-2xl h-11 px-6 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {isSubmitting ? "Submitting..." : "Mark as Submit"}
          </Button>
        )}
      </div>

      {/* Upload Status Banner - Non-blocking alert */}
      {isLocked && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "flex items-center gap-4 p-4 rounded-2xl border backdrop-blur-sm",
            isUploadComplete
              ? "bg-emerald-500/5 border-emerald-500/20"
              : "bg-amber-500/5 border-amber-500/20"
          )}
        >
          <div className={cn(
            "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
            isUploadComplete
              ? "bg-emerald-500/10 text-emerald-500"
              : "bg-amber-500/10 text-amber-500"
          )}>
            {isUploadComplete ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <Lock className="h-5 w-5" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className={cn(
              "text-sm font-black uppercase tracking-tight",
              isUploadComplete ? "text-emerald-500" : "text-amber-500"
            )}>
              {isUploadComplete ? "Upload Phase Complete" : "Uploads Temporarily Locked"}
            </h4>
            <p className="text-xs text-white/50 mt-0.5">
              {isUploadComplete
                ? "Your files have been received. You can still view your uploaded assets below. Contact admin if you need to upload additional files."
                : project?.uploadEligibility?.reason || "Awaiting quotation approval to unlock project storage."}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className={cn(
              "px-3 py-1.5 rounded-lg flex items-center gap-2 text-[10px] font-black uppercase tracking-widest",
              isUploadComplete
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-amber-500/10 text-amber-400"
            )}>
              <Eye className="h-3.5 w-3.5" />
              View Only
            </div>
          </div>
        </motion.div>
      )}

      {/* Folder Grid - Always accessible for viewing */}
      <FolderGrid
        folders={folders}
        isLocked={isLocked}
        onFolderClick={handleFolderClick}
        onFolderComplete={handleFolderComplete}
        showViewModeHint={isLocked}
      />
    </motion.div>
  );
}

