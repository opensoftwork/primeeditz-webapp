"use client";

import React, { useMemo, useRef, useState } from "react";
import { ImageSlider } from "@/components/shared/image-viewer/image-slider";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";

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
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null,
  );
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

  const imagesForSlider = useMemo(() => {
    return files
      .filter((f) => f.type.startsWith("image/") && f.url)
      .map((f) => ({
        url: f.url!,
        fileName: f.name,
        fileId: f.id,
      }));
  }, [files]);

  // Handlers
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
