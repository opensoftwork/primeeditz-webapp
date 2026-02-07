/**
 * Files Vault - Shared Types
 */

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

export type VaultTabType = "all" | "image" | "video" | "audio" | "document";

export interface FileTypeCounts {
  image: number;
  video: number;
  audio: number;
  document: number;
}
