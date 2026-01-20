"use client";

import { useState, useEffect } from "react";
import { FileImage, Eye, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/components/shared/project-folders/folder-card";
import { ImageSlider } from "@/components/shared/image-viewer/image-slider";

interface Asset {
  _id: string;
  filename: string;
  minioKey: string;
  sizeBytes: number;
  mimeType: string;
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
      <div className="animate-pulse space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4 h-16 bg-white/3" />
          </Card>
        ))}
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

      <div className="grid gap-3">
        {assets.map((asset) => {
          const isImage = asset.mimeType.startsWith("image/");
          const hasSignedUrl = isImage && signedUrls[asset.minioKey];

          return (
            <Card
              key={asset._id}
              className="hover:bg-white/5 transition-colors"
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <FileImage className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">
                    {asset.filename}
                  </p>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                    {formatBytes(asset.sizeBytes)} • {asset.mimeType}
                  </p>
                </div>
                {hasSignedUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full"
                    onClick={() => openImageViewer(asset._id)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
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
