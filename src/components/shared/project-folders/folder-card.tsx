"use client";

import { CheckCircle2, Clock, Eye, Folder, Lock, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { DownloadFolderZip } from "./download-folder-zip";

export type FolderStatus = "pending_upload" | "in_progress" | "completed";

export const statusConfig = {
  pending_upload: {
    label: "Pending Upload",
    icon: Upload,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  in_progress: {
    label: "In Progress",
    icon: Clock,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
};

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / k ** i).toFixed(1)) + " " + sizes[i];
}

interface FolderCardProps {
  id?: string;
  name: string;
  status: string;
  assetCount: number;
  totalSize: number;
  onComplete?: () => void;
  onClick?: () => void;
  className?: string;
  isLocked?: boolean;
  isViewOnly?: boolean;
}

export function FolderCard({
  id,
  name,
  status,
  assetCount,
  totalSize,
  onClick,
  className,
  isLocked,
  isViewOnly,
  onComplete,
}: FolderCardProps) {
  const config = statusConfig[status as keyof typeof statusConfig];
  const StatusIcon = isLocked && !isViewOnly ? Lock : config?.icon || Folder;

  // In view-only mode, allow clicks for viewing but indicate restricted functionality
  const isClickable = !isLocked || isViewOnly;

  return (
    <div
      onClick={isClickable ? onClick : undefined}
      className={cn(
        "p-5 rounded-3xl bg-white/3 border border-white/5 transition-all duration-300 group relative overflow-hidden",
        isClickable
          ? "hover:bg-white/5 cursor-pointer"
          : "opacity-50 cursor-not-allowed",
        isViewOnly && "ring-1 ring-inset ring-primary/10",
        className,
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "p-3 rounded-2xl transition-transform duration-300",
            isClickable && "group-hover:scale-110",
            config?.bgColor || "bg-white/5",
          )}
        >
          <Folder
            className={cn(
              "h-5 w-5",
              isLocked && !isViewOnly
                ? "text-white/20"
                : config?.color || "text-white/40",
            )}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4">
            <p
              className={cn(
                "text-white font-black uppercase tracking-widest text-sm truncate transition-colors",
                isClickable && "group-hover:text-primary",
              )}
            >
              {name}
            </p>
            {status !== "in_progress" &&
              !isViewOnly &&
              id &&
              assetCount > 0 && (
                <DownloadFolderZip
                  folderId={id}
                  folderName={name}
                  size="sm"
                  variant="ghost"
                  label="DOWNLOAD ZIP"
                  className="h-8 px-3 text-[9px] font-black uppercase tracking-widest bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white border-blue-600/20 rounded-xl transition-all"
                />
              )}
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-white/30 text-[10px] font-bold uppercase tracking-widest">
              {assetCount} FILES
            </span>
            {totalSize > 0 && (
              <>
                <span className="text-white/10 text-[10px]">•</span>
                <span className="text-white/30 text-[10px] font-bold uppercase tracking-widest">
                  {formatBytes(totalSize)}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StatusIcon
            className={cn(
              "h-3 w-3",
              isLocked && !isViewOnly ? "text-white/20" : config?.color,
            )}
          />
          <span
            className={cn(
              "text-[9px] font-black uppercase tracking-[0.2em]",
              isLocked && !isViewOnly ? "text-white/20" : config?.color,
            )}
          >
            {isLocked && !isViewOnly ? "LOCKED" : config?.label}
          </span>
        </div>

        {isViewOnly && (
          <span className="text-[9px] font-black uppercase tracking-[0.15em] text-primary/60 flex items-center gap-1">
            <Eye className="h-3 w-3" />
            View
          </span>
        )}

        {status === "in_progress" && onComplete && !isLocked && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onComplete();
            }}
            className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all scale-90 group-hover:scale-100"
          >
            Mark Ready
          </button>
        )}

        {status !== "in_progress" && !isViewOnly && (
          <div
            className={cn(
              "h-1.5 w-1.5 rounded-full transition-colors",
              isClickable
                ? "bg-white/10 group-hover:bg-primary animate-pulse"
                : "bg-white/5",
            )}
          />
        )}
      </div>
    </div>
  );
}
