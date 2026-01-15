/**
 * Wizard Step 3: Reference Files (Artifact Vault)
 *
 * Upload reference images, videos, and other assets.
 * Features a high-performance dropzone and instant feedback.
 */

"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { format } from "date-fns";
import { useWizardForm } from "../../wizard-form-context";
import { useAction } from "convex/react";
import { api } from "@convex/_generated/api";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import {
  Upload,
  Vault,
  ShieldCheck,
  Video,
  Image as ImageIcon,
  FileText,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  useReferenceFilesStore,
  useFileTypeCounts,
} from "@/stores/reference-files-store";
import { FileUploadZone } from "./file-upload-zone";
import { UploadedFilesDrawer } from "./uploaded-files-drawer";
import { FileStatsCard } from "./file-stats-card";

export function WizardStep3() {
  const {
    setFormData,
    nextStep,
    goToStep,
    isLoading: wizardLoading,
    isReviewing,
    setReviewing,
    isVaultDrawerOpen,
    setVaultDrawerOpen,
    setSubmitTrigger,
  } = useWizardForm();

  const {
    files: storeFiles,
    addFiles,
    updateFile,
    removeFile,
    isProcessing: storeProcessing,
  } = useReferenceFilesStore();

  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [vaultFilter, setVaultFilter] = useState<
    "all" | "image" | "video" | "document"
  >("all");
  const fileTypeCounts = useFileTypeCounts();

  const { projectId } = useWizardForm();

  // Handle file addition to local store
  const handleFileEngagement = useCallback(
    (newFiles: File[]) => {
      const result = addFiles(newFiles);
      if (result.added > 0) {
        toast.success(
          `${result.added} asset${
            result.added !== 1 ? "s" : ""
          } successfully engaged`,
          {
            description: "Stored in local cache for final transmission.",
            duration: 2500,
          }
        );
        setLastSynced(new Date());
      } else if (result.error) {
        toast.error(result.error, { duration: 4000 });
      }
    },
    [addFiles]
  );

  // Keep Wizard Form Data in sync with the global files store for draft persistence
  useEffect(() => {
    setFormData("step3", {
      referenceFiles: storeFiles.map((f) => ({
        fileId: f.id,
        fileName: f.fileName,
        fileSize: f.fileSize,
        fileType: f.fileType,
        storageKey: f.storageKey,
        previewUrl: f.previewUrl || undefined,
      })),
    });
  }, [storeFiles, setFormData]);

  // Register submit trigger for the global footer
  useEffect(() => {
    const trigger = async () => {
      if (storeProcessing) return;
      if (isReviewing) {
        setReviewing(false);
        await goToStep(5);
      } else {
        await nextStep();
      }
    };
    setSubmitTrigger(() => trigger());
    return () => setSubmitTrigger(null);
  }, [
    isReviewing,
    storeProcessing,
    goToStep,
    nextStep,
    setSubmitTrigger,
    setReviewing,
  ]);

  return (
    <div className="w-full space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-3">
          Project Files
        </h2>
        <p className="text-sm font-medium text-white/20">
          Upload reference images, videos, or documents.
        </p>
      </div>

      <Field className="space-y-6">
        <div className="flex items-center justify-between">
          <FieldLabel className="text-xs font-black uppercase tracking-[0.2em] text-white/60 mb-0">
            Intake Queue
          </FieldLabel>
        </div>

        <FieldContent>
          <FileUploadZone
            onUpload={handleFileEngagement}
            isUploading={storeProcessing}
          />

          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <FileStatsCard
              type="image"
              count={fileTypeCounts.image}
              onClick={() => {
                setVaultFilter("image");
                setVaultDrawerOpen(true);
              }}
            />

            <FileStatsCard
              type="video"
              count={fileTypeCounts.video}
              onClick={() => {
                setVaultFilter("video");
                setVaultDrawerOpen(true);
              }}
            />

            <FileStatsCard
              type="document"
              count={fileTypeCounts.document}
              onClick={() => {
                setVaultFilter("document");
                setVaultDrawerOpen(true);
              }}
            />

            {storeProcessing && (
              <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 space-y-1 animate-pulse flex flex-col justify-center">
                <div className="flex items-center gap-2 text-primary">
                  <Upload className="h-3 w-3 animate-bounce" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Processing
                  </span>
                </div>
                <p className="text-[10px] font-bold text-primary/60 uppercase tracking-tight">
                  Analyzing intake...
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-6">
            <FieldDescription className="text-[11px] font-medium text-white/20 flex items-center gap-2">
              <ShieldCheck className="h-3 w-3" />
              Assets are cached locally and transmitted only upon final project
              submission.
            </FieldDescription>

            {lastSynced && (
              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-primary/40 animate-in fade-in slide-in-from-right-2 duration-500">
                <RotateCcw className="h-2.5 w-2.5" />
                Local Cache Synced {format(lastSynced, "HH:mm:ss")}
              </div>
            )}
          </div>
        </FieldContent>
      </Field>

      <UploadedFilesDrawer
        open={isVaultDrawerOpen}
        onOpenChange={setVaultDrawerOpen}
        onRemoveFile={removeFile}
        initialTab={vaultFilter}
      />
    </div>
  );
}
