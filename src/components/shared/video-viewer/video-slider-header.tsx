"use client";

import { Download, LayoutGrid, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoSliderHeaderProps {
  fileName: string;
  fileId: string;
  currentIndex: number;
  totalVideos: number;
  showThumbnails: boolean;
  onToggleThumbnails: () => void;
  onClose: () => void;
  onDownload?: (fileId: string, fileName: string, url: string) => void;
  currentUrl: string;
}

export function VideoSliderHeader({
  fileName,
  fileId,
  currentIndex,
  totalVideos,
  showThumbnails,
  onToggleThumbnails,
  onClose,
  onDownload,
  currentUrl,
}: VideoSliderHeaderProps) {
  return (
    <div className="absolute top-0 inset-x-0 z-50 flex items-center justify-between px-8 py-6 pointer-events-none">
      {/* Left - File Info */}
      <div className="flex flex-col gap-1 pointer-events-auto">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/90">
            {fileName || "Video Player"}
          </h3>
        </div>
        <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em]">
          Video ID: {fileId?.slice(0, 8)}...
        </p>
      </div>

      {/* Center - Counter */}
      {totalVideos > 1 && (
        <div className="absolute left-1/2 -translate-x-1/2 bg-white/5 border border-white/10 backdrop-blur-md rounded-full px-5 py-1.5 pointer-events-auto">
          <span className="text-[11px] font-black text-white/80 tracking-widest uppercase">
            {currentIndex + 1} <span className="text-white/20 px-1">/</span>{" "}
            {totalVideos}
          </span>
        </div>
      )}

      {/* Right - Actions */}
      <div className="flex items-center gap-3 pointer-events-auto">
        {totalVideos > 1 && (
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all underline-none"
            onClick={(e) => {
              e.stopPropagation();
              onToggleThumbnails();
            }}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
        )}
        {onDownload && (
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all underline-none"
            onClick={(e) => {
              e.stopPropagation();
              onDownload(fileId, fileName, currentUrl);
            }}
          >
            <Download className="w-4 h-4" />
          </Button>
        )}
        <div className="w-px h-6 bg-white/10 mx-1" />
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/20 text-purple-400 hover:bg-purple-500 hover:text-white transition-all underline-none"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
