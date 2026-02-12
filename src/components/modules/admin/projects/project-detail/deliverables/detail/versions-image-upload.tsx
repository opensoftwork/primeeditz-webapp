"use client";

import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useAction } from "convex/react";
import { useState, useRef } from "react";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface VersionImageUploadProps {
  projectId: string;
  deliverableId: string;
  onUploadComplete: (image: {
    fileName: string;
    fileSize: number;
    mimeType: string;
    minioKey: string;
    previewUrl: string;
  }) => void;
  isUploading: boolean;
  setIsUploading: (uploading: boolean) => void;
}

export function VersionImageUpload({
  projectId,
  deliverableId,
  onUploadComplete,
  isUploading,
  setIsUploading,
}: VersionImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {},
  );

  const generateUploadUrl = useAction(
    //@ts-ignore
    api.functions.storage.actions.generateUploadUrl,
  );

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate files are images
    const invalidFiles = files.filter((f) => !f.type.startsWith("image/"));
    if (invalidFiles.length > 0) {
      toast.error("Please select only image files (JPG, PNG, WEBP, etc.)");
      return;
    }

    setIsUploading(true);

    // Process each file
    for (const file of files) {
      const fileId = Math.random().toString(36).substring(7);
      try {
        setUploadProgress((prev) => ({ ...prev, [fileId]: 0 }));

        // 1. Generate signed upload URL
        const { url, storageKey } = await generateUploadUrl({
          fileName: file.name,
          contentType: file.type,
          projectId: projectId as Id<"projects">,
          deliverableId: deliverableId as Id<"deliverables">,
          fileSize: file.size,
        });

        // 2. Perform PUT upload
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", url);
        xhr.setRequestHeader("Content-Type", file.type);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadProgress((prev) => ({ ...prev, [fileId]: progress }));
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

        // 3. Create local preview URL
        const previewUrl = URL.createObjectURL(file);

        // 4. Notify parent
        onUploadComplete({
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          minioKey: storageKey,
          previewUrl,
        });
      } catch (error: any) {
        console.error(`Upload error for ${file.name}:`, error);
        toast.error(`Failed to upload ${file.name}: ${error.message}`);
      } finally {
        setUploadProgress((prev) => {
          const next = { ...prev };
          delete next[fileId];
          return next;
        });
      }
    }

    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const activeUploads = Object.entries(uploadProgress);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider flex items-center gap-2">
          <ImageIcon className="h-4 w-4" />
          Reference Images
        </h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="bg-white/5 border-white/10 hover:bg-white/10 rounded-lg gap-2"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          Upload Images
        </Button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
      />

      {activeUploads.length > 0 && (
        <div className="space-y-2 bg-white/5 rounded-xl p-3 border border-white/10">
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
            Uploading...
          </p>
          {activeUploads.map(([id, progress]) => (
            <div key={id} className="space-y-1">
              <div className="flex justify-between text-[10px] text-white/40">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-1 bg-white/5" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
