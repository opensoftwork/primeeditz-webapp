"use client";

import { useState, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Set up the PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  url: string;
  fileName: string;
  hideDownload?: boolean;
}

export default function PDFViewer({
  url,
  fileName,
  hideDownload = false,
}: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const onDocumentLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }) => {
      setNumPages(numPages);
      setIsLoading(false);
    },
    [],
  );

  const onDocumentLoadError = useCallback((err: Error) => {
    console.error("PDF load error:", err);
    setError("Failed to load PDF. Try downloading instead.");
    setIsLoading(false);
  }, []);

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages || 1));
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 3.0));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  };

  const openFullscreen = () => {
    // Open PDF in new tab for fullscreen/printing
    window.open(url, "_blank");
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 h-full min-h-[400px]">
        <div className="text-center">
          <p className="text-sm font-bold text-red-400">{error}</p>
        </div>
        <Button
          variant="outline"
          asChild
          className="rounded-xl border-white/10 hover:bg-white/5 gap-2"
        >
          <a href={url} download={fileName}>
            <Download className="h-4 w-4" /> Download PDF
          </a>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-white/5 bg-black/20 rounded-t-xl">
        <div className="flex items-center gap-2">
          {/* Page Navigation */}
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            className="h-8 w-8 rounded-lg hover:bg-white/10"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs font-bold text-white/60 tabular-nums min-w-[80px] text-center">
            {pageNumber} / {numPages || "..."}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNextPage}
            disabled={pageNumber >= (numPages || 1)}
            className="h-8 w-8 rounded-lg hover:bg-white/10"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <Button
            variant="ghost"
            size="icon"
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className="h-8 w-8 rounded-lg hover:bg-white/10"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs font-bold text-white/60 tabular-nums min-w-[50px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={zoomIn}
            disabled={scale >= 3.0}
            className="h-8 w-8 rounded-lg hover:bg-white/10"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>

          <div className="w-px h-4 bg-white/10 mx-2" />

          {/* Actions */}
          <Button
            variant="ghost"
            size="icon"
            onClick={openFullscreen}
            className="h-8 w-8 rounded-lg hover:bg-white/10"
            title="Open in new tab (for screenshot/print)"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          {!hideDownload && (
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="h-8 w-8 rounded-lg hover:bg-white/10"
            >
              <a href={url} download={fileName} title="Download PDF">
                <Download className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* PDF Content */}
      <div
        className={cn(
          "flex-1 overflow-auto flex items-start justify-center p-4 bg-zinc-800/50",
          "custom-scrollbar",
        )}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
          </div>
        )}
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={null}
          className="shadow-2xl"
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="shadow-lg"
          />
        </Document>
      </div>

      {/* Hint */}
      <div className="p-2 bg-black/20 border-t border-white/5 rounded-b-xl">
        <p className="text-[9px] text-center font-bold uppercase tracking-widest text-white/30">
          Tip: Click fullscreen icon to open in new tab for screenshots
        </p>
      </div>
    </div>
  );
}
