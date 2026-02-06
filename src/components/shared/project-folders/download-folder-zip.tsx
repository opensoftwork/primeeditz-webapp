"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useAction, useQuery } from "convex/react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DownloadFolderZipProps {
  folderId: string;
  folderName: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  label?: string;
  showIconOnly?: boolean;
}

export function DownloadFolderZip({
  folderId,
  folderName,
  variant = "outline",
  size = "sm",
  className,
  label = "Download ZIP",
  showIconOnly = false,
}: DownloadFolderZipProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const getSignedUrls = useAction(api.functions.storage.actions.getSignedFileUrls);
  
  // Use recursive query to get all files in this folder and its subfolders
  const assets = useQuery(api.functions.folders.queries.getFolderAssetsRecursive, {
    folderId: folderId as Id<"folders">,
  });

  const handleDownload = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!assets || assets.length === 0) {
      toast.error("No files to download in this folder");
      return;
    }

    setIsDownloading(true);
    const toastId = toast.loading(`Preparing ${folderName}.zip...`);

    try {
      const zip = new JSZip();
      const storageKeys = assets.map((a) => a.minioKey);
      
      // Get signed URLs for all assets
      const urlsResult = await getSignedUrls({ storageKeys });
      
      // Download all files and add to zip with correct path
      const downloadPromises = assets.map(async (asset) => {
        const url = urlsResult[asset.minioKey];
        if (!url) return;

        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to download ${asset.filename}`);
        
        const blob = await response.blob();
        
        // Use relativePath if available to put files in subfolders within the zip
        const filePath = (asset as any).relativePath 
          ? `${(asset as any).relativePath}/${asset.filename}`
          : asset.filename;
          
        zip.file(filePath, blob);
      });

      await Promise.all(downloadPromises);

      // Generate and save zip
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `${folderName.replace(/\s+/g, "_")}.zip`);

      toast.success("Download started", { id: toastId });
    } catch (error: any) {
      console.error("ZIP download failed:", error);
      toast.error(error.message || "Failed to create ZIP folder", { id: toastId });
    } finally {
      setIsDownloading(false);
    }
  };

  const isDisabled = isDownloading || !assets || assets.length === 0;

  return (
    <Button
      variant={variant}
      size={size}
      className={cn("rounded-xl", className)}
      onClick={handleDownload}
      disabled={isDisabled}
      title={assets?.length === 0 ? "Folder is empty" : "Download folder as ZIP"}
    >
      {isDownloading ? (
        <Loader2 className={cn("h-4 w-4 animate-spin", !showIconOnly && "mr-2")} />
      ) : (
        <Download className={cn("h-4 w-4", !showIconOnly && "mr-2")} />
      )}
      {!showIconOnly && (isDownloading ? "Zipping..." : label)}
    </Button>
  );
}
