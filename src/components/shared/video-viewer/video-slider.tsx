"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VideoSliderHeader } from "./video-slider-header";
import { VideoSliderStage } from "./video-slider-stage";
import { VideoSliderThumbnails } from "./video-slider-thumbnails";


interface VideoSliderProps {
  videos: Array<{
    url: string;
    fileName: string;
    fileId: string;
    mimeType?: string;
  }>;
  initialIndex?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload?: (fileId: string, fileName: string, url: string) => void;
}

export function VideoSlider({
  videos,
  initialIndex = 0,
  open,
  onOpenChange,
  onDownload,
}: VideoSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [videoError, setVideoError] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [showThumbnails, setShowThumbnails] = useState(true);
  const [videoKey, setVideoKey] = useState(0);

  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Reset state on open
  useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex);
      setVideoError(false);
      setIsVideoLoading(true);
      setVideoKey((prev) => prev + 1);
    }
  }, [open, initialIndex]);

  // Scroll thumbnails into view
  useEffect(() => {
    if (open && thumbnailRefs.current[currentIndex]) {
      thumbnailRefs.current[currentIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [currentIndex, open]);

  // Keyboard navigation for slider specific actions (Arrows)
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrevious();
      else if (e.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, videos.length]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : videos.length - 1));
    resetVideoState();
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < videos.length - 1 ? prev + 1 : 0));
    resetVideoState();
  };

  const resetVideoState = () => {
    setVideoError(false);
    setIsVideoLoading(true);
    setVideoKey((prev) => prev + 1);
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
    resetVideoState();
  };

  const currentVideo = videos[currentIndex];

  if (videos.length === 0 && !open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="fixed inset-0! top-0! left-0! z-100 flex h-screen! max-h-screen! w-screen! max-w-none! translate-x-0! translate-y-0! flex-col border-none bg-black/98 p-0 overflow-hidden focus:outline-none data-[state=open]:animate-none data-[state=closed]:animate-none border-0 rounded-none shadow-none transition-none"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Video Player</DialogTitle>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{
                opacity: 0,
                scale: 1.02,
                transition: { duration: 0.3, ease: "easeInOut" },
              }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              style={{ willChange: "transform, opacity" }}
              className="relative flex h-full flex-col"
            >
              <VideoSliderHeader
                fileName={currentVideo?.fileName}
                fileId={currentVideo?.fileId}
                currentIndex={currentIndex}
                totalVideos={videos.length}
                showThumbnails={showThumbnails}
                onToggleThumbnails={() => setShowThumbnails(!showThumbnails)}
                onClose={() => onOpenChange(false)}
                onDownload={onDownload}
                currentUrl={currentVideo?.url}
              />

              <VideoSliderStage
                currentUrl={currentVideo?.url}
                fileName={currentVideo?.fileName}
                mimeType={currentVideo?.mimeType}
                currentIndex={currentIndex}
                videoKey={videoKey}
                isVideoLoading={isVideoLoading}
                videoError={videoError}
                onSetIsVideoLoading={setIsVideoLoading}
                onSetVideoError={setVideoError}
                onResetVideoState={resetVideoState}
                onPrevious={handlePrevious}
                onNext={handleNext}
              />

              <AnimatePresence>
                {showThumbnails && videos.length > 1 && (
                  <VideoSliderThumbnails
                    videos={videos}
                    currentIndex={currentIndex}
                    onThumbnailClick={handleThumbnailClick}
                    thumbnailRefs={thumbnailRefs}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
