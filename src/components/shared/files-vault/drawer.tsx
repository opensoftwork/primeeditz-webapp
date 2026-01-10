"use client";

import React, { useMemo, useState } from "react";
import {
  X,
  FileText,
  Image as ImageIcon,
  Video,
  Eye,
  Trash2,
  File,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { ImageSlider } from "@/components/shared/image-viewer/image-slider";

/**
 * Normalized file interface for the shared vault
 */
export interface VaultFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  isLoading?: boolean;
}

interface FilesVaultDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  subtitle?: string;
  files: VaultFile[];
  onRemoveFile?: (fileId: string) => void;
  onDownload?: (file: VaultFile) => void;
  onImageClick?: (fileId: string) => void;
  primaryColor?: string;
}

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

const getFileTypeIcon = (type: string) => {
  if (type.startsWith("image/")) return ImageIcon;
  if (type.startsWith("video/")) return Video;
  return File;
};

export function FilesVaultDrawer({
  open,
  onOpenChange,
  title = "Project Files",
  subtitle,
  files,
  onRemoveFile,
  onDownload,
  onImageClick,
  primaryColor = "primary",
}: FilesVaultDrawerProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );

  const fileTypeCounts = useMemo(() => {
    return files.reduce(
      (acc, file) => {
        if (file.type.startsWith("image/")) acc.image++;
        else if (file.type.startsWith("video/")) acc.video++;
        else acc.document++;
        return acc;
      },
      { image: 0, video: 0, document: 0 }
    );
  }, [files]);

  const totalSize = files.reduce((sum, f) => sum + (f.size || 0), 0);

  const imagesForSlider = useMemo(() => {
    return files
      .filter((f) => f.type.startsWith("image/") && f.url)
      .map((f) => ({
        url: f.url!,
        fileName: f.name,
        fileId: f.id,
      }));
  }, [files]);

  const handleInternalImageClick = (fileId: string) => {
    if (onImageClick) {
      onImageClick(fileId);
      return;
    }
    const index = imagesForSlider.findIndex((img) => img.fileId === fileId);
    if (index !== -1) {
      setSelectedImageIndex(index);
    }
  };

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange} direction="right">
        <DrawerContent className="bg-zinc-950 border-l border-white/10 data-[vaul-drawer-direction=right]:w-full! data-[vaul-drawer-direction=right]:sm:w-1/2! data-[vaul-drawer-direction=right]:max-w-none! overflow-hidden p-0 h-full shadow-[0_0_80px_rgba(0,0,0,0.8)] rounded-l-[2.5rem] focus:outline-none">
          <DrawerTitle className="sr-only">{title}</DrawerTitle>
          <div className="h-full flex flex-col relative">
            {/* Header - Premium Dashboard Style */}
            <div className="shrink-0 px-10 py-12 border-b border-white/5 relative overflow-hidden bg-white/2">
              <div
                className={cn(
                  "absolute top-0 right-0 w-80 h-80 blur-[120px] rounded-full -mr-40 -mt-40 animate-pulse duration-5000",
                  `bg-${primaryColor}/10`
                )}
              />
              <div className="absolute inset-0 bg-grid-white/[0.02] bg-size-[32px_32px]" />

              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={cn(
                          "h-0.5 w-12 rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]",
                          `bg-${primaryColor}`
                        )}
                      />
                      <span
                        className={cn(
                          "text-[10px] font-black uppercase tracking-[0.4em]",
                          `text-${primaryColor}/60`
                        )}
                      >
                        Vault Protocol
                      </span>
                    </div>
                    <h2 className="text-4xl font-black uppercase tracking-tighter text-white mb-2 leading-none">
                      {title}
                    </h2>
                  </motion.div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-white/5 text-white/20 h-10 w-10 mt-[-20px] hover:text-white transition-all"
                    onClick={() => onOpenChange(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <p className="text-sm font-semibold text-white/40 max-w-sm leading-relaxed">
                  {subtitle ||
                    `Managing ${files.length} production asset${
                      files.length !== 1 ? "s" : ""
                    } • ${formatFileSize(totalSize)}`}
                </p>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-12">
              {files.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-8 py-24">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full scale-150" />
                    <div className="relative p-10 rounded-full bg-white/5 border border-white/5 backdrop-blur-sm">
                      <FileText className="h-14 w-14 text-white/20" />
                    </div>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
                    Empty Vault
                  </p>
                </div>
              ) : (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="grid grid-cols-1 gap-4">
                    {files.map((file, idx) => {
                      const FileIcon = getFileTypeIcon(file.type);
                      const isImage = file.type.startsWith("image/");

                      return (
                        <motion.div
                          key={file.id}
                          initial={{ opacity: 0, x: -15 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05, duration: 0.5 }}
                          className="group relative flex items-center justify-between p-5 rounded-[1.8rem] bg-white/1 border border-white/5 hover:bg-white/3 hover:border-primary/40 transition-all duration-500 hover:scale-[1.01] hover:shadow-2xl hover:shadow-primary/5"
                        >
                          <div className="flex items-center gap-6 flex-1 min-w-0">
                            <div
                              className="shrink-0 w-24 h-24 rounded-2xl border border-white/10 overflow-hidden bg-black/40 cursor-pointer transition-all hover:scale-105 shadow-xl shadow-black/40 relative"
                              onClick={() => handleInternalImageClick(file.id)}
                            >
                              {file.isLoading ? (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Loader2 className="h-6 w-6 animate-spin text-white/10" />
                                </div>
                              ) : isImage && file.url ? (
                                <Image
                                  src={file.url}
                                  alt={file.name}
                                  fill
                                  unoptimized
                                  className="object-cover group-hover:scale-110 transition-all duration-700"
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full group-hover:bg-primary/5 transition-all">
                                  <FileIcon className="h-10 w-10 text-white/20 group-hover:text-primary transition-all duration-500" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 pr-4">
                              <p className="text-xl font-black truncate tracking-tight text-white group-hover:text-primary transition-colors">
                                {file.name}
                              </p>
                              <div className="flex items-center gap-4 mt-2">
                                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] bg-white/5 px-2.5 py-1 rounded-lg">
                                  {formatFileSize(file.size)}
                                </span>
                                <span className="text-[9px] font-bold text-white/10 uppercase tracking-widest">
                                  {file.type.split("/")[1]?.toUpperCase()}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 pr-4">
                            {file.url && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-11 px-6 rounded-xl border-white/10 hover:border-primary/40 hover:bg-primary/10 hover:text-primary transition-all font-black uppercase tracking-widest text-[11px] gap-2 hidden sm:flex"
                                onClick={() =>
                                  handleInternalImageClick(file.id)
                                }
                              >
                                <Eye className="h-4 w-4" />
                                VIEW
                              </Button>
                            )}
                            {onRemoveFile && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-11 w-11 rounded-xl opacity-0 group-hover:opacity-100 bg-white/5 hover:bg-destructive/10 hover:text-destructive transition-all duration-300"
                                onClick={() => onRemoveFile(file.id)}
                              >
                                <Trash2 className="h-5 w-5" />
                              </Button>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="shrink-0 p-10 border-t border-white/5 bg-white/1 relative">
              <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-primary/20 to-transparent" />
              <Button
                variant="outline"
                className="w-full h-16 rounded-[1.2rem] border-white/10 hover:border-white/20 hover:bg-white/5 font-black uppercase tracking-[0.3em] text-[10px] text-white/40 hover:text-white transition-all"
                onClick={() => onOpenChange(false)}
              >
                DISMISS VAULT
                <X className="ml-3 h-4 w-4 opacity-40 group-hover:opacity-100 transition-all duration-500" />
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Internal Image Slider (Fallback if no parent handler) */}
      {!onImageClick && (
        <ImageSlider
          images={imagesForSlider}
          initialIndex={selectedImageIndex ?? 0}
          open={selectedImageIndex !== null}
          onOpenChange={(isOpen) => !isOpen && setSelectedImageIndex(null)}
          onDownload={(fileId, fileName, url) => {
            if (onDownload) {
              onDownload({
                id: fileId,
                name: fileName,
                size: 0,
                type: "image/jpeg",
                url,
              });
            } else {
              const link = document.createElement("a");
              link.href = url;
              link.download = fileName;
              link.click();
            }
          }}
        />
      )}
    </>
  );
}
