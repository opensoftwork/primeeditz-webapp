"use client";

import { useMutation, useAction } from "convex/react";
import { api } from "@convex/_generated/api";
import { useUploadStore, type UploadItem } from "@/stores/upload-store";
import * as tus from "tus-js-client";
import { toast } from "sonner";
import { type Id } from "@convex/_generated/dataModel";

const SMALL_FILE_THRESHOLD = 50 * 1024 * 1024; // 50MB

export function useUploadManager() {
  const { updateProgress, updateStatus, removeUpload } = useUploadStore();
  
  const generateUploadUrlAction = useAction(api.functions.storage.actions.generateUploadUrl);
  const getTusConfigAction = useAction(api.functions.storage.actions.getTusConfig);
  const createAssetMutation = useMutation(api.functions.assets.mutations.createAsset);

  const processUpload = async (id: string, item: UploadItem) => {
    const { file, projectId, folderId } = item;
    
    try {
      if (file.size < SMALL_FILE_THRESHOLD) {
        // --- SMALL FILE: Pre-signed PUT ---
        updateStatus(id, "uploading");
        
        const { url, storageKey } = await generateUploadUrlAction({
          fileName: file.name,
          contentType: file.type,
          projectId: projectId as Id<"projects">,
          folderId: folderId as Id<"folders">,
          fileSize: file.size,
        });

        const xhr = new XMLHttpRequest();
        xhr.open("PUT", url);
        xhr.setRequestHeader("Content-Type", file.type);
        
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            updateProgress(id, progress);
          }
        };

        const uploadPromise = new Promise((resolve, reject) => {
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) resolve(true);
            else reject(new Error(`Upload failed with status ${xhr.status}`));
          };
          xhr.onerror = () => reject(new Error("Network error during upload"));
        });

        xhr.send(file);
        await uploadPromise;

        // Create Convex record
        await createAssetMutation({
          projectId: projectId as Id<"projects">,
          folderId: folderId as Id<"folders">,
          filename: file.name,
          minioKey: storageKey,
          sizeBytes: file.size,
          mimeType: file.type,
        });

      } else {
        // --- LARGE FILE: TUS Resumable ---
        updateStatus(id, "uploading");
        
        const { endpoint } = await getTusConfigAction({
          projectId: projectId as Id<"projects">,
          fileSize: file.size,
        });

        const upload = new tus.Upload(file, {
          endpoint,
          retryDelays: [0, 3000, 5000, 10000, 20000],
          metadata: {
            filename: file.name,
            filetype: file.type,
            projectId: projectId,
            folderId: folderId,
          },
          onError: (error) => {
            console.error("TUS Error:", error);
            updateStatus(id, "error", { error: error.message });
          },
          onProgress: (bytesUploaded, bytesTotal) => {
            const progress = Math.round((bytesUploaded / bytesTotal) * 100);
            updateProgress(id, progress);
          },
          onSuccess: async () => {
            // TUS server will have named the file in S3 already
            // We need to construct the key that matches TUS namingFunction
            // Actually, TUS server 2.x returns the upload URL. 
            // The storage key is the last part of the URL.
            const minioKey = upload.url?.split("/").slice(-1)[0] || "";
            // Wait, our namingFunction returns a complex path projects/...
            // The TUS ID is the full path.
            
            await createAssetMutation({
              projectId: projectId as Id<"projects">,
              folderId: folderId as Id<"folders">,
              filename: file.name,
              minioKey: upload.url?.split("/tus/")[1] || "", 
              sizeBytes: file.size,
              mimeType: file.type,
            });
          }
        });

        upload.start();
      }

      updateStatus(id, "completed");
      toast.success(`${file.name} uploaded successfully`);
      
      // Auto-remove from list after 3 seconds
      setTimeout(() => removeUpload(id), 3000);

    } catch (error: any) {
      console.error(`Upload error for ${file.name}:`, error);
      updateStatus(id, "error", { error: error.message });
      toast.error(`Failed to upload ${file.name}`);
    }
  };

  return {
    processUpload,
  };
}
