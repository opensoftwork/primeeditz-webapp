"use client";

import { useState, useMemo } from "react";
import {
  X,
  FileText,
  Image as ImageIcon,
  File,
  Video,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Eye,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ImageSlider } from "@/components/shared/image-viewer/image-slider";
import {
  useReferenceFilesStore,
  useFileTypeCounts,
  type ClientFile,
} from "@/stores/reference-files-store";

interface UploadedFilesDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRemoveFile: (fileId: string) => void;
}

/**
 * Robustly determine the file type from MIME type or filename
 */
const getFileType = (file: ClientFile): "image" | "video" | "document" => {
  if (file.fileType.startsWith("image/")) return "image";
  if (file.fileType.startsWith("video/")) return "video";
  return "document";
};

/**
 * Returns the appropriate Lucide icon for a file
 */
const getFileIcon = (file: ClientFile) => {
  const type = getFileType(file);
  if (type === "image") return ImageIcon;
  if (type === "video") return Video;
  return File;
};

/**
 * Robustly format file size to prevent NaN and handle missing values
 */
const formatFileSize = (bytes: number | undefined): string => {
  if (bytes === undefined || bytes === null || isNaN(bytes)) return "0 KB";
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  if (isNaN(i) || i < 0) return "0 KB";

  return (
    Math.round((bytes / Math.pow(k, i)) * 100) / 100 +
    " " +
    sizes[Math.min(i, sizes.length - 1)]
  );
};

