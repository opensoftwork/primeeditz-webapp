"use client";

import {
  AlertCircle,
  CheckCircle2,
  FileImage,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

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

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}

export function UploadQueue({
  stagedFiles,
  onRemove,
  onStartUpload,
  onClearAll,
  isUploading,
}: UploadQueueProps) {
  if (stagedFiles.length === 0) {
    return null;
  }

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
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "p-2 rounded-xl flex items-center justify-center",
              isUploading
                ? "bg-primary/20"
                : allCompleted
                  ? "bg-emerald-500/10"
                  : "bg-primary/10",
            )}
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 text-primary animate-spin" />
            ) : allCompleted ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            ) : (
              <Upload className="h-4 w-4 text-primary" />
            )}
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-tight text-white leading-none">
              {isUploading
                ? "Uploading..."
                : allCompleted
                  ? "Upload Complete"
                  : "Ready to Upload"}
            </p>
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] mt-1 text-white/40">
              {stagedFiles.length} file{stagedFiles.length !== 1 ? "s" : ""} •{" "}
              {formatBytes(totalSize)}
              {errorCount > 0 && ` • ${errorCount} failed`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isUploading && !allCompleted && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-[9px] font-black uppercase tracking-widest text-white/30 hover:text-white hover:bg-white/5 rounded-lg"
                onClick={onClearAll}
              >
                Clear
              </Button>
              <Button
                size="sm"
                className="h-8 px-4 rounded-lg bg-primary text-black text-[9px] font-black uppercase tracking-widest hover:bg-primary/90"
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
              className="h-8 px-4 text-[9px] font-black uppercase tracking-widest text-white/30 hover:text-white rounded-lg"
              onClick={onClearAll}
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Overall Progress */}
      {isUploading && (
        <div className="space-y-1.5 px-1">
          <Progress value={overallProgress} className="h-1.5 bg-primary/10" />
          <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-primary/60">
            <span>{overallProgress}% COMPLETE</span>
            <span>
              {formatBytes(uploadedSize)} / {formatBytes(totalSize)}
            </span>
          </div>
        </div>
      )}

      {/* Success Summary */}
      {allCompleted && (
        <div className="mx-1 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
            {completedCount} of {stagedFiles.length} file
            {stagedFiles.length !== 1 ? "s" : ""} uploaded successfully
          </p>
        </div>
      )}

      {/* File List */}
      <div className="max-h-60 overflow-y-auto space-y-1.5 px-1">
        {stagedFiles.map((stagedFile) => (
          <div
            key={stagedFile.id}
            className={cn(
              "p-2.5 rounded-xl bg-white/2 border border-white/5 flex items-center gap-3 transition-colors hover:bg-white/4",
              stagedFile.status === "completed" &&
                "border-emerald-500/10 bg-emerald-500/2",
              stagedFile.status === "error" &&
                "border-red-500/10 bg-red-500/2",
            )}
          >
            {/* Status Icon */}
            <div className="p-1.5 rounded-lg bg-white/5 shrink-0">
              {stagedFile.status === "completed" ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              ) : stagedFile.status === "error" ? (
                <AlertCircle className="h-3.5 w-3.5 text-red-500" />
              ) : stagedFile.status === "uploading" ? (
                <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
              ) : (
                <FileImage className="h-3.5 w-3.5 text-white/20" />
              )}
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-bold text-white truncate tracking-tight">
                  {stagedFile.file.name}
                </p>
                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest shrink-0">
                  {formatBytes(stagedFile.file.size)}
                </span>
              </div>

              {/* Progress Bar (while uploading) */}
              {stagedFile.status === "uploading" && (
                <div className="flex items-center gap-3 mt-1">
                  <Progress
                    value={stagedFile.progress}
                    className="h-1 flex-1 bg-primary/10"
                  />
                  <span className="text-[8px] font-black text-primary tabular-nums">
                    {stagedFile.progress}%
                  </span>
                </div>
              )}

              {/* Error Message */}
              {stagedFile.status === "error" && (
                <p className="text-[8px] font-bold text-red-500 uppercase tracking-widest mt-1">
                  {stagedFile.error || "Upload Failed"}
                </p>
              )}
            </div>

            {/* Remove Button (pending only) */}
            {stagedFile.status === "pending" && !isUploading && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-white/20 hover:text-red-400 hover:bg-red-400/5 rounded-lg shrink-0"
                onClick={() => onRemove(stagedFile.id)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
