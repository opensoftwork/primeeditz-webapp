"use client";

import React, { useMemo, useRef, useState } from "react";
import { AssetSlider } from "@/components/shared/asset-viewer";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { FilePreviewOverlay } from "@/components/shared/file-preview/file-preview-overlay";

// Types
export type { FileTypeCounts, VaultFile, VaultTabType } from "./types";

import { VaultEmptyState } from "./components/vault-empty-state";
import { VaultFileItem } from "./components/vault-file-item";
import { VaultFooter } from "./components/vault-footer";
// Components
import { VaultHeader } from "./components/vault-header";
import type { VaultFile, VaultTabType } from "./types";
// Utils
import {
  calculateFileTypeCounts,
  filterFilesByTab,
  getAcceptTypesForTab,
} from "./utils";

interface FilesVaultDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  subtitle?: string;
  files: VaultFile[];
  onRemoveFile?: (fileId: string) => void;
  onDownload?: (file: VaultFile) => void;
  onImageClick?: (fileId: string) => void;
  onAddFiles?: (files: File[]) => void;
  primaryColor?: string;
  initialTab?: VaultTabType;
}

export function FilesVaultDrawer({
  open,
  onOpenChange,
  title = "Project Files",
  subtitle,
  files,
  onRemoveFile,
  onDownload,
  onImageClick,
  onAddFiles,
  primaryColor = "primary",
  initialTab = "all",
}: FilesVaultDrawerProps) {
  const [activeTab, setActiveTab] = useState<VaultTabType>(initialTab);
  const [selectedAssetIndex, setSelectedAssetIndex] = useState<number | null>(
    null,
  );
  const [previewFile, setPreviewFile] = useState<VaultFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset tab when drawer opens with a specific tab
  React.useEffect(() => {
    if (open) {
      setActiveTab(initialTab);
    }
  }, [open, initialTab]);

  // Memoized calculations
  const fileTypeCounts = useMemo(() => calculateFileTypeCounts(files), [files]);
  const totalSize = useMemo(
    () => files.reduce((sum, f) => sum + (f.size || 0), 0),
    [files],
  );
  const filteredFiles = useMemo(
    () => filterFilesByTab(files, activeTab),
    [files, activeTab],
  );

  const assetsForSlider = useMemo(() => {
    return files
      .filter((f) => (f.type.startsWith("image/") || f.type.startsWith("video/") || f.type.startsWith("audio/") || f.type.includes("pdf")) && f.url)
      .map((f) => ({
        url: f.url!,
        fileName: f.name,
        fileId: f.id,
        mimeType: f.type,
      }));
  }, [files]);

  // Handlers
  const handleInternalImageClick = (fileId: string) => {
    if (onImageClick) {
      onImageClick(fileId);
      return;
    }

    const file = files.find((f) => f.id === fileId);
    if (!file || !file.url) return;

    const isSliderType = file.type.startsWith("image/") || 
                        file.type.startsWith("video/") || 
                        file.type.startsWith("audio/") || 
                        file.type.includes("pdf");

    if (isSliderType) {
      const index = assetsForSlider.findIndex((asset) => asset.fileId === fileId);
      if (index !== -1) {
        setSelectedAssetIndex(index);
      }
    } else {
      setPreviewFile(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0 && onAddFiles) {
      onAddFiles(Array.from(selectedFiles));
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => onOpenChange(false);

  return (
    <>
      {/* Hidden file input for uploads */}
      <Input
        ref={fileInputRef}
        type="file"
        multiple
        accept={getAcceptTypesForTab(activeTab)}
        onChange={handleFileSelect}
        className="hidden"
      />

      <Drawer open={open} onOpenChange={onOpenChange} direction="right">
        <DrawerContent className="bg-zinc-950 border-l border-white/10 data-[vaul-drawer-direction=right]:w-full! data-[vaul-drawer-direction=right]:sm:w-1/2! data-[vaul-drawer-direction=right]:max-w-none! overflow-hidden p-0 h-full shadow-[0_0_80px_rgba(0,0,0,0.8)] rounded-l-[2.5rem] focus:outline-none">
          <DrawerTitle className="sr-only">{title}</DrawerTitle>

          <div className="h-full flex flex-col relative">
            {/* Header */}
            <VaultHeader
              title={title}
              subtitle={subtitle}
              filesCount={files.length}
              totalSize={totalSize}
              primaryColor={primaryColor}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              fileTypeCounts={fileTypeCounts}
              showTabs={initialTab === "all"}
              onClose={handleClose}
            />

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
              {filteredFiles.length === 0 ? (
                <VaultEmptyState
                  activeTab={activeTab}
                  onUploadClick={handleUploadClick}
                  hasUploadCapability={!!onAddFiles}
                />
              ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="grid grid-cols-1 gap-4">
                    {filteredFiles.map((file, idx) => (
                      <VaultFileItem
                        key={file.id}
                        file={file}
                        index={idx}
                        onImageClick={handleInternalImageClick}
                        onRemove={onRemoveFile}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <VaultFooter onClose={handleClose} />
          </div>
        </DrawerContent>
      </Drawer>

      {/* Internal Asset Slider (Fallback if no parent handler) */}
      {!onImageClick && (
        <AssetSlider
          assets={assetsForSlider}
          initialIndex={selectedAssetIndex ?? 0}
          open={selectedAssetIndex !== null}
          onOpenChange={(isOpen) => !isOpen && setSelectedAssetIndex(null)}
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

      {/* Internal File Preview Overlay (Fallback if no parent handler) */}
      {!onImageClick && (
        <FilePreviewOverlay
          open={!!previewFile}
          onOpenChange={(isOpen) => !isOpen && setPreviewFile(null)}
          url={previewFile?.url || null}
          fileName={previewFile?.name || ""}
          mimeType={previewFile?.type}
        />
      )}
    </>
  );
}
