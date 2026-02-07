"use client";

import { ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ViewerAsset } from "./asset-slider";
import dynamic from "next/dynamic";
import { AudioVisualizer } from "./audio-visualizer";

// Dynamically import PDF viewer for performance
const PDFViewer = dynamic(() => import("../file-preview/pdf-viewer"), {
  loading: () => (
    <div className="flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-10 h-10 text-primary animate-spin" />
      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
        Initializing PDF Engine
      </span>
    </div>
  ),
  ssr: false,
});

interface AssetStageProps {
  asset: ViewerAsset;
  currentIndex: number;
  assetKey: number;
  isLoading: boolean;
  hasError: boolean;
  isZoomed: boolean;
  onSetIsLoading: (loading: boolean) => void;
  onSetHasError: (error: boolean) => void;
  onSetIsZoomed: (zoomed: boolean) => void;
  onResetAssetState: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

export function AssetStage({
  asset,
  currentIndex,
  assetKey,
  isLoading,
  hasError,
  isZoomed,
  onSetIsLoading,
  onSetHasError,
  onSetIsZoomed,
  onResetAssetState,
  onPrevious,
  onNext,
}: AssetStageProps) {
  const isVideo =
    asset?.mimeType?.startsWith("video/") || asset?.type === "video";
  const isAudio =
    asset?.mimeType?.startsWith("audio/") || asset?.type === "audio";
  const isPDF = asset?.mimeType === "application/pdf" || asset?.type === "pdf";

  return (
    <div className="flex-1 flex items-center justify-center p-4 md:p-12 relative overflow-hidden">
      {/* Background Texture/Ambient Light (mainly for images/videos) */}
      {!isPDF && (
        <div className="absolute inset-x-0 inset-y-0 z-0 overflow-hidden pointer-events-none">
          <div
            className="absolute inset-0 opacity-15 blur-[60px] scale-150 transition-all duration-1000"
            style={{
              backgroundImage: `url(${asset?.url})`,
              backgroundPosition: "center",
              backgroundSize: "cover",
              willChange: "background-image",
            }}
          />
          <div className="absolute inset-0 bg-black/80" />
        </div>
      )}

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

      {/* Central Content Wrapper */}
      <motion.div
        key={`${currentIndex}-${assetKey}`}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full h-full flex items-center justify-center"
      >
        {isLoading && !isPDF && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-20">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
              Loading Artifact
            </span>
          </div>
        )}

        {hasError ? (
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
                onResetAssetState();
              }}
            >
              Retry Scan
            </Button>
          </div>
        ) : (
          <div
            className={cn(
              "relative w-full h-full transition-all duration-700 select-none flex items-center justify-center",
              !isPDF &&
                (isLoading
                  ? "opacity-0 translate-y-8"
                  : "opacity-100 translate-y-0"),
              !isPDF &&
                !isVideo &&
                (isZoomed ? "cursor-default scale-150" : "cursor-default"),
            )}
            onClick={() =>
              !isVideo && !isAudio && !isPDF && onSetIsZoomed(!isZoomed)
            }
          >
            {isAudio ? (
              <AudioVisualizer
                src={asset.url}
                onLoadedData={() => onSetIsLoading(false)}
                onError={() => {
                  onSetHasError(true);
                  onSetIsLoading(false);
                }}
              />
            ) : isVideo ? (
              <video
                src={asset.url}
                controls
                controlsList="nodownload"
                autoPlay
                className="max-w-full max-h-full rounded-2xl shadow-2xl z-10"
                onLoadedData={() => onSetIsLoading(false)}
                onError={() => {
                  onSetHasError(true);
                  onSetIsLoading(false);
                }}
              />
            ) : isPDF ? (
              <div className="w-full h-full max-w-5xl bg-zinc-900/50 rounded-2xl overflow-hidden shadow-2xl border border-white/5">
                <PDFViewer
                  url={asset.url}
                  fileName={asset.fileName}
                  hideDownload
                />
              </div>
            ) : (
              <Image
                src={asset.url}
                alt={asset.fileName || "Projection Viewer"}
                fill
                unoptimized
                priority
                className="object-contain shadow-[0_0_100px_rgba(0,0,0,0.5)] rounded-2xl"
                onLoad={() => onSetIsLoading(false)}
                onError={() => {
                  onSetHasError(true);
                  onSetIsLoading(false);
                }}
              />
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
