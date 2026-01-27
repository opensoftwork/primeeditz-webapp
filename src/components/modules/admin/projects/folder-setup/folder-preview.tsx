"use client";

import { Folder, FolderOpen } from "lucide-react";

interface FolderPreviewProps {
  folders: string[];
  projectCode: string;
}

export function FolderPreview({ folders, projectCode }: FolderPreviewProps) {
  if (folders.length === 0) {
    return (
      <div className="text-center py-6 text-white/30 text-sm">
        Select a template to preview folders
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Root folder indicator */}
      <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-white/5 border border-white/10">
        <FolderOpen className="h-4 w-4 text-primary" />
        <span className="text-white font-bold text-sm">{projectCode}</span>
        <span className="text-white/30 text-xs">/ root</span>
      </div>

      {/* Folder list */}
      <div className="pl-4 border-l-2 border-white/5 ml-3 space-y-1">
        {folders.map((folder, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 py-2 px-3 rounded-lg bg-white/3 hover:bg-white/5 transition-colors"
          >
            <Folder className="h-4 w-4 text-amber-500/70" />
            <span className="text-white/80 font-medium text-sm">{folder}</span>
            <span className="text-white/20 text-xs ml-auto">
              pending_upload
            </span>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="pt-2 text-center">
        <span className="text-white/30 text-xs font-medium">
          {folders.length} folder{folders.length !== 1 ? "s" : ""} will be
          created
        </span>
      </div>
    </div>
  );
}
