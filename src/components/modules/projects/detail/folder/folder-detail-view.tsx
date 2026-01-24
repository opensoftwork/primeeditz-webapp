"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useAction } from "convex/react";
import { ArrowLeft, CheckCircle2, Loader2, HardDrive, Eye } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatBytes } from "@/components/shared/project-folders/folder-card";

import { FolderDropZone } from "./folder-drop-zone";
import { FolderAssetList } from "./folder-asset-list";
import { StagedUploadQueue, type StagedFile } from "./staged-upload-queue";

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
  const isStaff = isAdmin || isEmployee;

  // State
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [signedUrls, setSignedUrls] = useState<Record<string, string | null>>(
    {},
  );

  // Queries & Mutations
  const folder = isStaff
    ? useQuery(api.functions.folders.queries.getProjectFolders, {
        projectId: projectId as Id<"projects">,
      })?.find((f) => f._id === folderId)
    : useQuery(api.functions.folders.queries.getFolderDetails, {
        folderId: folderId as Id<"folders">,
      });

  const assets = useQuery(api.functions.folders.queries.getFolderAssets, {
    folderId: folderId as Id<"folders">,
  });

  const updateFolderStatus = useMutation(
    isAdmin
      ? api.functions.folders.mutations.adminUpdateFolderStatus
      : api.functions.folders.mutations.updateFolderStatus,
  );

  const uploadEligibility = useQuery(
    api.functions.projects.queries.getProjectUploadEligibility,
    {
      projectId: projectId as Id<"projects">,
    },
  );

  const generateUploadUrl = useAction(
    api.functions.storage.actions.generateUploadUrl,
  );
  const createAsset = useMutation(api.functions.assets.mutations.createAsset);
  const getSignedUrls = useAction(
    api.functions.storage.actions.getSignedFileUrls,
  );

  // Fetch signed URLs for viewing images
  useEffect(() => {
    async function fetchUrls() {
      if (!assets || assets.length === 0) return;

      const imageAssets = assets.filter((a) => a.mimeType.startsWith("image/"));
      const keys = imageAssets.map((a) => a.minioKey);

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
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalSize = assets?.reduce((sum, a) => sum + a.sizeBytes, 0) || 0;

  return (
    <div className="flex-1 space-y-10 p-8 md:p-12 w-full animate-in fade-in slide-in-from-bottom-5">
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
            <h1 className="text-3xl font-black uppercase tracking-tight text-white">
              {folder.name}
            </h1>
            <p className="text-sm font-bold text-white/40 uppercase tracking-widest mt-1">
              {assets?.length || 0} files • {formatBytes(totalSize)}
              {isAdmin && " • Admin"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {folder.status === "in_progress" && (
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

      {/* Drop Zone - Only show if allowed */}
      {uploadEligibility?.isAllowed && (
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
      )}

      {/* View Only Badge for Admin */}
      {!uploadEligibility?.isAllowed && isAdmin && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Eye className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white">
                View Only Mode
              </p>
              <p className="text-[9px] font-bold text-amber-500/60 uppercase tracking-widest">
                {uploadEligibility?.reason || "Client Upload Phase"}
              </p>
            </div>
          </div>
          {uploadEligibility?.canOverride && (
            <Button
              variant="ghost"
              size="sm"
              className="text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white"
              onClick={() => {
                // We could add a local state to override this if needed,
                // but for now let's just show it.
                toast.info(
                  "Admin override available if required. Use System Controls to manage project state.",
                );
              }}
            >
              Admin Override Enabled
            </Button>
          )}
        </div>
      )}

      {/* Asset List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <FolderAssetList assets={assets} signedUrls={signedUrls} />
      </motion.div>

      {/* Empty State */}
      {(!assets || assets.length === 0) && stagedFiles.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <HardDrive className="h-16 w-16 text-white/10 mx-auto mb-4" />
              <p className="text-sm font-bold text-white/30 uppercase tracking-widest">
                No files uploaded yet
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
