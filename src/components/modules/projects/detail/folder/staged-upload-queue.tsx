"use client";

import {
  AlertCircle,
  CheckCircle2,
  FileImage,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { formatBytes } from "@/components/shared/project-folders/folder-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export interface StagedFile {
  id: string;
  file: File;
  status: "pending" | "uploading" | "completed" | "error";
  progress: number;
  error?: string;
}

interface StagedUploadQueueProps {
  stagedFiles: StagedFile[];
  onRemove: (id: string) => void;
  onStartUpload: () => void;
  onClearAll: () => void;
  isUploading: boolean;
}

export function StagedUploadQueue({
  stagedFiles,
  onRemove,
  onStartUpload,
  onClearAll,
  isUploading,
}: StagedUploadQueueProps) {
  if (stagedFiles.length === 0) {
    return null;
  }

  const pendingCount = stagedFiles.filter((f) => f.status === "pending").length;
  const completedCount = stagedFiles.filter(
    (f) => f.status === "completed",
  ).length;
  const hasErrors = stagedFiles.some((f) => f.status === "error");
  const allCompleted = completedCount === stagedFiles.length;

  const totalSize = stagedFiles.reduce((sum, f) => sum + f.file.size, 0);
  const uploadedSize = stagedFiles.reduce((sum, f) => {
    if (f.status === "completed") return sum + f.file.size;
    if (f.status === "uploading") return sum + (f.file.size * f.progress) / 100;
    return sum;
  }, 0);
  const overallProgress = Math.round((uploadedSize / totalSize) * 100);

  return (
    <Card className="border-primary/20 bg-primary/5 rounded-2xl overflow-hidden">
      <CardHeader className="p-4 pb-3 border-b border-primary/10">
        <div className="flex items-center justify-between">
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
              <CardTitle className="text-sm font-black uppercase tracking-tight text-white leading-none">
                {isUploading
                  ? "Uploading Assets"
                  : allCompleted
                    ? "Upload Complete"
                    : "Staged Files"}
              </CardTitle>
              <CardDescription className="text-[9px] font-bold uppercase tracking-[0.15em] mt-1.5 text-white/40">
                {stagedFiles.length} files • {formatBytes(totalSize)}
              </CardDescription>
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
                Close Queue
              </Button>
            )}
          </div>
        </div>

        {/* Overall Progress */}
        {isUploading && (
          <div className="mt-4 space-y-1.5">
            <Progress value={overallProgress} className="h-1.5 bg-primary/10" />
            <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-primary/60">
              <span>{overallProgress}% COMPLETE</span>
              <span>
                {formatBytes(uploadedSize)} / {formatBytes(totalSize)}
              </span>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-3 max-h-80 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {stagedFiles.map((stagedFile) => (
            <div
              key={stagedFile.id}
              className="p-2.5 rounded-xl bg-white/3 border border-white/5 flex items-center gap-3 transition-colors hover:bg-white/5"
            >
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

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-bold text-white truncate tracking-tight">
                    {stagedFile.file.name}
                  </p>
                  <span className="text-[8px] font-black text-white/20 uppercase tracking-widest shrink-0">
                    {formatBytes(stagedFile.file.size)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {stagedFile.status === "uploading" && (
                    <div className="flex-1 flex items-center gap-3 mt-1">
                      <Progress
                        value={stagedFile.progress}
                        className="h-1 flex-1 bg-primary/10"
                      />
                      <span className="text-[8px] font-black text-primary tabular-nums">
                        {stagedFile.progress}%
                      </span>
                    </div>
                  )}
                  {stagedFile.status === "error" && (
                    <p className="text-[8px] font-bold text-red-500 uppercase tracking-widest mt-1">
                      {stagedFile.error || "Upload Failed"}
                    </p>
                  )}
                </div>
              </div>

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
      </CardContent>
    </Card>
  );
}
