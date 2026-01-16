"use client";

import { useEffect, useCallback } from "react";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@convex/_generated/api";

import { toast } from "sonner";
import { useReferenceFilesStore } from "@/stores/reference-files-store";
import { UploadedFilesDrawer } from "../step-3-files/uploaded-files-drawer";

// Components
import { Step5Header } from "./header";
import { ClientInfoReview } from "./sections/client-info";
import { BasicInfoReview } from "./sections/basic-info";
import { SpecificationsReview } from "./sections/specifications";
import { DescriptionReview } from "./sections/description";
import { FilesReview } from "./sections/files-review";

import { useWizardForm } from "../../wizard-form-context";
import { SubmissionCard } from "./submission-card";

export function WizardStep5() {
  const router = useRouter();
  const {
    mode,
    formData,
    projectCode,
    goToStep,
    submitProject,
    setReviewing,
    isVaultDrawerOpen,
    setVaultDrawerOpen,
    setSubmitTrigger,
  } = useWizardForm();

  const { removeFile, files } = useReferenceFilesStore();

  const projectType = useQuery(
    api.functions.projectTypes.queries.getProjectType,
    formData.step1.projectTypeId
      ? { projectTypeId: formData.step1.projectTypeId }
      : "skip"
  ) as any;

  const handleEdit = (step: 0 | 1 | 2 | 3 | 4) => {
    setReviewing(true);
    goToStep(step);
  };

  const handleSubmit = useCallback(async () => {
    const success = await submitProject();
    if (success) {
      toast.success("Project successfully submitted!");
      router.push("/dashboard");
    }
  }, [submitProject, router]);

  useEffect(() => {
    setSubmitTrigger(() => handleSubmit());
    return () => setSubmitTrigger(null);
  }, [setSubmitTrigger, handleSubmit]);

  const images = files
    .filter((f) => f.fileType.startsWith("image/"))
    .slice(0, 4);

  return (
    <div className="w-full space-y-12">
      <Step5Header projectCode={projectCode} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          {mode === "admin" && (
            <ClientInfoReview
              formData={formData}
              onEdit={() => handleEdit(0)}
            />
          )}

          <BasicInfoReview
            formData={formData}
            projectType={projectType}
            onEdit={() => handleEdit(1)}
          />

          <SpecificationsReview
            formData={formData}
            projectType={projectType}
            onEdit={() => handleEdit(2)}
          />

          <DescriptionReview formData={formData} onEdit={() => handleEdit(4)} />
        </div>

        <div className="lg:col-span-4 space-y-10">
          <FilesReview
            files={files}
            images={images}
            onOpenVault={() => setVaultDrawerOpen(true)}
            onEdit={() => handleEdit(3)}
          />

          <SubmissionCard />
        </div>
      </div>

      <UploadedFilesDrawer
        open={isVaultDrawerOpen}
        onOpenChange={setVaultDrawerOpen}
        onRemoveFile={removeFile}
      />
    </div>
  );
}
