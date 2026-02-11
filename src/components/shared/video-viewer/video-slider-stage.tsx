"use client";

import { ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VideoSliderStageProps {
  currentUrl: string;
  fileName: string;
  mimeType?: string;
  currentIndex: number;
  videoKey: number;
  isVideoLoading: boolean;
  videoError: boolean;
  onSetIsVideoLoading: (loading: boolean) => void;
  onSetVideoError: (error: boolean) => void;
  onResetVideoState: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

export function VideoSliderStage({
  currentUrl,
  fileName,
  mimeType,
  currentIndex,
  videoKey,
  isVideoLoading,
  videoError,
  onSetIsVideoLoading,
  onSetVideoError,
  onResetVideoState,
  onPrevious,
  onNext,
}: VideoSliderStageProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Auto-pause when changing videos
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [currentIndex, videoKey]);

  return (
    <div className="flex-1 flex items-center justify-center p-4 md:p-12 relative overflow-hidden">
      {/* Background Ambient Light */}
      <div className="absolute inset-x-0 inset-y-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-linear-to-br from-purple-900/20 via-black to-purple-900/10" />
        <div className="absolute inset-0 bg-black/80" />
      </div>

      {/* Navigation Arrows - Only show if there are multiple videos */}
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

      {/* Central Video Wrapper */}
      <motion.div
        key={`${currentIndex}-${videoKey}`}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full h-full flex items-center justify-center max-w-6xl"
      >
        {isVideoLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-20">
            <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
              Loading Video
            </span>
          </div>
        )}

        {videoError ? (
          <div className="flex flex-col items-center justify-center gap-4 bg-white/5 border border-white/10 p-12 rounded-[3rem] backdrop-blur-xl pointer-events-auto">
            <X className="w-12 h-12 text-destructive" />
            <p className="text-sm font-black uppercase tracking-widest text-white/60">
              Video Unavailable
            </p>
            <Button
              variant="outline"
              className="rounded-xl border-white/10 hover:bg-white/5 px-6"
              onClick={(e) => {
                e.stopPropagation();
                onResetVideoState();
              }}
            >
              Retry
            </Button>
          </div>
        ) : (
          <div
            className={cn(
              "relative w-full h-full transition-all duration-700 select-none flex items-center justify-center",
              isVideoLoading
                ? "opacity-0 translate-y-8"
                : "opacity-100 translate-y-0",
            )}
          >
            <video
              ref={videoRef}
              src={currentUrl}
              controls
              autoPlay={false}
              playsInline
              className="max-w-full max-h-full object-contain rounded-2xl shadow-[0_0_100px_rgba(0,0,0,0.5)] bg-black"
              style={{ maxHeight: "calc(100vh - 200px)" }}
              onLoadedData={() => onSetIsVideoLoading(false)}
              onCanPlay={() => onSetIsVideoLoading(false)}
              onError={() => {
                onSetVideoError(true);
                onSetIsVideoLoading(false);
              }}
            >
              {mimeType && <source src={currentUrl} type={mimeType} />}
              Your browser does not support the video tag.
            </video>
          </div>
        )}
      </motion.div>
    </div>
  );
}
