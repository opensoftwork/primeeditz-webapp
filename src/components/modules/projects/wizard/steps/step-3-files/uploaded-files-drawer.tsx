"use client";

import React, { useCallback, useMemo } from "react";
import { toast } from "sonner";
import {
  FilesVaultDrawer,
  type VaultFile,
} from "@/components/shared/files-vault/drawer";
import { useReferenceFilesStore } from "@/stores/reference-files-store";

interface UploadedFilesDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRemoveFile: (fileId: string) => void;
  initialTab?: "all" | "image" | "video" | "audio" | "document";
}

/**
 * Adapter component that connects the Wizard's Zustand store
 * to the shared FilesVaultDrawer.
 */
export function UploadedFilesDrawer({
  open,
  onOpenChange,
  onRemoveFile,
  initialTab,
}: UploadedFilesDrawerProps) {
  const { files, isProcessing, addFiles } = useReferenceFilesStore();

  // Map Zustand files to Vault normalized format
  const vaultFiles: VaultFile[] = useMemo(() => {
    return files.map((f) => ({
      id: f.id,
      name: f.fileName,
      size: f.fileSize,
      type: f.fileType,
      url: f.previewUrl || undefined,
      isLoading: isProcessing,
    }));
  }, [files, isProcessing]);

  // Handle adding files from the vault empty state
  const handleAddFiles = useCallback(
    (newFiles: File[]) => {
      const result = addFiles(newFiles);
      if (result.added > 0) {
        toast.success(
          `${result.added} asset${
            result.added !== 1 ? "s" : ""
          } successfully engaged`,
          {
            description: "Stored in local cache for final transmission.",
            duration: 2500,
          },
        );
      } else if (result.error) {
        toast.error(result.error, { duration: 4000 });
      }
    },
    [addFiles],
  );

  return (
    <FilesVaultDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Project Assets"
      subtitle={`Local Session • ${files.length} items staged`}
      files={vaultFiles}
      onRemoveFile={onRemoveFile}
      onAddFiles={handleAddFiles}
      initialTab={initialTab}
    />
  );
}
