"use client";

import { api } from "@convex/_generated/api";
import { useAction } from "convex/react";
import {
  ArrowRight,
  ExternalLink,
  Eye,
  FileText,
  LayoutGrid,
  Loader2,
} from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import {
  FilesVaultDrawer,
  type VaultFile,
} from "@/components/shared/files-vault/drawer";
import { AssetSlider } from "@/components/shared/asset-viewer";
import { Button } from "@/components/ui/button";
import { DetailSection } from "./shared";
import { FilePreviewOverlay } from "@/components/shared/file-preview/file-preview-overlay";

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
    {},
  );
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedAssetIndex, setSelectedAssetIndex] = useState<number | null>(
    null,
  );
  const [previewFile, setPreviewFile] = useState<VaultFile | null>(null);

  // Action to get signed URLs
  const getSignedUrls = useAction(
    api.functions.storage.actions.getSignedFileUrls,
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
  const assetsForSlider = useMemo(() => {
    return files
      .filter((f) => f.fileType.startsWith("image/") || f.fileType.startsWith("video/") || f.fileType === "application/pdf")
      .map((file) => ({
        url:
          (file.storageKey ? signedUrls[file.storageKey] : file.previewUrl) ||
          "",
        fileName: file.fileName,
        fileId: file.fileId,
        mimeType: file.fileType,
      }))
      .filter((asset) => asset.url !== "");
  }, [files, signedUrls]);

  const handleFileClick = (fileId: string) => {
    const file = vaultFiles.find((f) => f.id === fileId);
    if (!file || !file.url) {
      setIsDrawerOpen(true);
      return;
    }

    const isSliderType = file.type.startsWith("image/") || 
                        file.type.startsWith("video/") || 
                        file.type === "application/pdf";

    if (isSliderType) {
      const index = assetsForSlider.findIndex((asset) => asset.fileId === fileId);
      if (index !== -1) {
        setSelectedAssetIndex(index);
      }
    } else {
      setPreviewFile(file);
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
  const displayFiles = files.slice(0, 5);
  const remainingCount = files.length - 5;

  return (
    <DetailSection
      title="Reference Materials"
      icon={<FileText className="h-5 w-5" />}
    >
      {hasFiles ? (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30">
              {files.length} files provided by client
            </p>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-white/10 hover:bg-primary/10 hover:text-primary hover:border-primary/20 font-black uppercase tracking-widest text-[10px] h-10 px-5 gap-2"
              onClick={() => setIsDrawerOpen(true)}
            >
              OPEN VAULT <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
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
                  className="group relative aspect-square rounded-xl bg-white/5 border border-white/5 overflow-hidden transition-all duration-500 cursor-pointer shadow-sm hover:shadow-indigo-500/10"
                  onClick={() => handleFileClick(file.fileId)}
                >
                  {isLoadingUrl ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-4 w-4 animate-spin text-white/20" />
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
                    <div className="flex flex-col items-center justify-center h-full gap-2.5 text-white/20">
                      <FileText className="h-8 w-8" />
                      <span className="text-[9px] font-black uppercase tracking-[0.2em]">
                        {file.fileType?.split("/")[1]?.toUpperCase() || "FILE"}
                      </span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <ExternalLink className="h-4 w-4 text-white" />
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
                className="group relative aspect-square rounded-xl bg-white/5 border border-dashed border-white/10 flex flex-col items-center justify-center gap-1 transition-all duration-500 hover:bg-white/10"
              >
                <span className="text-sm font-black text-white">
                  +{remainingCount}
                </span>
                <span className="text-[7px] font-black uppercase tracking-widest text-white/30">
                  More
                </span>
              </motion.button>
            )}
          </div>
        </div>
      ) : (
        <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-4xl bg-white/1">
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
        onImageClick={handleFileClick}
        onDownload={(file) => {
          if (file.url) {
            const link = document.createElement("a");
            link.href = file.url;
            link.download = file.name;
            link.click();
          }
        }}
      />

      {/* Unified Asset Projection Slider */}
      <AssetSlider
        assets={assetsForSlider}
        initialIndex={selectedAssetIndex ?? 0}
        open={selectedAssetIndex !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedAssetIndex(null);
        }}
        onDownload={(fileId, fileName, url) => {
          const link = document.createElement("a");
          link.href = url;
          link.download = fileName;
          link.click();
        }}
      />

      {/* Universal File Projection Slider */}
      <FilePreviewOverlay
        open={!!previewFile}
        onOpenChange={(open) => !open && setPreviewFile(null)}
        url={previewFile?.url || null}
        fileName={previewFile?.name || ""}
        mimeType={previewFile?.type}
      />
    </DetailSection>
  );
}
