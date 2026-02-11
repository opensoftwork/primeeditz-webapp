"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { AssetHeader } from "./asset-header";
import { AssetStage } from "./asset-stage";
import { AssetThumbnails } from "./asset-thumbnails";

export type AssetType = "image" | "video" | "pdf" | "audio" | "other";

export interface ViewerAsset {
  url: string;
  fileName: string;
  fileId: string;
  mimeType?: string;
  type?: AssetType;
}

interface AssetSliderProps {
  assets: ViewerAsset[];
  initialIndex?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload?: (fileId: string, fileName: string, url: string) => void;
}

export function AssetSlider({
  assets,
  initialIndex = 0,
  open,
  onOpenChange,
  onDownload,
}: AssetSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showThumbnails, setShowThumbnails] = useState(true);
  const [assetKey, setAssetKey] = useState(0);

  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Reset state on open
  useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex);
      setHasError(false);
      setIsZoomed(false);
      setIsLoading(true);
      setAssetKey((prev) => prev + 1);
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

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrevious();
      else if (e.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, assets.length]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : assets.length - 1));
    resetAssetState();
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < assets.length - 1 ? prev + 1 : 0));
    resetAssetState();
  };

  const resetAssetState = () => {
    setHasError(false);
    setIsZoomed(false);
    setIsLoading(true);
    setAssetKey((prev) => prev + 1);
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
    resetAssetState();
  };

  const currentAsset = assets[currentIndex];

  if (assets.length === 0 && !open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="fixed inset-0! top-0! left-0! z-100 flex h-screen! max-h-screen! w-screen! max-w-none! translate-x-0! translate-y-0! flex-col border-none bg-black/98 p-0 overflow-hidden focus:outline-none data-[state=open]:animate-none data-[state=closed]:animate-none border-0 rounded-none shadow-none transition-none"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Asset Projection Viewer</DialogTitle>

        <AnimatePresence mode="wait">
          {open && (
            <motion.div
              key="viewer-root"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{
                opacity: 0,
                scale: 1.02,
                transition: { duration: 0.3, ease: "easeInOut" },
              }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex h-full flex-col"
            >
              <AssetHeader
                fileName={currentAsset?.fileName}
                fileId={currentAsset?.fileId}
                currentIndex={currentIndex}
                totalAssets={assets.length}
                showThumbnails={showThumbnails}
                onToggleThumbnails={() => setShowThumbnails(!showThumbnails)}
                onClose={() => onOpenChange(false)}
                onDownload={onDownload}
                currentUrl={currentAsset?.url}
              />

              <AssetStage
                asset={currentAsset}
                currentIndex={currentIndex}
                assetKey={assetKey}
                isLoading={isLoading}
                hasError={hasError}
                isZoomed={isZoomed}
                onSetIsLoading={setIsLoading}
                onSetHasError={setHasError}
                onSetIsZoomed={setIsZoomed}
                onResetAssetState={resetAssetState}
                onPrevious={handlePrevious}
                onNext={handleNext}
              />

              <AnimatePresence>
                {showThumbnails && assets.length > 1 && (
                  <AssetThumbnails
                    assets={assets}
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
