"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { SliderHeader } from "./slider-header";
import { SliderStage } from "./slider-stage";
import { SliderThumbnails } from "./slider-thumbnails";

interface ImageSliderProps {
  images: Array<{
    url: string;
    fileName: string;
    fileId: string;
  }>;
  initialIndex?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload?: (fileId: string, fileName: string, url: string) => void;
}

export function ImageSlider({
  images,
  initialIndex = 0,
  open,
  onOpenChange,
  onDownload,
}: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [showThumbnails, setShowThumbnails] = useState(true);
  const [imageKey, setImageKey] = useState(0);

  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Reset state on open
  useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex);
      setImageError(false);
      setIsZoomed(false);
      setIsImageLoading(true);
      setImageKey((prev) => prev + 1);
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
  // Esc is handled by Dialog
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrevious();
      else if (e.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, images.length]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    resetImageState();
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    resetImageState();
  };

  const resetImageState = () => {
    setImageError(false);
    setIsZoomed(false);
    setIsImageLoading(true);
    setImageKey((prev) => prev + 1);
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
    resetImageState();
  };

  const currentImage = images[currentIndex];

  if (images.length === 0 && !open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="fixed inset-0! top-0! left-0! z-100 flex h-screen! max-h-screen! w-screen! max-w-none! translate-x-0! translate-y-0! flex-col border-none bg-black/98 p-0 overflow-hidden focus:outline-none data-[state=open]:animate-none data-[state=closed]:animate-none border-0 rounded-none shadow-none transition-none"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Image Projection Viewer</DialogTitle>

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
              <SliderHeader
                fileName={currentImage?.fileName}
                fileId={currentImage?.fileId}
                currentIndex={currentIndex}
                totalImages={images.length}
                showThumbnails={showThumbnails}
                onToggleThumbnails={() => setShowThumbnails(!showThumbnails)}
                onClose={() => onOpenChange(false)}
                onDownload={onDownload}
                currentUrl={currentImage?.url}
              />

              <SliderStage
                currentUrl={currentImage?.url}
                fileName={currentImage?.fileName}
                currentIndex={currentIndex}
                imageKey={imageKey}
                isImageLoading={isImageLoading}
                imageError={imageError}
                isZoomed={isZoomed}
                onSetIsImageLoading={setIsImageLoading}
                onSetImageError={setImageError}
                onSetIsZoomed={setIsZoomed}
                onResetImageState={resetImageState}
                onPrevious={handlePrevious}
                onNext={handleNext}
              />

              <AnimatePresence>
                {showThumbnails && (
                  <SliderThumbnails
                    images={images}
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
