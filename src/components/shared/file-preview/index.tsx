"use client";

import dynamic from "next/dynamic";
import { Download, FileText, Music, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// Dynamically import heavy components to reduce initial bundle size
const PDFViewer = dynamic(() => import("./pdf-viewer"), {
  loading: () => <PreviewSkeleton />,
  ssr: false,
});

const ImageViewer = dynamic(() => import("./image-viewer"), {
  loading: () => <PreviewSkeleton />,
  ssr: false,
});

export type PreviewType =
  | "pdf"
  | "image"
  | "video"
  | "audio"
  | "other"
  | "unknown";

interface FilePreviewProps {
  url: string | null;
  fileName: string;
  mimeType?: string;
  className?: string;
}

/**
 * Determine preview type based on MIME type
 */
export function getPreviewType(mimeType?: string): PreviewType {
  if (!mimeType) return "unknown";
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  return "other";
}

/**
 * Get file extension icon based on MIME type
 */
function getFileIcon(previewType: PreviewType) {
  switch (previewType) {
    case "video":
      return <Video className="h-10 w-10 text-indigo-400" />;
    case "audio":
      return <Music className="h-10 w-10 text-indigo-400" />;
    default:
      return <FileText className="h-10 w-10 text-indigo-400" />;
  }
}

function PreviewSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 h-full min-h-[400px]">
      <Skeleton className="h-24 w-24 rounded-3xl bg-white/5" />
      <Skeleton className="h-4 w-32 bg-white/5" />
    </div>
  );
}

/**
 * Fallback component for unsupported file types
 */
function FallbackPreview({
  url,
  fileName,
  mimeType,
  previewType,
}: {
  url: string | null;
  fileName: string;
  mimeType?: string;
  previewType: PreviewType;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 h-full min-h-[400px]">
      <div className="h-24 w-24 rounded-3xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.1)]">
        {getFileIcon(previewType)}
      </div>
      <div className="text-center">
        <p className="text-sm font-black text-white uppercase tracking-widest">
          Preview Not Available
        </p>
        <p className="text-[10px] text-white/40 uppercase tracking-wider mt-2">
          {mimeType || "Unknown Type"}
        </p>
      </div>
      {url && (
        <Button
          variant="outline"
          asChild
          className="rounded-xl border-white/10 hover:bg-white/5 gap-2"
        >
          <a href={url} download={fileName}>
            <Download className="h-4 w-4" /> Download File
          </a>
        </Button>
      )}
    </div>
  );
}

/**
 * Video player component with enhanced controls
 */
function VideoPlayer({ url, fileName }: { url: string; fileName: string }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <video
        src={url}
        controls
        controlsList="nodownload"
        className="max-w-full max-h-[500px] rounded-xl shadow-2xl"
        playsInline
        preload="metadata"
      >
        <track kind="captions" srcLang="en" label="English" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}

/**
 * Audio player component
 */
function AudioPlayer({ url, fileName }: { url: string; fileName: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 h-full min-h-[300px]">
      <div className="h-24 w-24 rounded-3xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.1)]">
        <Music className="h-10 w-10 text-indigo-400" />
      </div>
      <p className="text-sm font-bold text-white truncate max-w-[300px]">
        {fileName}
      </p>
      <audio src={url} controls className="w-full max-w-md" preload="metadata">
        Your browser does not support the audio tag.
      </audio>
    </div>
  );
}

/**
 * Universal file preview component that handles different file types
 */
export function FilePreview({
  url,
  fileName,
  mimeType,
  className,
}: FilePreviewProps) {
  const previewType = getPreviewType(mimeType);

  // No URL available
  if (!url) {
    return (
      <FallbackPreview
        url={null}
        fileName={fileName}
        mimeType={mimeType}
        previewType={previewType}
      />
    );
  }

  switch (previewType) {
    case "pdf":
      return <PDFViewer url={url} fileName={fileName} />;

    case "image":
      return <ImageViewer url={url} fileName={fileName} />;

    case "video":
      return <VideoPlayer url={url} fileName={fileName} />;

    case "audio":
      return <AudioPlayer url={url} fileName={fileName} />;

    default:
      return (
        <FallbackPreview
          url={url}
          fileName={fileName}
          mimeType={mimeType}
          previewType={previewType}
        />
      );
  }
}