export function UploadedFilesDrawer({
  open,
  onOpenChange,
  onRemoveFile,
}: UploadedFilesDrawerProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );

  // Use Zustand store directly
  const { files, getTotalSize } = useReferenceFilesStore();
  const fileTypeCounts = useFileTypeCounts();

  const totalFiles = files.length;
  const totalSize = getTotalSize();
  const hasFiles = totalFiles > 0;

  // Filter images for the slider
  const imagesForSlider = useMemo(() => {
    return files
      .map((file, index) => ({ file, index }))
      .filter(({ file }) => getFileType(file) === "image" && file.previewUrl)
      .map(({ file, index }) => ({
        url: file.previewUrl!,
        fileName: file.fileName,
        fileId: file.id,
        originalIndex: index,
      }));
  }, [files]);

  const handleImageClick = (originalIndex: number) => {
    const sliderIndex = imagesForSlider.findIndex(
      (img) => img.originalIndex === originalIndex
    );
    if (sliderIndex !== -1) {
      setSelectedImageIndex(sliderIndex);
    }
  };

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange} direction="right">
        <DrawerContent className="data-[vaul-drawer-direction=right]:w-1/2! data-[vaul-drawer-direction=right]:max-w-none! border-l border-white/10 bg-[#09090b]/98 backdrop-blur-2xl h-full ml-auto p-0 flex flex-col rounded-l-[2.5rem] overflow-hidden focus:outline-none shadow-2xl shadow-black/50">
          <DrawerTitle className="sr-only">Reference Vault Assets</DrawerTitle>

          {/* Dashboard Premium Header */}
          <div className="shrink-0 px-12 py-12 border-b border-white/5 relative overflow-hidden bg-white/2">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 blur-[120px] rounded-full -mr-40 -mt-40 animate-pulse duration-5000" />
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-size-[32px_32px]" />

            <div className="relative">
              <div className="flex items-center gap-4 mb-3">
                <div className="h-0.5 w-12 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">
                  Client-Side Storage
                </span>
              </div>
              <h2 className="text-4xl font-black uppercase tracking-tighter text-white mb-2">
                Project Files
              </h2>
              <p className="text-sm font-semibold text-white/40 max-w-sm leading-relaxed">
                Managing {totalFiles} reference asset
                {totalFiles !== 1 ? "s" : ""} • {formatFileSize(totalSize)}
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-12 space-y-12">
            {!hasFiles ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-8 py-24">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full scale-150" />
                  <div className="relative p-10 rounded-full bg-white/5 border border-white/5 backdrop-blur-sm">
                    <FileText className="h-14 w-14 text-white/20" />
                  </div>
                </div>
                <div className="space-y-3 px-12">
                  <p className="text-sm font-black uppercase tracking-[0.3em] text-white/40">
                    No Files Added
                  </p>
                  <p className="text-xs font-bold text-white/20 uppercase tracking-widest leading-loose">
                    Upload reference files to populate this list.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Summary Section */}
                <div className="space-y-6">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-primary/80 flex items-center gap-3">
                    <div className="w-1 h-1 rounded-full bg-primary" />
                    Storage Overview
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="p-8 rounded-3xl bg-white/2 border border-white/5 space-y-4 hover:bg-white/4 transition-all duration-500 group group/card">
                      <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">
                        Total Files
                      </p>
                      <div className="flex items-baseline gap-3">
                        <span className="text-4xl font-black text-white group-hover/card:text-primary transition-colors">
                          {totalFiles}
                        </span>
                        <span className="text-[11px] font-bold text-white/20 uppercase tracking-[0.3em]">
                          Artifacts
                        </span>
                      </div>
                    </div>
                    <div className="p-8 rounded-3xl bg-white/2 border border-white/5 space-y-4 hover:bg-white/4 transition-all duration-500 group group/card">
                      <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">
                        Total Size
                      </p>
                      <div className="flex items-baseline gap-3">
                        <span className="text-4xl font-black text-white group-hover/card:text-primary transition-colors">
                          {formatFileSize(totalSize).split(" ")[0]}
                        </span>
                        <span className="text-[11px] font-bold text-white/20 uppercase tracking-[0.3em]">
                          {formatFileSize(totalSize).split(" ")[1]}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    {fileTypeCounts.image > 0 && (
                      <Badge
                        variant="secondary"
                        className="bg-primary/5 hover:bg-primary/10 text-primary border-primary/20 text-[10px] py-2 px-5 font-black uppercase tracking-widest rounded-xl transition-all"
                      >
                        {fileTypeCounts.image} IMAGES
                      </Badge>
                    )}
                    {fileTypeCounts.video > 0 && (
                      <Badge
                        variant="secondary"
                        className="bg-blue-500/5 hover:bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px] py-2 px-5 font-black uppercase tracking-widest rounded-xl transition-all"
                      >
                        {fileTypeCounts.video} VIDEOS
                      </Badge>
                    )}
                    {fileTypeCounts.document > 0 && (
                      <Badge
                        variant="secondary"
                        className="bg-purple-500/5 hover:bg-purple-500/10 text-purple-400 border-purple-500/20 text-[10px] py-2 px-5 font-black uppercase tracking-widest rounded-xl transition-all"
                      >
                        {fileTypeCounts.document} DOCUMENTS
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Files List */}
                <div className="space-y-6">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/20 flex items-center gap-3">
                    <div className="w-1 h-1 rounded-full bg-white/20" />
                    Stored Assets ({totalFiles})
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {files.map((file, fileIndex) => {
                      const FileIcon = getFileIcon(file);
                      const isImage =
                        getFileType(file) === "image" && file.previewUrl;

                      return (
                        <div
                          key={file.id}
                          className="group relative flex items-center justify-between p-5 rounded-[1.8rem] bg-white/1 border border-white/5 hover:bg-white/3 hover:border-primary/40 transition-all duration-500 hover:scale-[1.01] hover:shadow-2xl hover:shadow-primary/5"
                        >
                          <div className="flex items-center gap-6 flex-1 min-w-0">
                            {isImage ? (
                              <div
                                className="shrink-0 w-24 h-24 rounded-2xl border border-white/10 overflow-hidden bg-black/40 cursor-pointer hover:border-primary/50 transition-all group-hover:scale-105 shadow-xl shadow-black/40 relative"
                                onClick={() => handleImageClick(fileIndex)}
                              >
                                <Image
                                  src={file.previewUrl!}
                                  alt={file.fileName}
                                  fill
                                  unoptimized
                                  className="object-cover group-hover:scale-110 transition-all duration-700"
                                />
                              </div>
                            ) : (
                              <div className="shrink-0 w-24 h-24 rounded-2xl bg-white/2 border border-white/5 flex items-center justify-center group-hover:bg-primary/5 transition-all group-hover:scale-105 shadow-lg">
                                <FileIcon className="h-10 w-10 text-white/20 group-hover:text-primary transition-all duration-500" />
                              </div>
                            )}
                            <div className="min-w-0 pr-4">
                              <div className="flex items-center gap-3 mb-2">
                                <p className="text-lg font-black truncate tracking-tight text-white group-hover:text-primary transition-colors">
                                  {file.fileName}
                                </p>
                                <CheckCircle2 className="h-4 w-4 text-green-500/60" />
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] bg-white/5 px-2.5 py-1 rounded-lg">
                                  {formatFileSize(file.fileSize)}
                                </span>
                                <span className="text-[9px] font-bold text-white/10 uppercase tracking-widest">
                                  {file.fileType.split("/")[1]?.toUpperCase() ||
                                    "FILE"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 pr-4">
                            {isImage ? (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-11 px-6 rounded-xl border-white/10 hover:border-primary/40 hover:bg-primary/10 hover:text-primary transition-all font-black uppercase tracking-widest text-[11px] gap-2 hidden sm:flex"
                                onClick={() => handleImageClick(fileIndex)}
                              >
                                <Eye className="h-4 w-4" />
                                View
                              </Button>
                            ) : null}

                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-11 w-11 rounded-xl opacity-0 group-hover:opacity-100 bg-white/5 hover:bg-destructive/10 hover:text-destructive transition-all duration-300"
                              onClick={() => onRemoveFile(file.id)}
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="shrink-0 p-12 border-t border-white/5 bg-white/1 relative">
            <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-primary/20 to-transparent" />
            <Button
              className="w-full h-18 rounded-[1.5rem] font-black uppercase tracking-[0.3em] shadow-xl shadow-primary/10 hover:shadow-primary/30 transition-all border border-primary/20 hover:border-primary/40 text-[11px] group"
              onClick={() => onOpenChange(false)}
            >
              Close List
              <X className="ml-3 h-4 w-4 opacity-40 group-hover:opacity-100 group-hover:rotate-90 transition-all duration-500" />
            </Button>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Projection Slider Integration */}
      <ImageSlider
        images={imagesForSlider.map((img) => ({
          url: img.url,
          fileName: img.fileName,
          fileId: img.fileId,
        }))}
        initialIndex={selectedImageIndex ?? 0}
        open={selectedImageIndex !== null && imagesForSlider.length > 0}
        onOpenChange={(isOpen) => {
          if (!isOpen) setSelectedImageIndex(null);
        }}
      />
    </>
  );
}
