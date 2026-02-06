"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { FilePreview } from "./index";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FilePreviewOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string | null;
  fileName: string;
  mimeType?: string;
}

export function FilePreviewOverlay({
  open,
  onOpenChange,
  url,
  fileName,
  mimeType,
}: FilePreviewOverlayProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[90vw] h-[80vh] bg-zinc-950 border-white/10 p-0 overflow-hidden flex flex-col gap-0 rounded-[2rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] focus:outline-none">
        <DialogTitle className="sr-only">Preview: {fileName}</DialogTitle>

        {/* Header Overlay */}
        <div className="absolute top-6 right-6 z-50">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="h-10 w-10 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-hidden">
          <FilePreview url={url} fileName={fileName} mimeType={mimeType} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
