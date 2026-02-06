"use client";

import { Eye, FileImage, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { ImageSlider } from "@/components/shared/image-viewer/image-slider";
import { formatBytes } from "@/components/shared/project-folders/folder-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAction, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Id } from "@convex/_generated/dataModel";

interface Asset {
  _id: string;
  filename: string;
  minioKey: string;
  sizeBytes: number;
  mimeType: string;
  uploaderName?: string;
  uploaderRole?: string;
}

interface FolderAssetListProps {
  assets: Asset[] | undefined;
  signedUrls: Record<string, string | null>;
  isLoading?: boolean;
}

export function FolderAssetList({
  assets,
  signedUrls,
  isLoading,
}: FolderAssetListProps) {
  const [sliderOpen, setSliderOpen] = useState(false);
  const [sliderIndex, setSliderIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);

  const deleteAsset = useMutation(api.functions.assets.mutations.deleteAsset);
  const deleteFile = useAction(api.functions.storage.actions.deleteFile);

  const handleDelete = async () => {
    if (!assetToDelete) return;

    setIsDeleting(true);
    const toastId = toast.loading(`Deleting ${assetToDelete.filename}...`);

    try {
      // 1. Delete from storage first
      await deleteFile({ storageKey: assetToDelete.minioKey });

      // 2. Delete database record
      await deleteAsset({ assetId: assetToDelete._id as Id<"assets"> });

      toast.success("File deleted successfully", { id: toastId });
      setAssetToDelete(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete file", { id: toastId });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-black uppercase tracking-tight text-white/20">
          Loading Files...
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  if (!assets || assets.length === 0) {
    return null;
  }

  const imageAssets = assets.filter((a) => a.mimeType.startsWith("image/"));

  // Prepare images for slider
  const sliderImages = imageAssets
    .map((asset) => ({
      url: signedUrls[asset.minioKey] || "",
      fileName: asset.filename,
      fileId: asset._id,
    }))
    .filter((img) => img.url);

  const openImageViewer = (assetId: string) => {
    const index = imageAssets.findIndex((a) => a._id === assetId);
    if (index >= 0) {
      setSliderIndex(index);
      setSliderOpen(true);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-black uppercase tracking-tight text-white/60">
        Uploaded Files ({assets.length})
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {assets.map((asset) => {
          const isImage = asset.mimeType.startsWith("image/");
          const hasSignedUrl = isImage && signedUrls[asset.minioKey];

          return (
            <Card
              key={asset._id}
              className={cn(
                "transition-all border-white/5 bg-white/2 group/asset",
                hasSignedUrl
                  ? "hover:bg-white/5 cursor-pointer hover:border-primary/20 hover:scale-[1.02] active:scale-[0.98]"
                  : "opacity-80",
              )}
              onClick={
                hasSignedUrl ? () => openImageViewer(asset._id) : undefined
              }
            >
              <CardContent className="p-3 flex items-center gap-3">
                <div
                  className={cn(
                    "p-2 rounded-lg shrink-0 transition-colors",
                    hasSignedUrl
                      ? "bg-primary/10 group-hover/asset:bg-primary/20"
                      : "bg-white/5",
                  )}
                >
                  <FileImage
                    className={cn(
                      "h-4 w-4",
                      hasSignedUrl ? "text-primary" : "text-white/20",
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-white truncate tracking-tight">
                    {asset.filename}
                  </p>
                  <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.15em] flex items-center gap-2 mt-0.5">
                    {formatBytes(asset.sizeBytes)} • {asset.mimeType}
                  </p>
                  {asset.uploaderName && (
                    <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest mt-1">
                      {asset.uploaderName} ({asset.uploaderRole})
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {hasSignedUrl && (
                    <div
                      className="h-8 w-8 flex items-center justify-center text-primary/20 group-hover/asset:text-primary/60 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        openImageViewer(asset._id);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-xl opacity-0 group-hover/asset:opacity-100 transition-all duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAssetToDelete(asset);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Image Slider */}
      <ImageSlider
        images={sliderImages}
        initialIndex={sliderIndex}
        open={sliderOpen}
        onOpenChange={setSliderOpen}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!assetToDelete}
        onOpenChange={(open) => !open && !isDeleting && setAssetToDelete(null)}
      >
        <AlertDialogContent className="bg-zinc-950 border-white/10 rounded-3xl p-8 glass overflow-hidden max-w-md">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-500/10 blur-[80px] rounded-full" />

          <AlertDialogHeader className="space-y-4 relative z-10">
            <div className="mx-auto p-4 rounded-full bg-red-500/10 border border-red-500/20 w-fit mb-2 shadow-xl shadow-red-500/5">
              <Trash2 className="h-6 w-6 text-red-500" />
            </div>
            <AlertDialogTitle className="text-2xl font-black uppercase tracking-tight text-white text-center font-sentient">
              Delete File
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/50 text-xs font-medium text-center leading-relaxed px-4">
              Are you sure you want to delete{" "}
              <span className="text-white font-bold">
                "{assetToDelete?.filename}"
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 gap-3 relative z-10 flex flex-row items-center">
            <AlertDialogCancel
              disabled={isDeleting}
              className="h-11 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-wider text-[10px] flex-1 mt-0"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="h-11 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold uppercase tracking-wider text-[10px] flex-1 shadow-lg shadow-red-500/20"
            >
              {isDeleting ? "Deleting..." : "Delete File"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
