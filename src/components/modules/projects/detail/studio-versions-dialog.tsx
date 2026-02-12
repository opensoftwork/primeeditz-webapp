"use client";

import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useMutation, useAction } from "convex/react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, AlertCircle, ImageIcon } from "lucide-react";
import {
  VersionImageGrid,
  VersionImage,
} from "@/components/modules/admin/projects/project-detail/deliverables/detail/versions-image-grid";

interface StudioVersionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deliverableId: Id<"deliverables">;
  deliverableName: string;
  projectId: Id<"projects">;
  onSuccess?: () => void;
}

export function StudioVersionsDialog({
  open,
  onOpenChange,
  deliverableId,
  deliverableName,
  projectId,
  onSuccess,
}: StudioVersionsDialogProps) {
  const [notes, setNotes] = useState("");
  const [images, setImages] = useState<VersionImage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createVersionRequest = useMutation(
    api.functions.deliverables.mutations.createVersionRequest,
  );
  const generateUploadUrl = useAction(
    api.functions.storage.actions.generateUploadUrl,
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const newImages = [...images];

      for (const file of Array.from(files)) {
        // 1. Get pre-signed URL
        const { url, storageKey } = await generateUploadUrl({
          fileName: file.name,
          contentType: file.type,
          projectId: projectId,
          deliverableId: deliverableId,
          fileSize: file.size,
        });

        // 2. Upload to MinIO
        const response = await fetch(url, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type,
          },
        });

        if (!response.ok)
          throw new Error(`Upload failed: ${response.statusText}`);

        newImages.push({
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          minioKey: storageKey,
          note: "",
          previewUrl: URL.createObjectURL(file),
        });
      }
      setImages(newImages);
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload reference image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleNoteChange = (index: number, note: string) => {
    const newImages = [...images];
    newImages[index].note = note;
    setImages(newImages);
  };

  const handleSubmit = async () => {
    if (!notes.trim()) {
      toast.error("Please provide version notes");
      return;
    }

    setIsSubmitting(true);
    try {
      await createVersionRequest({
        deliverableId,
        notes,
        referenceImages: images.map(({ previewUrl, ...img }) => img),
      });

      toast.success("Version request submitted");
      onSuccess?.();
      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit version request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setNotes("");
    setImages([]);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val);
        if (!val) resetForm();
      }}
    >
      <DialogContent className="max-w-2xl bg-zinc-950 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-400" />
            Request Changes: {deliverableName}
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Provide detailed feedback and optional reference images for this
            deliverable.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 my-4">
          <div className="space-y-2">
            <Label
              htmlFor="notes"
              className="text-xs font-bold uppercase tracking-wider text-white/50"
            >
              Version Notes <span className="text-red-400">*</span>
            </Label>
            <Textarea
              id="notes"
              placeholder="e.g., Please adjust the color grading to be more warm..."
              className="h-32 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-red-500/50"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold uppercase tracking-wider text-white/50">
                Reference Images (Optional)
              </Label>
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-lg border-white/10 bg-white/5 hover:bg-white/10"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                ) : (
                  <Upload className="h-3.5 w-3.5 mr-1" />
                )}
                Upload Images
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleFileChange}
              />
            </div>

            {images.length > 0 ? (
              <VersionImageGrid
                images={images}
                onRemove={handleRemoveImage}
                onNoteChange={handleNoteChange}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-8 rounded-xl border border-dashed border-white/10 bg-white/3">
                <ImageIcon className="h-8 w-8 text-white/10 mb-2" />
                <p className="text-xs text-white/30 italic">
                  No reference images uploaded
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="ghost"
            className="text-white/60 hover:text-white hover:bg-white/5"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            className="bg-red-500 hover:bg-red-600 text-white font-bold px-6"
            onClick={handleSubmit}
            disabled={isSubmitting || isUploading}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Version Request"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
