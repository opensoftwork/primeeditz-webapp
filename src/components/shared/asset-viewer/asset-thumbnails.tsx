"use client";

import { motion } from "motion/react";
import Image from "next/image";
import type { RefObject } from "react";
import { cn } from "@/lib/utils";
import type { ViewerAsset } from "./asset-slider";
import { FileText, Play, Music } from "lucide-react";

interface AssetThumbnailsProps {
  assets: ViewerAsset[];
  currentIndex: number;
  onThumbnailClick: (index: number) => void;
  thumbnailRefs: RefObject<(HTMLButtonElement | null)[]>;
}

export function AssetThumbnails({
  assets,
  currentIndex,
  onThumbnailClick,
  thumbnailRefs,
}: AssetThumbnailsProps) {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="h-28 border-t border-white/5 bg-black/40 backdrop-blur-xl px-8 flex items-center gap-4 overflow-x-auto custom-scrollbar relative z-50 pointer-events-auto"
    >
      <div className="flex items-center gap-3 py-2 min-w-max mx-auto">
        {assets.map((asset, index) => {
          const isVideo =
            asset?.mimeType?.startsWith("video/") || asset?.type === "video";
          const isAudio =
            asset?.mimeType?.startsWith("audio/") || asset?.type === "audio";
          const isPDF =
            asset?.mimeType === "application/pdf" || asset?.type === "pdf";

          return (
            <button
              key={`${asset.fileId}-${index}`}
              ref={(el) => {
                if (thumbnailRefs.current) {
                  thumbnailRefs.current[index] = el;
                }
              }}
              onClick={() => onThumbnailClick(index)}
              className={cn(
                "relative h-16 w-16 rounded-xl overflow-hidden transition-all duration-300 group shrink-0",
                "border-2",
                currentIndex === index
                  ? "border-primary scale-110 shadow-[0_0_20px_rgba(var(--primary),0.3)]"
                  : "border-white/5 opacity-40 hover:opacity-100 hover:border-white/20",
              )}
            >
              {isPDF ? (
                <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white/40" />
                </div>
              ) : isAudio ? (
                <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                  <Music className="w-6 h-6 text-white/40" />
                </div>
              ) : isVideo ? (
                <div className="relative w-full h-full">
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                    <Play className="w-4 h-4 text-white fill-white" />
                  </div>
                  {/* For videos we usually show a placeholder or fixed background since we don't have thumbnails generated easily on client */}
                  <div className="w-full h-full bg-zinc-800" />
                </div>
              ) : (
                <Image
                  src={asset.url}
                  alt={asset.fileName}
                  fill
                  className="object-cover"
                  unoptimized
                />
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
