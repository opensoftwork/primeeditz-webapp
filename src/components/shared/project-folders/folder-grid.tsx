"use client";

import { Image, HardDrive, Loader2 } from "lucide-react";
import { FolderCard, formatBytes } from "./folder-card";

interface FolderGridProps {
  folders: any[] | undefined;
  onFolderClick?: (folder: any) => void;
  title?: string;
  showStats?: boolean;
  isLocked?: boolean;
  onFolderComplete?: (folder: any) => void;
}

export function FolderGrid({
  folders,
  onFolderClick,
  title = "Project Folders",
  showStats = true,
  isLocked = false,
  onFolderComplete,
}: FolderGridProps) {
  if (folders === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-white/20" />
      </div>
    );
  }

  if (folders.length === 0) {
    return (
      <div className="p-12 rounded-[2.5rem] border border-dashed border-white/5 flex flex-col items-center justify-center text-center">
        <p className="text-white/20 font-black uppercase tracking-widest text-xs">
          No folders configured for this project
        </p>
      </div>
    );
  }

  const totalAssets = folders.reduce((sum, f) => sum + (f.assetCount || 0), 0);
  const totalSize = folders.reduce((sum, f) => sum + (f.totalSize || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-white font-black uppercase tracking-tight text-sm">
          {title}
        </h3>
        {showStats && (
          <div className="flex items-center gap-6 text-white/40 text-[9px] font-black uppercase tracking-[0.2em]">
            <span className="flex items-center gap-2">
              <Image className="h-3.5 w-3.5 text-primary/40" />
              {totalAssets} files
            </span>
            <span className="flex items-center gap-2">
              <HardDrive className="h-3.5 w-3.5 text-primary/40" />
              {formatBytes(totalSize)}
            </span>
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {folders.map((folder) => (
          <FolderCard
            key={folder._id}
            name={folder.name}
            status={folder.status}
            assetCount={folder.assetCount || 0}
            totalSize={folder.totalSize || 0}
            isLocked={isLocked}
            onClick={() => onFolderClick?.(folder)}
            onComplete={() => onFolderComplete?.(folder)}
          />
        ))}
      </div>
    </div>
  );
}
