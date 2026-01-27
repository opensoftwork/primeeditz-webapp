"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface SliderThumbnailsProps {
  images: Array<{
    url: string;
    fileName: string;
    fileId: string;
  }>;
  currentIndex: number;
  onThumbnailClick: (index: number) => void;
  thumbnailRefs: React.MutableRefObject<(HTMLButtonElement | null)[]>;
}

export function SliderThumbnails({
  images,
  currentIndex,
  onThumbnailClick,
  thumbnailRefs,
}: SliderThumbnailsProps) {
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
            {images.map((image, idx) => (
              <button
                key={image.fileId}
                ref={(el) => {
                  thumbnailRefs.current[idx] = el;
                }}
                onClick={() => onThumbnailClick(idx)}
                className={cn(
                  "relative w-20 h-20 rounded-2xl overflow-hidden transition-all duration-500 shrink-0 group",
                  idx === currentIndex
                    ? "ring-2 ring-primary ring-offset-4 ring-offset-black scale-110 shadow-2xl shadow-primary/20"
                    : "opacity-40 grayscale hover:opacity-100 hover:grayscale-0 hover:scale-105",
                )}
              >
                <Image
                  src={image.url}
                  alt={image.fileName}
                  fill
                  unoptimized
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {idx === currentIndex && (
                  <div className="absolute inset-0 bg-primary/20 pointer-events-none animate-in fade-in" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
