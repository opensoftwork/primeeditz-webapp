"use client";

import { useCallback, useState } from "react";
import { Upload } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DropZone } from "./drop-zone";
import { UploadQueue, type StagedFile } from "./upload-queue";

/**
 * Callback signature for uploading a single file.
 * The consumer provides the actual upload logic (e.g., S3 presigned URL + mutation).
 * @param file - The file to upload
 * @param onProgress - Callback to report upload progress (0-100)
 * @returns Promise that resolves when the upload is complete
 */
export type OnUploadFn = (
  file: File,
  onProgress: (progress: number) => void,
) => Promise<void>;

export interface FileUploadDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when the dialog open state changes */
  onOpenChange: (open: boolean) => void;
  /**
   * Upload handler for a single file.
   * Receives the file and a progress callback. Must return a Promise.
   */
  onUpload: OnUploadFn;
  /** Dialog title */
  title?: string;
  /** Dialog subtitle / description */
  subtitle?: string;
  /** Accepted file types for the drop zone */
  accept?: string;
  /** Callback fired when all uploads complete successfully */
  onAllComplete?: () => void;
}

export function FileUploadDialog({
  open,
  onOpenChange,
  onUpload,
  title = "Upload Files",
  subtitle = "Select files to upload",
  accept,
  onAllComplete,
}: FileUploadDialogProps) {
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Stage new files
  const handleFilesSelected = useCallback((files: File[]) => {
    const newStagedFiles: StagedFile[] = files.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      status: "pending" as const,
      progress: 0,
    }));

    setStagedFiles((prev) => [...prev, ...newStagedFiles]);
  }, []);

  // Remove a file from the queue
  const handleRemove = useCallback((id: string) => {
    setStagedFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  // Clear all files
  const handleClearAll = useCallback(() => {
    setStagedFiles([]);
  }, []);

  // Upload a single staged file
  const uploadSingleFile = useCallback(
    async (stagedFile: StagedFile): Promise<boolean> => {
      try {
        // Mark as uploading
        setStagedFiles((prev) =>
          prev.map((f) =>
            f.id === stagedFile.id
              ? { ...f, status: "uploading" as const, progress: 0 }
              : f,
          ),
        );

        await onUpload(stagedFile.file, (progress: number) => {
          setStagedFiles((prev) =>
            prev.map((f) =>
              f.id === stagedFile.id ? { ...f, progress } : f,
            ),
          );
        });

        // Mark as completed
        setStagedFiles((prev) =>
          prev.map((f) =>
            f.id === stagedFile.id
              ? { ...f, status: "completed" as const, progress: 100 }
              : f,
          ),
        );

        return true;
      } catch (error: any) {
        setStagedFiles((prev) =>
          prev.map((f) =>
            f.id === stagedFile.id
              ? {
                  ...f,
                  status: "error" as const,
                  error: error?.message || "Upload failed",
                }
              : f,
          ),
        );
        return false;
      }
    },
    [onUpload],
  );

  // Start uploading all pending files sequentially
  const handleStartUpload = useCallback(async () => {
    const pendingFiles = stagedFiles.filter((f) => f.status === "pending");
    if (pendingFiles.length === 0) return;

    setIsUploading(true);

    let successCount = 0;
    for (const stagedFile of pendingFiles) {
      const success = await uploadSingleFile(stagedFile);
      if (success) successCount++;
    }

    setIsUploading(false);

    if (successCount === pendingFiles.length) {
      onAllComplete?.();
    }
  }, [stagedFiles, uploadSingleFile, onAllComplete]);

  // Reset state when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isUploading) {
      setStagedFiles([]);
    }
    onOpenChange(newOpen);
  };

  const allCompleted =
    stagedFiles.length > 0 &&
    stagedFiles.every((f) => f.status === "completed");

  const hasStagedFiles = stagedFiles.length > 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "sm:max-w-lg rounded-3xl border-white/10 bg-zinc-950/95 backdrop-blur-xl p-0 gap-0 overflow-hidden shadow-2xl shadow-black/40",
        )}
        showCloseButton={!isUploading}
      >
        {/* Header */}
        <DialogHeader className="p-5 pb-3.5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-2.5 rounded-xl shrink-0 transition-colors duration-300",
                isUploading
                  ? "bg-primary/15"
                  : allCompleted
                    ? "bg-emerald-500/10"
                    : "bg-white/5",
              )}
            >
              <Upload
                className={cn(
                  "h-4 w-4 transition-colors",
                  isUploading
                    ? "text-primary"
                    : allCompleted
                      ? "text-emerald-500"
                      : "text-white/30",
                )}
              />
            </div>
            <div>
              <DialogTitle className="text-sm font-black uppercase tracking-tight text-white">
                {title}
              </DialogTitle>
              <DialogDescription className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/30 mt-0.5">
                {subtitle}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Content Area */}
        <div className="p-5 space-y-3">
          {/* Drop Zone — always visible, switches to compact when files are staged */}
          <AnimatePresence mode="wait">
            {!isUploading && !allCompleted && (
              <motion.div
                key="dropzone"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <DropZone
                  onFilesSelected={handleFilesSelected}
                  disabled={isUploading}
                  accept={accept}
                  compact={hasStagedFiles}
                  title={
                    hasStagedFiles
                      ? "Add more files"
                      : "Drop files here or click to browse"
                  }
                  description={
                    hasStagedFiles
                      ? "Drag or click to add"
                      : "Select one or more files to upload"
                  }
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Upload Queue */}
          <UploadQueue
            stagedFiles={stagedFiles}
            onRemove={handleRemove}
            onStartUpload={handleStartUpload}
            onClearAll={handleClearAll}
            isUploading={isUploading}
          />
        </div>

        {/* Footer — "Done" button when all complete */}
        <AnimatePresence>
          {allCompleted && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-5 pb-5"
            >
              <Button
                className="w-full h-9 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-black uppercase tracking-widest text-[9px] shadow-lg shadow-emerald-500/20"
                onClick={() => handleOpenChange(false)}
              >
                Done
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
