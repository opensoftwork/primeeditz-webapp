"use client";

import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { LayoutGrid, FileText, Eye, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { useAction } from "convex/react";
import { api } from "@convex/_generated/api";
import { DetailSection } from "./shared";
import {
  FilesVaultDrawer,
  VaultFile,
} from "@/components/shared/files-vault/drawer";
import { ImageSlider } from "@/components/shared/image-viewer/image-slider";

interface ReferenceFile {
  fileId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  storageKey?: string;
  previewUrl?: string;
}

interface ReferenceMaterialsProps {
  files?: ReferenceFile[];
}

export function ReferenceMaterials({ files = [] }: ReferenceMaterialsProps) {
  const [signedUrls, setSignedUrls] = useState<Record<string, string | null>>(
    {}
  );
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );

  // Action to get signed URLs
  const getSignedUrls = useAction(
    api.functions.storage.actions.getSignedFileUrls
  );

  // Extract storage keys
  const storageKeys = useMemo(() => {
    return files.filter((f) => f.storageKey).map((f) => f.storageKey as string);
  }, [files]);

  // Fetch signed URLs
  useEffect(() => {
    if (storageKeys.length === 0) return;

    const fetchUrls = async () => {
      setLoading(true);
      try {
        const urls = await getSignedUrls({ storageKeys });
        setSignedUrls(urls);
      } catch (error) {
        console.error("Failed to fetch signed URLs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUrls();
  }, [storageKeys, getSignedUrls]);

  // Filter images for the slider
  const imagesForSlider = useMemo(() => {
    return files
      .filter((f) => f.fileType.startsWith("image/"))
      .map((file) => ({
        url:
          (file.storageKey ? signedUrls[file.storageKey] : file.previewUrl) ||
          "",
        fileName: file.fileName,
        fileId: file.fileId,
      }))
      .filter((img) => img.url !== "");
  }, [files, signedUrls]);

  const handleImageClick = (fileId: string) => {
    const index = imagesForSlider.findIndex((img) => img.fileId === fileId);
    if (index !== -1) {
      setSelectedImageIndex(index);
    }
  };

  // Map to normalized Vault format for the shared drawer
  const vaultFiles: VaultFile[] = useMemo(() => {
    return files.map((f) => ({
      id: f.fileId,
      name: f.fileName,
      size: f.fileSize,
      type: f.fileType,
      url:
        (f.storageKey ? signedUrls[f.storageKey] : f.previewUrl) || undefined,
      isLoading: loading && !!f.storageKey && !signedUrls[f.storageKey],
    }));
  }, [files, signedUrls, loading]);

  const hasFiles = files.length > 0;
  const displayFiles = files.slice(0, 4);
  const remainingCount = files.length - 4;

  return (
    <DetailSection
      title="Reference Materials"
      icon={<LayoutGrid className="h-4 w-4" />}
    >
      {hasFiles ? (
        <div className="space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {displayFiles.map((file, idx) => {
              const imageUrl = file.storageKey
                ? signedUrls[file.storageKey]
                : file.previewUrl;
              const isImage = file.fileType?.startsWith("image/");
              const isLoadingUrl =
                loading && file.storageKey && !signedUrls[file.storageKey];

              return (
                <motion.div
                  key={file.fileId}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05, duration: 0.3 }}
                  className="group relative aspect-square rounded-2xl bg-white/2 border border-white/5 overflow-hidden transition-all duration-500 hover:border-primary/30 shadow-lg"
                >
                  {isLoadingUrl ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-6 w-6 animate-spin text-white/20" />
                    </div>
                  ) : imageUrl && isImage ? (
                    <Image
                      src={imageUrl}
                      alt={file.fileName}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      unoptimized
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-2 text-white/20">
                      <FileText className="h-8 w-8" />
                      <span className="text-[8px] font-black uppercase tracking-[0.2em]">
                        {file.fileType?.split("/")[1]?.toUpperCase() || "FILE"}
                      </span>
                    </div>
                  )}

                  <div
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4 gap-3 cursor-pointer"
                    onClick={() =>
                      isImage
                        ? handleImageClick(file.fileId)
                        : setIsDrawerOpen(true)
                    }
                  >
                    <p className="text-[9px] font-black text-white text-center line-clamp-2 uppercase tracking-tight leading-relaxed">
                      {file.fileName}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8 rounded-lg border-white/10 bg-white/5 hover:bg-primary hover:text-black transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isImage) handleImageClick(file.fileId);
                          else setIsDrawerOpen(true);
                        }}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {remainingCount > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                onClick={() => setIsDrawerOpen(true)}
                className="group relative aspect-square rounded-2xl bg-white/1 border border-dashed border-white/10 flex flex-col items-center justify-center gap-3 transition-all duration-500 hover:bg-white/3 hover:border-primary/40"
              >
                <div className="p-3 rounded-full bg-white/5 border border-white/5 group-hover:scale-110 transition-transform">
                  <span className="text-xl font-black text-white/40">
                    +{remainingCount}
                  </span>
                </div>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 group-hover:text-primary transition-colors">
                  View All Assets
                </span>
              </motion.button>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDrawerOpen(true)}
              className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 hover:text-primary transition-all gap-3"
            >
              Enter Production Vault
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-[2rem] bg-white/1">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
            No assets tagged in this production
          </p>
        </div>
      )}

      {/* Shared Vault Drawer Integration */}
      <FilesVaultDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        title="Production Vault"
        subtitle={`Reference Materials • ${files.length} items`}
        files={vaultFiles}
        onImageClick={handleImageClick}
        onDownload={(file) => {
          if (file.url) {
            const link = document.createElement("a");
            link.href = file.url;
            link.download = file.name;
            link.click();
          }
        }}
      />

      {/* Unified Image Projection Slider */}
      <ImageSlider
        images={imagesForSlider}
        initialIndex={selectedImageIndex ?? 0}
        open={selectedImageIndex !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedImageIndex(null);
        }}
        onDownload={(fileId, fileName, url) => {
          const link = document.createElement("a");
          link.href = url;
          link.download = fileName;
          link.click();
        }}
      />
    </DetailSection>
  );
}
