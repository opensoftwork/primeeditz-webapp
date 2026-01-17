"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import {
  Folder,
  Image,
  HardDrive,
  Clock,
  CheckCircle2,
  Loader2,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectFoldersListProps {
  projectId: Id<"projects">;
}

const statusConfig = {
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

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export function ProjectFoldersList({ projectId }: ProjectFoldersListProps) {
  const folders = useQuery(api.functions.folders.queries.getProjectFolders, {
    projectId,
  });

  if (folders === undefined) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-white/20" />
      </div>
    );
  }

  if (folders.length === 0) {
    return null;
  }

  const totalAssets = folders.reduce((sum, f) => sum + f.assetCount, 0);
  const totalSize = folders.reduce((sum, f) => sum + f.totalSize, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-white font-black uppercase tracking-tight text-sm">
          Project Folders
        </h3>
        <div className="flex items-center gap-4 text-white/40 text-xs font-medium">
          <span className="flex items-center gap-1.5">
            <Image className="h-3.5 w-3.5" />
            {totalAssets} files
          </span>
          <span className="flex items-center gap-1.5">
            <HardDrive className="h-3.5 w-3.5" />
            {formatBytes(totalSize)}
          </span>
        </div>
      </div>

      {/* Folder Grid */}
      <div className="grid grid-cols-2 gap-3">
        {folders.map((folder) => {
          const status = statusConfig[folder.status as keyof typeof statusConfig];
          const StatusIcon = status?.icon || Folder;

          return (
            <div
              key={folder._id}
              className="p-4 rounded-xl bg-white/3 border border-white/5 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "p-2 rounded-lg",
                    status?.bgColor || "bg-white/5"
                  )}
                >
                  <Folder className={cn("h-4 w-4", status?.color || "text-white/40")} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm truncate">
                    {folder.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-white/30 text-xs">
                      {folder.assetCount} files
                    </span>
                    {folder.totalSize > 0 && (
                      <>
                        <span className="text-white/10">•</span>
                        <span className="text-white/30 text-xs">
                          {formatBytes(folder.totalSize)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <StatusIcon className={cn("h-3 w-3", status?.color)} />
                  <span
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-wider",
                      status?.color
                    )}
                  >
                    {status?.label}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
