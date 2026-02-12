"use client";

import { X, MessageSquare, Maximize2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface VersionImage {
  fileName: string;
  fileSize: number;
  mimeType: string;
  minioKey: string;
  note: string;
  previewUrl: string;
}

interface VersionImageGridProps {
  images: VersionImage[];
  onNoteChange: (index: number, note: string) => void;
  onRemove: (index: number) => void;
}

export function VersionImageGrid({
  images,
  onNoteChange,
  onRemove,
}: VersionImageGridProps) {
  if (images.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {images.map((image, index) => (
        <div
          key={image.minioKey}
          className="group relative flex flex-col bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all hover:border-white/20 hover:shadow-2xl hover:shadow-indigo-500/10"
        >
          {/* Thumbnail */}
          <div className="relative aspect-video w-full overflow-hidden bg-black/40">
            <img
              src={image.previewUrl}
              alt={image.fileName}
              className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
              onLoad={() => {
                // Pre-warm the browser image cache
              }}
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Action Buttons */}
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-7 w-7 rounded-lg shadow-lg"
                      onClick={() => onRemove(index)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Remove image</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-7 w-7 rounded-lg bg-white/20 backdrop-blur-md border border-white/20 text-white hover:bg-white/30 shadow-lg"
                      onClick={() => window.open(image.previewUrl, "_blank")}
                    >
                      <Maximize2 className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Preview image</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="absolute bottom-2 left-2 truncate max-w-[80%]">
              <p className="text-[10px] font-medium text-white/60 truncate drop-shadow-md">
                {image.fileName}
              </p>
            </div>
          </div>

          {/* Note Input */}
          <div className="p-3 space-y-2">
            <div className="flex items-center gap-1.5">
              <MessageSquare className="h-3 w-3 text-indigo-400" />
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                Image Note
              </label>
            </div>
            <Textarea
              placeholder="What should be fixed in this reference...?"
              className="min-h-[60px] resize-none bg-black/20 border-white/5 focus:border-indigo-500/50 rounded-xl text-xs placeholder:text-white/20 transition-all"
              value={image.note}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                onNoteChange(index, e.target.value)
              }
            />
          </div>
        </div>
      ))}
    </div>
  );
}
