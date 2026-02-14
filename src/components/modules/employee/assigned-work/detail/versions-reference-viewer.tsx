"use client";

import { useAction } from "convex/react";
import { api } from "@convex/_generated/api";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, User, Calendar, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

interface VersionReferenceViewerProps {
  notes: string;
  versionNumber: number;
  requestedBy: string;
  requestedByRole: string;
  createdAt: number;
  referenceImages?: Array<{
    fileName: string;
    fileSize: number;
    mimeType: string;
    minioKey: string;
    note?: string;
  }>;
}

export function VersionReferenceViewer({
  notes,
  versionNumber,
  requestedBy,
  requestedByRole,
  createdAt,
  referenceImages,
}: VersionReferenceViewerProps) {
  const getSignedUrl = useAction(
    // @ts-ignore
    api.functions.storage.actions.getSignedFileUrl,
  );
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [loadingUrls, setLoadingUrls] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUrls() {
      if (!referenceImages?.length) {
        setLoadingUrls(false);
        return;
      }

      const urls: Record<string, string> = {};
      try {
        await Promise.all(
          referenceImages.map(async (img) => {
            const url = await getSignedUrl({ storageKey: img.minioKey });
            if (url) {
              urls[img.minioKey] = url;
            }
          }),
        );
        setImageUrls(urls);
      } catch (error) {
        console.error("Error fetching reference image URLs:", error);
      } finally {
        setLoadingUrls(false);
      }
    }

    fetchUrls();
  }, [referenceImages, getSignedUrl]);

  return (
    <div className="space-y-5">
      {/* Header Info */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-white/40 mb-2">
        <Badge
          variant="outline"
          className="bg-amber-500/10 text-amber-500 border-amber-500/20 px-3 py-1 font-black"
        >
          VERSION #{versionNumber}
        </Badge>
        <div className="flex items-center gap-1.5">
          <User className="h-3 w-3" />
          <span>
            {requestedBy} ({requestedByRole})
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3 w-3" />
          <span>{new Date(createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Primary Notes */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2"
      >
        <div className="flex items-center gap-2 text-amber-500">
          <AlertTriangle className="h-4 w-4" />
          <h4 className="text-xs font-black uppercase tracking-widest">
            Version Instructions
          </h4>
        </div>
        <p className="text-sm text-amber-50/90 leading-relaxed font-medium">
          {notes}
        </p>
      </motion.div>

      {/* Reference Images */}
      {referenceImages && referenceImages.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
              Reference Images ({referenceImages.length})
            </h4>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {referenceImages.map((img, idx) => (
              <motion.div
                key={img.minioKey}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group relative bg-white/2 border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all duration-300"
              >
                <div className="flex gap-4 p-4">
                  <div
                    className="relative h-20 w-20 shrink-0 rounded-xl overflow-hidden bg-black/40 border border-white/5 cursor-zoom-in"
                    onClick={() =>
                      setSelectedImage(imageUrls[img.minioKey] ?? null)
                    }
                  >
                    {loadingUrls ? (
                      <Skeleton className="h-full w-full bg-white/5" />
                    ) : imageUrls[img.minioKey] ? (
                      <Image
                        src={imageUrls[img.minioKey]}
                        alt={img.fileName}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-white/5">
                        <AlertTriangle className="h-4 w-4 text-white/20" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col justify-center py-1">
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-wider mb-1">
                      {img.fileName}
                    </p>
                    {img.note ? (
                      <p className="text-xs text-white/70 italic leading-relaxed">
                        "{img.note}"
                      </p>
                    ) : (
                      <p className="text-[10px] text-white/20 italic">
                        No per-image note
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() =>
                      setSelectedImage(imageUrls[img.minioKey] ?? null)
                    }
                    className="absolute top-4 right-4 p-2 rounded-lg bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
                  >
                    <ExternalLink className="h-3.5 w-3.5 text-white/60" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox / Expanded View */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-100 flex items-center justify-center p-8 bg-black/90 backdrop-blur-xl"
          >
            <motion.div
              layoutId="lightbox"
              className="relative max-w-5xl w-full h-full flex items-center justify-center"
            >
              <img
                src={selectedImage}
                alt="Reference"
                className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
              />
              <button
                className="absolute top-0 right-0 p-4 text-white/60 hover:text-white"
                onClick={() => setSelectedImage(null)}
              >
                Close (ESC)
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
