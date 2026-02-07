/**
 * Reference Files Store
 *
 * Zustand store for managing reference files on the client side.
 * Files are stored in memory until the user submits the project.
 * No backend requests are made during the upload process.
 */

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export interface ClientFile {
  id: string;
  file: File;
  fileName: string;
  fileSize: number;
  fileType: string;
  storageKey?: string;
  previewUrl: string | null;
  addedAt: number;
}

interface ReferenceFilesState {
  // State
  files: ClientFile[];
  isProcessing: boolean;

  // Actions
  addFiles: (
    newFiles: File[],
    maxFiles?: number,
  ) => { added: number; skipped: number; error?: string };
  updateFile: (id: string, updates: Partial<ClientFile>) => void;
  removeFile: (id: string) => void;
  clearAllFiles: () => void;
  getFileById: (id: string) => ClientFile | undefined;
  getPreviewableImages: () => ClientFile[];
  getTotalSize: () => number;

  // For form submission - returns File objects for actual upload
  getFilesForUpload: () => File[];
}

/**
 * Generate a unique ID for each file
 */
const generateFileId = (): string => {
  return `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Create a preview URL for previewable files
 */
const createPreviewUrl = (file: File): string | null => {
  const previewableTypes = [
    "image/",
    "video/",
    "audio/",
    "application/pdf"
  ];

  if (previewableTypes.some(type => file.type.startsWith(type))) {
    return URL.createObjectURL(file);
  }
  return null;
};

/**
 * Check if two files are duplicates based on name, size, and type
 */
const isDuplicate = (existingFiles: ClientFile[], newFile: File): boolean => {
  return existingFiles.some(
    (f) =>
      f.fileName === newFile.name &&
      f.fileSize === newFile.size &&
      f.fileType === newFile.type,
  );
};

export const useReferenceFilesStore = create<ReferenceFilesState>()(
  devtools(
    (set, get) => ({
      // Initial state
      files: [],
      isProcessing: false,

      // Add files to the store
      addFiles: (newFiles: File[], maxFiles = 50) => {
        const state = get();
        let added = 0;
        let skipped = 0;
        let error: string | undefined;

        // Check max files limit
        if (state.files.length + newFiles.length > maxFiles) {
          error = `Maximum ${maxFiles} files allowed. Currently have ${state.files.length}.`;
          return { added: 0, skipped: newFiles.length, error };
        }

        set({ isProcessing: true });

        const filesToAdd: ClientFile[] = [];

        for (const file of newFiles) {
          // Skip duplicates
          if (isDuplicate(state.files, file) || isDuplicate(filesToAdd, file)) {
            skipped++;
            continue;
          }

          // Create client file object
          const clientFile: ClientFile = {
            id: generateFileId(),
            file,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            previewUrl: createPreviewUrl(file),
            addedAt: Date.now(),
          };

          filesToAdd.push(clientFile);
          added++;
        }

        set((state) => ({
          files: [...state.files, ...filesToAdd],
          isProcessing: false,
        }));

        return { added, skipped, error };
      },

      // Update a single file's properties
      updateFile: (id: string, updates: Partial<ClientFile>) => {
        set((state) => ({
          files: state.files.map((f) =>
            f.id === id ? { ...f, ...updates } : f,
          ),
        }));
      },

      // Remove a single file
      removeFile: (id: string) => {
        set((state) => {
          const fileToRemove = state.files.find((f) => f.id === id);

          // Revoke the object URL to prevent memory leaks
          if (fileToRemove?.previewUrl) {
            URL.revokeObjectURL(fileToRemove.previewUrl);
          }

          return {
            files: state.files.filter((f) => f.id !== id),
          };
        });
      },

      // Clear all files
      clearAllFiles: () => {
        const state = get();

        // Revoke all object URLs
        state.files.forEach((file) => {
          if (file.previewUrl) {
            URL.revokeObjectURL(file.previewUrl);
          }
        });

        set({ files: [] });
      },

      // Get a specific file by ID
      getFileById: (id: string) => {
        return get().files.find((f) => f.id === id);
      },

      // Get all previewable images (for the image slider)
      getPreviewableImages: () => {
        return get().files.filter(
          (f) => f.fileType.startsWith("image/") && f.previewUrl,
        );
      },

      // Calculate total size of all files
      getTotalSize: () => {
        return get().files.reduce((total, file) => total + file.fileSize, 0);
      },

      // Get raw File objects for actual upload during form submission
      getFilesForUpload: () => {
        return get().files.map((f) => f.file);
      },
    }),
    {
      name: "reference-files-store",
    },
  ),
);

/**
 * Hook to get file type counts
 */
export const useFileTypeCounts = () => {
  const files = useReferenceFilesStore((state) => state.files);

  return files.reduce(
    (acc, file) => {
      if (file.fileType.startsWith("image/")) {
        acc.image++;
      } else if (file.fileType.startsWith("video/")) {
        acc.video++;
      } else {
        acc.document++;
      }
      return acc;
    },
    { image: 0, video: 0, document: 0 },
  );
};
