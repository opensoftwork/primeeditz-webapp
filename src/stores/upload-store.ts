import { create } from "zustand";

export type UploadStatus =
  | "pending"
  | "uploading"
  | "processing"
  | "completed"
  | "error";

export interface UploadItem {
  id: string;
  file: File;
  projectId: string;
  folderId: string;
  progress: number;
  status: UploadStatus;
  error?: string;
  storageKey?: string;
  tusId?: string;
}

interface UploadState {
  items: Record<string, UploadItem>;
  addUpload: (projectId: string, folderId: string, file: File) => string;
  updateProgress: (id: string, progress: number) => void;
  updateStatus: (
    id: string,
    status: UploadStatus,
    extra?: Partial<UploadItem>,
  ) => void;
  removeUpload: (id: string) => void;
}

export const useUploadStore = create<UploadState>((set) => ({
  items: {},

  addUpload: (projectId, folderId, file) => {
    const id = Math.random().toString(36).substring(7);
    set((state) => ({
      items: {
        ...state.items,
        [id]: {
          id,
          file,
          projectId,
          folderId,
          progress: 0,
          status: "pending",
        },
      },
    }));
    return id;
  },

  updateProgress: (id, progress) => {
    set((state) => ({
      items: {
        ...state.items,
        [id]: {
          ...state.items[id],
          progress,
          status: progress === 100 ? "processing" : "uploading",
        },
      },
    }));
  },

  updateStatus: (id, status, extra) => {
    set((state) => ({
      items: {
        ...state.items,
        [id]: {
          ...state.items[id],
          status,
          ...extra,
        },
      },
    }));
  },

  removeUpload: (id) => {
    set((state) => {
      const newItems = { ...state.items };
      delete newItems[id];
      return { items: newItems };
    });
  },
}));
