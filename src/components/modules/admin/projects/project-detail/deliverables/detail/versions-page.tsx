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
  const [fileUrl, setFileUrl] = useState<string | null>(null);
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

  const getSignedUrlAction = useAction(
    api.functions.storage.actions.getSignedFileUrl,
  );

  useEffect(() => {
    async function fetchUrl() {
      if (deliverable?.minioKey) {
        try {
          const url = await getSignedUrlAction({
            storageKey: deliverable.minioKey,
          });
          setFileUrl(url);
        } catch (error) {
          console.error("Error fetching signed URL:", error);
        }
      }
    }
    fetchUrl();
  }, [deliverable, getSignedUrlAction]);

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
      <div className="p-12 space-y-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full bg-white/5" />
          <Skeleton className="h-8 w-64 bg-white/5 rounded-lg" />
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
        <h1 className="text-xl font-bold text-white">Deliverable Not Found</h1>
        <Button
          variant="link"
          onClick={() => router.back()}
          className="mt-4 text-indigo-400"
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 space-y-8  animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="group -ml-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-all"
          >
            <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to Deliverable
          </Button>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            Version Request
            <span className="text-sm font-medium text-white/20 bg-white/5 px-3 py-1 rounded-full border border-white/5">
              {deliverable.name} v{deliverable.version}
            </span>
          </h1>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || isUploading}
          className="bg-indigo-500 hover:bg-indigo-600 text-white font-black px-8 py-6 rounded-2xl shadow-[0_0_40px_rgba(99,102,241,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 gap-3"
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
