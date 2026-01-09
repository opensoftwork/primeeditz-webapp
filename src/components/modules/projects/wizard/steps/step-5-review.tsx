/**
 * Wizard Step 5: Review & Submit
 *
 * Review all entered information and submit the project request.
 * Uses shadcn Field components and Motion animations for premium UX.
 */

"use client";

import { useEffect, useCallback } from "react";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWizardForm } from "../wizard-form-context";
import {
  ArrowLeft,
  Check,
  Edit2,
  FileIcon,
  Loader2,
  Calendar,
  MapPin,
  User,
  Tag,
  FileText,
  LayoutGrid,
  Sparkles,
  ChevronRight,
  Database,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { UploadedFilesDrawer } from "./step-3/uploaded-files-drawer";
import { useReferenceFilesStore } from "@/stores/reference-files-store";
import Image from "next/image";

export function WizardStep5() {
  const router = useRouter();
  const {
    formData,
    projectCode,
    goToStep,
    prevStep,
    submitProject,
    isLoading: wizardLoading,
    setReviewing,
    isVaultDrawerOpen,
    setVaultDrawerOpen,
    setSubmitTrigger,
  } = useWizardForm();

  const { removeFile, files } = useReferenceFilesStore();

  // Get project type name
  const projectType = useQuery(
    api.functions.projectTypes.queries.getProjectType,
    formData.step1.projectTypeId
      ? { projectTypeId: formData.step1.projectTypeId }
      : "skip"
  );

  const handleEdit = (step: 1 | 2 | 3 | 4) => {
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

  // Register submit trigger for the global footer
  useEffect(() => {
    setSubmitTrigger(() => handleSubmit());
    return () => setSubmitTrigger(null);
  }, [setSubmitTrigger, handleSubmit]);

  // Filter images for quick review grid
  const images = files
    .filter((f) => f.fileType.startsWith("image/"))
    .slice(0, 4);

  return (
    <div className="w-full space-y-12">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-0.5 w-12 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">
            Review Information
          </span>
        </div>
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black uppercase tracking-tight text-white flex items-center gap-4">
            Project Review
            <Badge
              variant="outline"
              className="border-primary/20 text-primary uppercase text-[10px] tracking-widest font-black py-0.5"
            >
              Stage 05
            </Badge>
          </h2>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">
              Project ID
            </span>
            <span className="font-mono text-xl font-black tracking-tighter text-white/50">
              {projectCode}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Content */}
        <div className="lg:col-span-8 space-y-10">
          {/* Section: Basic Information */}
          <SectionWrapper
            title="Basic Information"
            onEdit={() => handleEdit(1)}
            icon={<Database className="h-4 w-4" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ReviewData
                icon={<Tag />}
                label="Project Type"
                value={projectType?.name}
              />
              <ReviewData
                icon={<User />}
                label="End Client"
                value={formData.step1.endClientName}
              />
              <ReviewData
                icon={<FileText />}
                label="Event Name"
                value={formData.step1.eventName}
              />
              <ReviewData
                icon={<Calendar />}
                label="Event Date"
                value={
                  formData.step1.eventDate
                    ? format(formData.step1.eventDate, "PPP")
                    : "N/A"
                }
              />
              <ReviewData
                icon={<MapPin />}
                label="Venue"
                value={formData.step1.venue || "N/A"}
              />
            </div>
          </SectionWrapper>

          {/* Section: Project Description */}
          <SectionWrapper
            title="Project Description"
            onEdit={() => handleEdit(4)}
            icon={<Sparkles className="h-4 w-4" />}
          >
            <div className="space-y-8">
              <div>
                <Label label="Description" />
                <p className="text-[15px] font-bold text-white leading-relaxed bg-white/2 border border-white/5 p-6 rounded-2xl">
                  {formData.step4.description}
                </p>
              </div>
              {formData.step4.additionalNotes && (
                <div>
                  <Label label="Additional Notes" />
                  <p className="text-sm font-medium text-white/40 leading-relaxed">
                    {formData.step4.additionalNotes}
                  </p>
                </div>
              )}
              <ReviewData
                icon={<Calendar />}
                label="Delivery Date"
                value={
                  formData.step4.preferredDeliveryDate
                    ? format(formData.step4.preferredDeliveryDate, "PPP")
                    : "ASAP"
                }
              />
            </div>
          </SectionWrapper>
        </div>

        {/* Right Column: Files & Submit */}
        <div className="lg:col-span-4 space-y-10">
          {/* Section: Project Files */}
          <SectionWrapper
            title="Project Files"
            onEdit={() => handleEdit(3)}
            icon={<LayoutGrid className="h-4 w-4" />}
          >
            <div className="space-y-6">
              {files.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    {images.map((img) => (
                      <div
                        key={img.id}
                        className="aspect-square rounded-xl border border-white/10 overflow-hidden relative group cursor-pointer"
                        onClick={() => setVaultDrawerOpen(true)}
                      >
                        <Image
                          src={img.previewUrl!}
                          alt={img.fileName}
                          fill
                          unoptimized
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Eye className="h-5 w-5 text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full h-12 rounded-xl border border-white/5 bg-white/2 hover:bg-white/5 font-black uppercase tracking-widest text-[10px] gap-2"
                    onClick={() => setVaultDrawerOpen(true)}
                  >
                    Manage {files.length} Assets
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </>
              ) : (
                <div className="py-8 text-center border-2 border-dashed border-white/5 rounded-2xl">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/10">
                    No files uploaded
                  </p>
                </div>
              )}
            </div>
          </SectionWrapper>

          {/* Ready State */}
          <div className="p-8 rounded-[2.5rem] bg-primary/5 border border-primary/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform duration-500">
              <Check className="h-20 w-20 text-primary" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-2">
              Ready to Submit
            </h3>
            <p className="text-xs font-semibold text-white/40 leading-relaxed mb-6">
              All information looks good. Click submit below to send your
              request to the production queue.
            </p>
            <div className="h-1 w-full bg-primary/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Vault Drawer Integration */}
      <UploadedFilesDrawer
        open={isVaultDrawerOpen}
        onOpenChange={setVaultDrawerOpen}
        onRemoveFile={removeFile}
      />
    </div>
  );
}

// ============================================================================
// Internal Components
// ============================================================================

function SectionWrapper({
  title,
  icon,
  onEdit,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary">
            {icon}
          </div>
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/60">
            {title}
          </h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-4 rounded-lg bg-white/2 hover:bg-primary/10 hover:text-primary border border-white/5 text-[10px] font-black uppercase tracking-widest transition-all"
          onClick={onEdit}
        >
          <Edit2 className="h-3 w-3 mr-2" />
          Modify
        </Button>
      </div>
      <div className="p-8 rounded-[2rem] bg-white/2 border border-white/5 border-dashed relative">
        <div className="absolute inset-0 bg-grid-white/[0.01] bg-size-[20px_20px] rounded-[2rem]" />
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
}

function ReviewData({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-primary/40">{icon}</span>
        <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
          {label}
        </span>
      </div>
      <p className="text-[15px] font-black uppercase tracking-wider text-white">
        {value || "Not Specified"}
      </p>
    </div>
  );
}

function Label({ label }: { label: string }) {
  return (
    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-3">
      {label}
    </div>
  );
}
