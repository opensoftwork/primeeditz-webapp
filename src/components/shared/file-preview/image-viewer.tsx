"use client";

import { useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import {
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageViewerProps {
  url: string;
  fileName: string;
}

export default function ImageViewer({ url, fileName }: ImageViewerProps) {
  const [rotation, setRotation] = useState(0);

  const rotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const openFullscreen = () => {
    window.open(url, "_blank");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-white/5 bg-black/20 rounded-t-xl">
        <div className="text-xs font-bold text-white/40 uppercase tracking-widest truncate max-w-[200px]">
          {fileName}
        </div>

        <TransformWrapper
          initialScale={1}
          minScale={0.5}
          maxScale={5}
          centerOnInit
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => zoomOut()}
                  className="h-8 w-8 rounded-lg hover:bg-white/10"
                  title="Zoom out"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => zoomIn()}
                  className="h-8 w-8 rounded-lg hover:bg-white/10"
                  title="Zoom in"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => resetTransform()}
                  className="h-8 w-8 rounded-lg hover:bg-white/10"
                  title="Reset zoom"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={rotate}
                  className="h-8 w-8 rounded-lg hover:bg-white/10"
                  title="Rotate"
                >
                  <RotateCw className="h-4 w-4" />
                </Button>

                <div className="w-px h-4 bg-white/10 mx-2" />

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={openFullscreen}
                  className="h-8 w-8 rounded-lg hover:bg-white/10"
                  title="Open in new tab"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="h-8 w-8 rounded-lg hover:bg-white/10"
                >
                  <a href={url} download={fileName} title="Download">
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
              </div>

              {/* Image Display - hidden, actual content below */}
            </>
          )}
        </TransformWrapper>
      </div>

      {/* Image Content with Zoom/Pan */}
      <div className="flex-1 overflow-hidden flex items-center justify-center bg-zinc-800/50 min-h-[400px]">
        <TransformWrapper
          initialScale={1}
          minScale={0.5}
          maxScale={5}
          centerOnInit
          wheel={{ step: 0.1 }}
          pinch={{ step: 5 }}
        >
          <TransformComponent
            wrapperStyle={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            contentStyle={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={fileName}
              className="max-w-full max-h-[500px] object-contain shadow-2xl transition-transform duration-300"
              style={{ transform: `rotate(${rotation}deg)` }}
              draggable={false}
            />
          </TransformComponent>
        </TransformWrapper>
      </div>

      {/* Hint */}
      <div className="p-2 bg-black/20 border-t border-white/5 rounded-b-xl">
        <p className="text-[9px] text-center font-bold uppercase tracking-widest text-white/30">
          Scroll to zoom • Drag to pan • Double-click to reset
        </p>
      </div>
    </div>
  );
}
