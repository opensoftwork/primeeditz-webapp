"use client";

import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  formatFileSize,
  getFileTypeIcon,
} from "@/components/shared/files-vault/utils";

/** Represents a file in the upload queue with its current status and progress. */
export interface StagedFile {
  id: string;
  file: File;
  status: "pending" | "uploading" | "completed" | "error";
  progress: number;
  error?: string;
}

export interface UploadQueueProps {
  /** Array of staged files to display */
  stagedFiles: StagedFile[];
  /** Callback to remove a file from the queue */
  onRemove: (id: string) => void;
  /** Callback to start uploading all pending files */
  onStartUpload: () => void;
  /** Callback to clear all files from the queue */
  onClearAll: () => void;
  /** Whether an upload is currently in progress */
  isUploading: boolean;
}

/** Generate a temporary object URL for image thumbnail preview */
function useThumbnailUrl(file: File): string | null {
  const [url, setUrl] = useState<string | null>(null);
  const isImage = file.type.startsWith("image/");

  useEffect(() => {
    if (!isImage) return;
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file, isImage]);

  return url;
}

function FileThumbnail({ file }: { file: File }) {
  const thumbnailUrl = useThumbnailUrl(file);
  const FileIcon = getFileTypeIcon(file.type);
  const isImage = file.type.startsWith("image/");

  if (isImage && thumbnailUrl) {
    return (
      <div className="h-10 w-10 rounded-xl overflow-hidden bg-black/40 border border-white/10 shrink-0">
        <img
          src={thumbnailUrl}
          alt={file.name}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
      <FileIcon className="h-4 w-4 text-white/20" />
    </div>
  );
}

export function UploadQueue({
  stagedFiles,
  onRemove,
  onStartUpload,
  onClearAll,
  isUploading,
}: UploadQueueProps) {
  if (stagedFiles.length === 0) return null;

  const pendingCount = stagedFiles.filter((f) => f.status === "pending").length;
  const completedCount = stagedFiles.filter(
    (f) => f.status === "completed",
  ).length;
  const errorCount = stagedFiles.filter((f) => f.status === "error").length;
  const allCompleted =
    completedCount === stagedFiles.length && stagedFiles.length > 0;

  const totalSize = stagedFiles.reduce((sum, f) => sum + f.file.size, 0);
  const uploadedSize = stagedFiles.reduce((sum, f) => {
    if (f.status === "completed") return sum + f.file.size;
    if (f.status === "uploading") return sum + (f.file.size * f.progress) / 100;
    return sum;
  }, 0);
  const overallProgress =
    totalSize > 0 ? Math.round((uploadedSize / totalSize) * 100) : 0;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "p-2 rounded-xl flex items-center justify-center transition-colors duration-300",
              isUploading
                ? "bg-primary/15"
                : allCompleted
                  ? "bg-emerald-500/10"
                  : "bg-white/5",
            )}
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 text-primary animate-spin" />
            ) : allCompleted ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            ) : (
              <Upload className="h-4 w-4 text-white/30" />
            )}
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-tight text-white leading-none">
              {isUploading
                ? "Uploading..."
                : allCompleted
                  ? "Upload Complete"
                  : "Ready to Upload"}
            </p>
            <p className="text-[8px] font-bold uppercase tracking-[0.15em] mt-0.5 text-white/30">
              {stagedFiles.length} file{stagedFiles.length !== 1 ? "s" : ""} •{" "}
              {formatFileSize(totalSize)}
              {errorCount > 0 && ` • ${errorCount} failed`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {!isUploading && !allCompleted && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2.5 text-[8px] font-black uppercase tracking-widest text-white/25 hover:text-white hover:bg-white/5 rounded-lg"
                onClick={onClearAll}
              >
                Clear
              </Button>
              <Button
                size="sm"
                className="h-7 px-3.5 rounded-lg bg-primary text-black text-[8px] font-black uppercase tracking-widest hover:bg-primary/90 shadow-lg shadow-primary/20"
                onClick={onStartUpload}
                disabled={pendingCount === 0}
              >
                Start Upload
              </Button>
            </>
          )}
          {allCompleted && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-3 text-[8px] font-black uppercase tracking-widest text-white/25 hover:text-white rounded-lg"
              onClick={onClearAll}
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Overall Progress */}
      <AnimatePresence>
        {isUploading && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-1"
          >
            <Progress
              value={overallProgress}
              className="h-1 bg-white/5"
              indicatorClassName="bg-primary transition-all duration-500"
            />
            <div className="flex justify-between items-center text-[7px] font-black uppercase tracking-widest text-white/25">
              <span>{overallProgress}% complete</span>
              <span>
                {formatFileSize(uploadedSize)} / {formatFileSize(totalSize)}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Summary */}
      <AnimatePresence>
        {allCompleted && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10"
          >
            <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500">
              ✓ {completedCount} file{completedCount !== 1 ? "s" : ""} uploaded
              successfully
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File List */}
      <div className="max-h-52 overflow-y-auto space-y-1 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {stagedFiles.map((stagedFile, idx) => (
            <motion.div
              key={stagedFile.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10, height: 0 }}
              transition={{ delay: idx * 0.03, duration: 0.25 }}
              layout
              className={cn(
                "p-2 rounded-xl border flex items-center gap-2.5 transition-colors group/file",
                stagedFile.status === "completed"
                  ? "border-emerald-500/10 bg-emerald-500/3"
                  : stagedFile.status === "error"
                    ? "border-red-500/10 bg-red-500/3"
                    : stagedFile.status === "uploading"
                      ? "border-primary/10 bg-primary/3"
                      : "border-white/5 bg-white/2",
              )}
            >
              {/* Thumbnail / Status Icon */}
              {stagedFile.status === "completed" ? (
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                </div>
              ) : stagedFile.status === "error" ? (
                <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                </div>
              ) : stagedFile.status === "uploading" ? (
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Loader2 className="h-4 w-4 text-primary animate-spin" />
                </div>
              ) : (
                <FileThumbnail file={stagedFile.file} />
              )}

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-bold text-white/80 truncate tracking-tight">
                    {stagedFile.file.name}
                  </p>
                  <span className="text-[7px] font-black text-white/15 uppercase tracking-widest shrink-0 bg-white/5 px-1.5 py-0.5 rounded">
                    {formatFileSize(stagedFile.file.size)}
                  </span>
                </div>

                {/* Progress Bar */}
                {stagedFile.status === "uploading" && (
                  <div className="flex items-center gap-2 mt-1">
                    <Progress
                      value={stagedFile.progress}
                      className="h-0.5 flex-1 bg-white/5"
                      indicatorClassName="bg-primary transition-all duration-300"
                    />
                    <span className="text-[7px] font-black text-primary/60 tabular-nums w-6 text-right">
                      {stagedFile.progress}%
                    </span>
                  </div>
                )}

                {/* Error Message */}
                {stagedFile.status === "error" && (
                  <p className="text-[7px] font-bold text-red-400 uppercase tracking-widest mt-0.5">
                    {stagedFile.error || "Upload Failed"}
                  </p>
                )}
              </div>

              {/* Remove Button (pending only) */}
              {stagedFile.status === "pending" && !isUploading && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-white/15 hover:text-red-400 hover:bg-red-400/5 rounded-lg shrink-0 opacity-0 group-hover/file:opacity-100 transition-all"
                  onClick={() => onRemove(stagedFile.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
