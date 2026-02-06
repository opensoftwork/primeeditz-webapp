"use client";

import { Film } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface VideoSliderThumbnailsProps {
  videos: Array<{
    url: string;
    fileName: string;
    fileId: string;
  }>;
  currentIndex: number;
  onThumbnailClick: (index: number) => void;
  thumbnailRefs: React.MutableRefObject<(HTMLButtonElement | null)[]>;
}

export function VideoSliderThumbnails({
  videos,
  currentIndex,
  onThumbnailClick,
  thumbnailRefs,
}: VideoSliderThumbnailsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="shrink-0 w-full z-50 flex justify-center pb-12 px-6"
    >
      <div className="relative group/thumbnails w-full max-w-5xl">
        {/* Left Gradient Mask */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-linear-to-r from-black/80 to-transparent z-10 pointer-events-none rounded-l-[2.5rem]" />

        <div className="absolute right-0 top-0 bottom-0 w-24 bg-linear-to-l from-black/80 to-transparent z-10 pointer-events-none rounded-r-[2.5rem]" />

        <div className="flex items-center gap-4 bg-white/5 border border-white/10 backdrop-blur-xl p-4 rounded-[2.5rem] shadow-2xl overflow-x-auto no-scrollbar scroll-smooth">
          <div className="flex items-center gap-4 px-12">
            {videos.map((video, idx) => (
              <button
                key={video.fileId}
                ref={(el) => {
                  thumbnailRefs.current[idx] = el;
                }}
                onClick={() => onThumbnailClick(idx)}
                className={cn(
                  "relative w-24 h-16 rounded-2xl overflow-hidden transition-all duration-500 shrink-0 group flex items-center justify-center bg-purple-900/20",
                  idx === currentIndex
                    ? "ring-2 ring-purple-500 ring-offset-4 ring-offset-black scale-110 shadow-2xl shadow-purple-500/20"
                    : "opacity-40 hover:opacity-100 hover:scale-105",
                )}
              >
                <Film
                  className={cn(
                    "w-6 h-6 transition-colors",
                    idx === currentIndex ? "text-purple-400" : "text-white/40",
                  )}
                />
                {idx === currentIndex && (
                  <div className="absolute inset-0 bg-purple-500/20 pointer-events-none animate-in fade-in" />
                )}
                <span className="absolute bottom-1 left-1 right-1 text-[7px] font-bold text-white/60 truncate text-center">
                  {video.fileName.slice(0, 12)}...
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
