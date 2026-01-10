"use client";

import React, { useMemo } from "react";
import {
  FilesVaultDrawer,
  VaultFile,
} from "@/components/shared/files-vault/drawer";
import { useReferenceFilesStore } from "@/stores/reference-files-store";

interface UploadedFilesDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRemoveFile: (fileId: string) => void;
}

/**
 * Adapter component that connects the Wizard's Zustand store
 * to the shared FilesVaultDrawer.
 */
export function UploadedFilesDrawer({
  open,
  onOpenChange,
  onRemoveFile,
}: UploadedFilesDrawerProps) {
  const { files, isProcessing } = useReferenceFilesStore();

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

  return (
    <FilesVaultDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Project Assets"
      subtitle={`Local Session • ${files.length} items staged`}
      files={vaultFiles}
      onRemoveFile={onRemoveFile}
    />
  );
}
