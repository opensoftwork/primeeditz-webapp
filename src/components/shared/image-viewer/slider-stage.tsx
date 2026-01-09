"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SliderStageProps {
  currentUrl: string;
  fileName: string;
  currentIndex: number;
  imageKey: number;
  isImageLoading: boolean;
  imageError: boolean;
  isZoomed: boolean;
  onSetIsImageLoading: (loading: boolean) => void;
  onSetImageError: (error: boolean) => void;
  onSetIsZoomed: (zoomed: boolean) => void;
  onResetImageState: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

export function SliderStage({
  currentUrl,
  fileName,
  currentIndex,
  imageKey,
  isImageLoading,
  imageError,
  isZoomed,
  onSetIsImageLoading,
  onSetImageError,
  onSetIsZoomed,
  onResetImageState,
  onPrevious,
  onNext,
}: SliderStageProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-4 md:p-12 relative overflow-hidden">
      {/* Background Texture/Ambient Light */}
      <div className="absolute inset-x-0 inset-y-0 z-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-15 blur-[60px] scale-150 transition-all duration-1000"
          style={{
            backgroundImage: `url(${currentUrl})`,
            backgroundPosition: "center",
            backgroundSize: "cover",
            willChange: "background-image",
          }}
        />
        <div className="absolute inset-0 bg-black/80" />
      </div>

      {/* Navigation Arrows - Floating */}
      <div className="absolute inset-x-8 z-40 flex items-center justify-between pointer-events-none">
        <Button
          variant="ghost"
          size="icon"
          className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 text-white pointer-events-auto transition-colors group underline-none"
          onClick={(e) => {
            e.stopPropagation();
            onPrevious();
          }}
        >
          <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 text-white pointer-events-auto transition-colors group underline-none"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
        >
          <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>

      {/* Central Image Wrapper */}
      <motion.div
        key={`${currentIndex}-${imageKey}`}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full h-full flex items-center justify-center"
      >
        {isImageLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-20">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
              Loading Projection
            </span>
          </div>
        )}

        {imageError ? (
          <div className="flex flex-col items-center justify-center gap-4 bg-white/5 border border-white/10 p-12 rounded-[3rem] backdrop-blur-xl pointer-events-auto">
            <X className="w-12 h-12 text-destructive" />
            <p className="text-sm font-black uppercase tracking-widest text-white/60">
              Artifact Corruption
            </p>
            <Button
              variant="outline"
              className="rounded-xl border-white/10 hover:bg-white/5 px-6"
              onClick={(e) => {
                e.stopPropagation();
                onResetImageState();
              }}
            >
              Retry Scan
            </Button>
          </div>
        ) : (
          <div
            className={cn(
              "relative w-full h-full transition-all duration-700 select-none",
              isImageLoading
                ? "opacity-0 translate-y-8"
                : "opacity-100 translate-y-0",
              isZoomed ? "cursor-zoom-out scale-150" : "cursor-zoom-in"
            )}
            onClick={() => onSetIsZoomed(!isZoomed)}
          >
            <Image
              src={currentUrl}
              alt={fileName || "Projection Viewer"}
              fill
              unoptimized
              priority
              className="object-contain shadow-[0_0_100px_rgba(0,0,0,0.5)] rounded-2xl"
              onLoad={() => onSetIsImageLoading(false)}
              onError={() => {
                onSetImageError(true);
                onSetIsImageLoading(false);
              }}
            />
          </div>
        )}
      </motion.div>
    </div>
  );
}
