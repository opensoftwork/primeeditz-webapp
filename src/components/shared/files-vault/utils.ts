/**
 * Files Vault - Utility Functions
 */

import { File, Image as ImageIcon, Video, Music } from "lucide-react";
import type { FileTypeCounts, VaultFile, VaultTabType } from "./types";

export const formatFileSize = (bytes: number | undefined): string => {
  if (bytes === undefined || bytes === null || isNaN(bytes)) return "0 KB";
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  if (isNaN(i) || i < 0) return "0 KB";
  return (
    Math.round((bytes / k ** i) * 100) / 100 +
    " " +
    sizes[Math.min(i, sizes.length - 1)]
  );
};

export const getFileTypeIcon = (type: string) => {
  if (type.startsWith("image/")) return ImageIcon;
  if (type.startsWith("video/")) return Video;
  if (type.startsWith("audio/")) return Music;
  return File;
};

export const calculateFileTypeCounts = (files: VaultFile[]): FileTypeCounts => {
  return files.reduce(
    (acc, file) => {
      if (file.type.startsWith("image/")) acc.image++;
      else if (file.type.startsWith("video/")) acc.video++;
      else if (file.type.startsWith("audio/")) acc.audio++;
      else acc.document++;
      return acc;
    },
    { image: 0, video: 0, audio: 0, document: 0 },
  );
};

export const filterFilesByTab = (
  files: VaultFile[],
  tab: VaultTabType,
): VaultFile[] => {
  return files.filter((f) => {
    if (tab === "all") return true;
    if (tab === "image") return f.type.startsWith("image/");
    if (tab === "video") return f.type.startsWith("video/");
    if (tab === "audio") return f.type.startsWith("audio/");
    return (
      !f.type.startsWith("image/") &&
      !f.type.startsWith("video/") &&
      !f.type.startsWith("audio/")
    );
  });
};

export const getAcceptTypesForTab = (tab: VaultTabType): string => {
  switch (tab) {
    case "image":
      return "image/*";
    case "video":
      return "video/*";
    case "audio":
      return "audio/*";
    case "document":
      return ".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx";
    default:
      return "*/*";
  }
};

export const getCategoryLabel = (tab: VaultTabType): string => {
  switch (tab) {
    case "image":
      return "Images";
    case "video":
      return "Videos";
    case "audio":
      return "Audio";
    case "document":
      return "Documents";
    default:
      return "Files";
  }
};

export const getCategoryIcon = (tab: VaultTabType) => {
  switch (tab) {
    case "image":
      return ImageIcon;
    case "video":
      return Video;
    case "audio":
      return Music;
    default:
      return File;
  }
};
