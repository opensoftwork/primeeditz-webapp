"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useAction, useMutation, useQuery } from "convex/react";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  HardDrive,
  Loader2,
  Lock,
} from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/components/shared/project-folders/folder-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useBreadcrumbStore } from "@/store/breadcrumb-store";
import { FolderAssetList } from "./folder-asset-list";
import { FolderDropZone } from "./folder-drop-zone";
import { type StagedFile, StagedUploadQueue } from "./staged-upload-queue";

interface FolderDetailViewProps {
  projectId: string;
  folderId: string;
  isAdmin?: boolean;
  isEmployee?: boolean;
}

export function FolderDetailView({
  projectId,
  folderId,
  isAdmin = false,
  isEmployee = false,
}: FolderDetailViewProps) {
  const router = useRouter();
  const { setOverride, removeOverride } = useBreadcrumbStore();
  const isStaff = isAdmin || isEmployee;

  // State
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [signedUrls, setSignedUrls] = useState<Record<string, string | null>>(
    {},
  );

  // Queries & Mutations
  const folder = useQuery(api.functions.folders.queries.getFolderDetails, {
    folderId: folderId as Id<"folders">,
  });

  const project = useQuery(
    isAdmin
      ? api.admin.getAdminProject
      : api.functions.projects.queries.getProject,
    { projectId: projectId as Id<"projects"> },
  );

  const uploadEligibility = useQuery(
    api.functions.projects.queries.getProjectUploadEligibility,
    {
      projectId: projectId as Id<"projects">,
    },
  );

  const isLocked = uploadEligibility?.isAllowed === false;
  const isUploadComplete = uploadEligibility?.reason
    ?.toLowerCase()
    .includes("complete");

  // Handle Breadcrumb Overrides
  useEffect(() => {
    if (folder?.name) {
      setOverride(folderId, folder.name);
    }

    return () => {
      removeOverride(folderId);
    };
  }, [folderId, folder?.name, setOverride, removeOverride]);

  const assets = useQuery(api.functions.folders.queries.getFolderAssets, {
    folderId: folderId as Id<"folders">,
  });

  const updateFolderStatus = useMutation(
    isAdmin
      ? api.functions.folders.mutations.adminUpdateFolderStatus
      : api.functions.folders.mutations.updateFolderStatus,
  );

  const generateUploadUrl = useAction(
    api.functions.storage.actions.generateUploadUrl,
  );
  const createAsset = useMutation(api.functions.assets.mutations.createAsset);
  const getSignedUrls = useAction(
    api.functions.storage.actions.getSignedFileUrls,
  );

  // Fetch signed URLs for viewing images and playing audio
  useEffect(() => {
    async function fetchUrls() {
      if (!assets || assets.length === 0) return;

      // Include both image and audio assets for signed URL fetching
      const mediaAssets = assets.filter(
        (a: any) =>
          a.mimeType.startsWith("image/") || a.mimeType.startsWith("audio/"),
      );
      const keys = mediaAssets.map((a: any) => a.minioKey);

      if (keys.length > 0) {
        try {
          const urls = await getSignedUrls({ storageKeys: keys });
          setSignedUrls(urls);
        } catch (error) {
          console.error("Failed to get signed URLs:", error);
        }
      }
    }
    fetchUrls();
  }, [assets, getSignedUrls]);

  // Handle file selection (staging, not immediate upload)
  const handleFilesSelected = useCallback((files: File[]) => {
    const newStagedFiles: StagedFile[] = files.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      status: "pending" as const,
      progress: 0,
    }));

    setStagedFiles((prev) => [...prev, ...newStagedFiles]);
  }, []);

  // Remove file from staging
  const handleRemoveStaged = useCallback((id: string) => {
    setStagedFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  // Clear all staged files
  const handleClearAll = useCallback(() => {
    setStagedFiles([]);
  }, []);

  // Upload a single file
  const uploadSingleFile = async (stagedFile: StagedFile): Promise<boolean> => {
    try {
      // Update status to uploading
      setStagedFiles((prev) =>
        prev.map((f) =>
          f.id === stagedFile.id
            ? { ...f, status: "uploading" as const, progress: 0 }
            : f,
        ),
      );

      // Get pre-signed URL
      const { url, storageKey } = await generateUploadUrl({
        fileName: stagedFile.file.name,
        contentType: stagedFile.file.type,
        projectId: projectId as Id<"projects">,
        folderId: folderId as Id<"folders">,
        fileSize: stagedFile.file.size,
      });

      // Upload with progress tracking
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", url);
        xhr.setRequestHeader("Content-Type", stagedFile.file.type);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setStagedFiles((prev) =>
              prev.map((f) =>
                f.id === stagedFile.id ? { ...f, progress } : f,
              ),
            );
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`Upload failed: ${xhr.status}`));
        };

        xhr.onerror = () => reject(new Error("Network error"));
        xhr.send(stagedFile.file);
      });

      // Create asset record
      await createAsset({
        projectId: projectId as Id<"projects">,
        folderId: folderId as Id<"folders">,
        filename: stagedFile.file.name,
        minioKey: storageKey,
        sizeBytes: stagedFile.file.size,
        mimeType: stagedFile.file.type,
      });

      // Update status to completed
      setStagedFiles((prev) =>
        prev.map((f) =>
          f.id === stagedFile.id
            ? { ...f, status: "completed" as const, progress: 100 }
            : f,
        ),
      );

      return true;
    } catch (error: any) {
      // Update status to error
      setStagedFiles((prev) =>
        prev.map((f) =>
          f.id === stagedFile.id
            ? {
                ...f,
                status: "error" as const,
                error: error.message,
              }
            : f,
        ),
      );
      return false;
    }
  };

  // Start uploading all pending files
  const handleStartUpload = async () => {
    const pendingFiles = stagedFiles.filter((f) => f.status === "pending");
    if (pendingFiles.length === 0) return;

    setIsUploading(true);

    let successCount = 0;
    for (const stagedFile of pendingFiles) {
      const success = await uploadSingleFile(stagedFile);
      if (success) successCount++;
    }

    setIsUploading(false);

    if (successCount > 0) {
      toast.success(`${successCount} file(s) uploaded successfully`);
    }
    if (successCount < pendingFiles.length) {
      toast.error(
        `${pendingFiles.length - successCount} file(s) failed to upload`,
      );
    }
  };

  // Mark folder as complete
  const handleMarkComplete = async () => {
    try {
      await updateFolderStatus({
        folderId: folderId as Id<"folders">,
        status: "completed",
      });
      toast.success("Folder marked as complete!");
    } catch (error) {
      toast.error("Failed to update folder status");
    }
  };

  if (!folder) {
    return (
      <div className="flex-1 space-y-8 p-8 md:p-12 w-full animate-pulse">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-xl bg-white/5" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48 bg-white/5" />
              <Skeleton className="h-4 w-32 bg-white/5" />
            </div>
          </div>
        </div>

        {/* Dropzone Skeleton */}
        <Skeleton className="h-40 w-full rounded-2xl bg-white/5" />

        {/* Asset List Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-32 bg-white/5" />
          <div className="grid gap-3">
            {[1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                className="h-20 w-full rounded-2xl bg-white/5"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalSize = assets?.reduce((sum, a: any) => sum + a.sizeBytes, 0) || 0;

  return (
    <div className="flex-1 space-y-4 p-8 md:p-12 w-full animate-in fade-in slide-in-from-bottom-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className="rounded-xl"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black uppercase tracking-tight text-white mb-1">
                {folder.name}
              </h1>
              {isLocked && (
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-[10px] tracking-[0.2em] font-black border",
                    isUploadComplete
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                      : "bg-amber-500/10 border-amber-500/20 text-amber-500",
                  )}
                >
                  {isUploadComplete ? "UPLOAD COMPLETE" : "LOCKED"}
                </span>
              )}
            </div>
            <p className="text-sm font-bold text-white/40 uppercase tracking-widest">
              {assets?.length || 0} files • {formatBytes(totalSize)}
              {isAdmin && " • Admin View"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {folder.status === "in_progress" && !isLocked && !isEmployee && (
            <Button
              variant="outline"
              className="rounded-full border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10"
              onClick={handleMarkComplete}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Mark Complete
            </Button>
          )}
        </div>
      </motion.div>

      {/* Upload Status Banner - Consistent with AssetsSection */}
      {isLocked && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "flex items-center gap-4 p-4 rounded-2xl border backdrop-blur-sm",
            isUploadComplete
              ? "bg-emerald-500/5 border-emerald-500/20"
              : "bg-amber-500/5 border-amber-500/20",
          )}
        >
          <div
            className={cn(
              "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
              isUploadComplete
                ? "bg-emerald-500/10 text-emerald-500"
                : "bg-amber-500/10 text-amber-500",
            )}
          >
            {isUploadComplete ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <Lock className="h-5 w-5" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4
              className={cn(
                "text-sm font-black uppercase tracking-tight",
                isUploadComplete ? "text-emerald-500" : "text-amber-500",
              )}
            >
              {isUploadComplete
                ? "Upload Phase Complete"
                : "Uploads Temporarily Locked"}
            </h4>
            <p className="text-xs text-white/50 mt-0.5">
              {isUploadComplete
                ? "Your files have been received. You can still view your uploaded assets below. Contact admin if you need to upload additional files."
                : uploadEligibility?.reason ||
                  "Awaiting quotation approval to unlock project storage."}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div
              className={cn(
                "px-3 py-1.5 rounded-lg flex items-center gap-2 text-[10px] font-black uppercase tracking-widest",
                isUploadComplete
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-amber-500/10 text-amber-400",
              )}
            >
              <Eye className="h-3.5 w-3.5" />
              View Only
            </div>
          </div>
        </motion.div>
      )}

      {/* Drop Zone - Locked out if isLocked is true or user is an employee */}
      {!isLocked && !isEmployee ? (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <FolderDropZone
              onFilesSelected={handleFilesSelected}
              disabled={isUploading}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <StagedUploadQueue
              stagedFiles={stagedFiles}
              onRemove={handleRemoveStaged}
              onStartUpload={handleStartUpload}
              onClearAll={handleClearAll}
              isUploading={isUploading}
            />
          </motion.div>
        </>
      ) : null}

      {/* Asset List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <FolderAssetList
          assets={assets}
          signedUrls={signedUrls}
          isEmployee={isEmployee}
        />
      </motion.div>

      {/* Empty State */}
      {(!assets || assets.length === 0) && stagedFiles.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-dashed bg-white/2 border-white/5">
            <CardContent className="py-20 text-center">
              <HardDrive className="h-16 w-16 text-white/10 mx-auto mb-4" />
              <p className="text-sm font-bold text-white/30 uppercase tracking-[0.2em]">
                No files uploaded yet
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
