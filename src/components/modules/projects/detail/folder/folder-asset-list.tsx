"use client";

import { Eye, FileImage, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { ImageSlider } from "@/components/shared/image-viewer/image-slider";
import { formatBytes } from "@/components/shared/project-folders/folder-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

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
                  : "opacity-80"
              )}
              onClick={hasSignedUrl ? () => openImageViewer(asset._id) : undefined}
            >
              <CardContent className="p-3 flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg shrink-0 transition-colors",
                  hasSignedUrl ? "bg-primary/10 group-hover/asset:bg-primary/20" : "bg-white/5"
                )}>
                  <FileImage className={cn(
                    "h-4 w-4",
                    hasSignedUrl ? "text-primary" : "text-white/20"
                  )} />
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
                {hasSignedUrl && (
                  <div className="h-8 w-8 flex items-center justify-center text-primary/20 group-hover/asset:text-primary/60 transition-colors">
                    <Eye className="h-4 w-4" />
                  </div>
                )}
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
    </div>
  );
}
