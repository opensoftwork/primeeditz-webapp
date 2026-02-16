"use client";

import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery, useAction } from "convex/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, MessageSquare, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { DeliverablePreview } from "./deliverable-preview";
import { VersionImageUpload } from "./versions-image-upload";
import { VersionImageGrid, VersionImage } from "./versions-image-grid";
import { useBreadcrumbStore } from "@/store/breadcrumb-store";
import { useSignedUrl } from "@/components/shared/deliverables";

interface VersionsPageProps {
  projectId: string;
  deliverableId: string;
}

export function VersionsPage({ projectId, deliverableId }: VersionsPageProps) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [uploadedImages, setUploadedImages] = useState<VersionImage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { setOverride, removeOverride } = useBreadcrumbStore();

  const deliverable = useQuery(
    //@ts-ignore
    api.functions.deliverables.queries.getDeliverable,
    { deliverableId: deliverableId as Id<"deliverables"> },
  );

  useEffect(() => {
    if (deliverable) {
      setOverride(deliverableId, deliverable.name);
    }
    return () => removeOverride(deliverableId);
  }, [deliverableId, deliverable, setOverride, removeOverride]);

  const createVersionRequest = useMutation(
    api.functions.deliverables.mutations.createVersionRequest,
  );

  // Fetch signed URL for the deliverable using custom hook
  const { url: fileUrl } = useSignedUrl(deliverable?.minioKey);

  const handleSubmit = async () => {
    if (!notes.trim()) {
      toast.error("Please provide general version notes");
      return;
    }

    if (isUploading) {
      toast.error("Please wait for images to finish uploading");
      return;
    }

    setIsSubmitting(true);
    try {
      await createVersionRequest({
        deliverableId: deliverableId as Id<"deliverables">,
        notes: notes.trim(),
        referenceImages: uploadedImages.map(
          ({ fileName, fileSize, mimeType, minioKey, note }) => ({
            fileName,
            fileSize,
            mimeType,
            minioKey,
            note: note.trim() || undefined,
          }),
        ),
      });

      toast.success("Version request submitted! Employee will be notified.");
      router.back();
    } catch (error: any) {
      toast.error(error.message || "Failed to create version request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateImageNote = (index: number, note: string) => {
    setUploadedImages((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], note };
      return next;
    });
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadComplete = (image: {
    fileName: string;
    fileSize: number;
    mimeType: string;
    minioKey: string;
    previewUrl: string;
  }) => {
    setUploadedImages((prev) => [...prev, { ...image, note: "" }]);
  };

  if (deliverable === undefined) {
    return (
      <div className="flex min-h-[calc(100vh-120px)] w-full flex-col px-8 pt-10 pb-12">
        <div className="flex items-center gap-5 mb-12">
          <Skeleton className="h-11 w-11 rounded-xl bg-white/5" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 bg-white/5" />
            <Skeleton className="h-10 w-64 bg-white/5" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="h-[600px] w-full bg-white/5 rounded-3xl" />
          <Skeleton className="h-[600px] w-full bg-white/5 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (deliverable === null) {
    return (
      <div className="p-12 text-center">
        <h1 className="text-xl font-bold text-white uppercase tracking-tighter">
          Deliverable Not Found
        </h1>
        <Button
          variant="link"
          onClick={() => router.back()}
          className="mt-4 text-indigo-400 uppercase tracking-widest font-black"
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-120px)] w-full flex-col px-8 pt-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="flex items-center gap-5">
          <Button
            variant="outline"
            size="icon"
            className="rounded-xl h-11 w-11 border-white/10 bg-white/5 hover:bg-white/10 transition-all shadow-lg shrink-0"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5 text-white/60" />
          </Button>

          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400/60">
                NEW VERSION REQUEST
              </span>
              <span className="text-[10px] font-black uppercase bg-white/5 px-2 py-0.5 rounded-md border border-white/5 text-white/40">
                {deliverable.name} v{deliverable.version}
              </span>
            </div>
            <h1 className="text-4xl xl:text-5xl font-black uppercase tracking-tighter text-white">
              Version Request
            </h1>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || isUploading}
          className="bg-indigo-500 hover:bg-indigo-600 text-white font-black px-8 py-6 rounded-2xl shadow-[0_0_40px_rgba(99,102,241,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 gap-3 text-xs uppercase tracking-widest"
        >
          {isSubmitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Save className="h-5 w-5" />
          )}
          SUBMIT VERSION REQUEST
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Left Panel: Preview */}
        <div className="sticky top-24 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xs font-black uppercase tracking-widest text-white/30">
              Current Deliverable
            </h2>
          </div>
          <DeliverablePreview
            url={fileUrl}
            fileName={deliverable.name}
            mimeType={deliverable.mimeType}
            description={deliverable.description}
          />
        </div>

        {/* Right Panel: Form */}
        <div className="space-y-10">
          {/* General Notes */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 px-2">
              <MessageSquare className="h-4 w-4 text-indigo-400" />
              <h2 className="text-xs font-black uppercase tracking-widest text-white/40">
                General Feedback
              </h2>
              <span className="text-[10px] text-red-500/50 uppercase font-black ml-auto tracking-widest">
                Required
              </span>
            </div>
            <Textarea
              placeholder="Explain what needs to be changed across the whole deliverable..."
              className="min-h-[160px] bg-white/2 border-white/5 focus:border-indigo-500/50 rounded-3xl p-6 text-sm placeholder:text-white/20 transition-all shadow-inner"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </section>

          {/* Reference Images */}
          <section className="space-y-6">
            <VersionImageUpload
              projectId={projectId}
              deliverableId={deliverableId}
              onUploadComplete={handleUploadComplete}
              isUploading={isUploading}
              setIsUploading={setIsUploading}
            />

            <VersionImageGrid
              images={uploadedImages}
              onNoteChange={handleUpdateImageNote}
              onRemove={handleRemoveImage}
            />

            {uploadedImages.length === 0 && !isUploading && (
              <div className="border-2 border-dashed border-white/5 rounded-3xl p-12 text-center space-y-3">
                <div className="h-12 w-12 rounded-2xl bg-white/2 flex items-center justify-center mx-auto">
                  <span className="text-white/20">+</span>
                </div>
                <p className="text-xs text-white/30 font-medium">
                  No reference images added yet. <br />
                  Upload images to provide visual context.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
