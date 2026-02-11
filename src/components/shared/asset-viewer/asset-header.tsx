"use client";

import { Download, LayoutGrid, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AssetHeaderProps {
  fileName: string;
  fileId: string;
  currentIndex: number;
  totalAssets: number;
  showThumbnails: boolean;
  onToggleThumbnails: () => void;
  onClose: () => void;
  onDownload?: (fileId: string, fileName: string, url: string) => void;
  currentUrl: string;
}

export function AssetHeader({
  fileName,
  fileId,
  currentIndex,
  totalAssets,
  showThumbnails,
  onToggleThumbnails,
  onClose,
  onDownload,
  currentUrl,
}: AssetHeaderProps) {
  return (
    <div className="absolute top-0 inset-x-0 z-50 flex items-center justify-between px-8 py-6 pointer-events-none">
      {/* Left - File Info */}
      <div className="flex flex-col gap-1 pointer-events-auto">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/90 truncate max-w-[200px] md:max-w-[400px]">
            {fileName || "Asset Artifact"}
          </h3>
        </div>
        <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em]">
          Source ID: {fileId?.slice(0, 8)}...
        </p>
      </div>

      {/* Center - Counter */}
      <div className="absolute left-1/2 -translate-x-1/2 bg-white/5 border border-white/10 backdrop-blur-md rounded-full px-5 py-1.5 pointer-events-auto">
        <span className="text-[11px] font-black text-white/80 tracking-widest uppercase">
          {currentIndex + 1} <span className="text-white/20 px-1">/</span>{" "}
          {totalAssets}
        </span>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all underline-none"
          onClick={(e) => {
            e.stopPropagation();
            onToggleThumbnails();
          }}
          title="Toggle thumbnails"
        >
          <LayoutGrid className="w-4 h-4" />
        </Button>
        {onDownload && (
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all underline-none"
            onClick={(e) => {
              e.stopPropagation();
              onDownload(fileId, fileName, currentUrl);
            }}
            title="Download"
          >
            <Download className="w-4 h-4" />
          </Button>
        )}
        <div className="w-px h-6 bg-white/10 mx-1" />
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/20 text-primary hover:bg-primary hover:text-white transition-all underline-none"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          title="Close"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
