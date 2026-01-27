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
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : allCompleted ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Upload Complete
                </>
              ) : (
                <>Ready to Upload</>
              )}
            </CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest mt-1">
              {stagedFiles.length} files • {formatBytes(totalSize)}
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            {!isUploading && !allCompleted && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/40 hover:text-white"
                  onClick={onClearAll}
                >
                  Clear All
                </Button>
                <Button
                  size="sm"
                  className="rounded-full"
                  onClick={onStartUpload}
                  disabled={pendingCount === 0}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Start Upload
                </Button>
              </>
            )}
            {allCompleted && (
              <Button variant="ghost" size="sm" onClick={onClearAll}>
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Overall Progress */}
        {isUploading && (
          <div className="mt-4">
            <Progress value={overallProgress} className="h-2" />
            <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-2 text-right">
              {overallProgress}% • {formatBytes(uploadedSize)} /{" "}
              {formatBytes(totalSize)}
            </p>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-2 max-h-64 overflow-y-auto">
        {stagedFiles.map((stagedFile) => (
          <div
            key={stagedFile.id}
            className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3"
          >
            <div className="p-2 rounded-lg bg-primary/10">
              {stagedFile.status === "completed" ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              ) : stagedFile.status === "error" ? (
                <AlertCircle className="h-4 w-4 text-red-500" />
              ) : stagedFile.status === "uploading" ? (
                <Loader2 className="h-4 w-4 text-primary animate-spin" />
              ) : (
                <FileImage className="h-4 w-4 text-primary" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">
                {stagedFile.file.name}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">
                  {formatBytes(stagedFile.file.size)}
                </span>
                {stagedFile.status === "uploading" && (
                  <>
                    <span className="text-white/10">•</span>
                    <span className="text-[9px] font-bold text-primary tabular-nums">
                      {stagedFile.progress}%
                    </span>
                  </>
                )}
                {stagedFile.status === "error" && (
                  <>
                    <span className="text-white/10">•</span>
                    <span className="text-[9px] font-bold text-red-500">
                      {stagedFile.error || "Failed"}
                    </span>
                  </>
                )}
              </div>

              {/* Per-file progress bar */}
              {stagedFile.status === "uploading" && (
                <Progress value={stagedFile.progress} className="h-1 mt-2" />
              )}
            </div>

            {stagedFile.status === "pending" && !isUploading && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-white/30 hover:text-white"
                onClick={() => onRemove(stagedFile.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
