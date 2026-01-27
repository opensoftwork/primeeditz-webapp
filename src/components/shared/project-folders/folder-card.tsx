"use client";

import { CheckCircle2, Clock, Folder, Lock, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

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
  name: string;
  status: string;
  assetCount: number;
  totalSize: number;
  onComplete?: () => void;
  onClick?: () => void;
  className?: string;
  isLocked?: boolean;
}

export function FolderCard({
  name,
  status,
  assetCount,
  totalSize,
  onClick,
  className,
  isLocked,
  onComplete,
}: FolderCardProps) {
  const config = statusConfig[status as keyof typeof statusConfig];
  const StatusIcon = isLocked ? Lock : config?.icon || Folder;

  return (
    <div
      onClick={!isLocked ? onClick : undefined}
      className={cn(
        "p-5 rounded-3xl bg-white/3 border border-white/5 transition-all duration-300 group",
        !isLocked
          ? "hover:bg-white/5 cursor-pointer"
          : "opacity-50 cursor-not-allowed",
        className,
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "p-3 rounded-2xl transition-transform duration-300",
            !isLocked && "group-hover:scale-110",
            config?.bgColor || "bg-white/5",
          )}
        >
          <Folder
            className={cn(
              "h-5 w-5",
              isLocked ? "text-white/20" : config?.color || "text-white/40",
            )}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "text-white font-black uppercase tracking-tight text-sm truncate transition-colors",
              !isLocked && "group-hover:text-primary",
            )}
          >
            {name}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-white/30 text-[10px] font-bold uppercase tracking-widest">
              {assetCount} files
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
              "h-3.5 w-3.5",
              isLocked ? "text-white/20" : config?.color,
            )}
          />
          <span
            className={cn(
              "text-[9px] font-black uppercase tracking-[0.2em]",
              isLocked ? "text-white/20" : config?.color,
            )}
          >
            {isLocked ? "LOCKED" : config?.label}
          </span>
        </div>

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

        {status !== "in_progress" && (
          <div
            className={cn(
              "h-1.5 w-1.5 rounded-full transition-colors",
              !isLocked
                ? "bg-white/10 group-hover:bg-primary animate-pulse"
                : "bg-white/5",
            )}
          />
        )}
      </div>
    </div>
  );
}
