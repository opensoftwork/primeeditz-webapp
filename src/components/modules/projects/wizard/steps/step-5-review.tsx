/**
 * Wizard Step 5: Review & Submit
 *
 * Review all entered information and submit the project request.
 * Uses shadcn Field components and Motion animations for premium UX.
 */

"use client";

import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FieldGroup } from "@/components/ui/field";
import { useWizardForm } from "../wizard-form-context";
import { PROJECT_TYPE_FIELDS } from "../types";
import { formatFileSize } from "@/lib/file";
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
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function WizardStep5() {
  const router = useRouter();
  const {
    formData,
    projectCode,
    goToStep,
    prevStep,
    submitProject,
    isLoading: wizardLoading,
  } = useWizardForm();

  // Get project type name
  const projectType = useQuery(
    api.functions.projectTypes.queries.getProjectType,
    formData.step1.projectTypeId
      ? { projectTypeId: formData.step1.projectTypeId }
      : "skip"
  );

  const handleEdit = (step: 1 | 2 | 3 | 4) => {
    goToStep(step);
  };

  const handlePrev = async () => {
    await prevStep();
  };

  const handleSubmit = async () => {
    const success = await submitProject();
    if (success) {
      toast.success("Project request submitted successfully!");
      router.push("/dashboard");
    }
  };

  // Parse file info
  const parseFileInfo = (fileId: string) => {
    if (fileId.startsWith("pending:")) {
      const parts = fileId.split(":");
      return { name: parts[1] || "Unknown", size: Number(parts[2]) || 0 };
    }
    return { name: fileId, size: 0 };
  };

  // Get dynamic fields for display
  const dynamicFields = projectType
    ? PROJECT_TYPE_FIELDS[projectType.name] ?? []
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <FieldGroup className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-2"
        >
          <h2 className="text-lg font-semibold">Review Your Project Request</h2>
          <p className="text-sm text-muted-foreground">
            Please review all details before submitting
          </p>
        </motion.div>

        {/* Step 1: Basic Info */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ReviewSection
            title="Project Type & Basic Info"
            onEdit={() => handleEdit(1)}
            icon={<Tag className="h-4 w-4" />}
          >
            <dl className="grid gap-3 sm:grid-cols-2">
              <ReviewItem
                icon={<Tag className="h-3.5 w-3.5" />}
                label="Project Type"
                value={projectType?.name ?? <Skeleton className="h-4 w-24" />}
              />
              <ReviewItem
                icon={<User className="h-3.5 w-3.5" />}
                label="End Client"
                value={formData.step1.endClientName || "-"}
              />
              <ReviewItem
                icon={<FileText className="h-3.5 w-3.5" />}
                label="Event Name"
                value={formData.step1.eventName || "-"}
              />
              <ReviewItem
                icon={<Calendar className="h-3.5 w-3.5" />}
                label="Event Date"
                value={
                  formData.step1.eventDate
                    ? format(formData.step1.eventDate, "PPP")
                    : "Not specified"
                }
              />
              <ReviewItem
                icon={<MapPin className="h-3.5 w-3.5" />}
                label="Venue"
                value={formData.step1.venue || "Not specified"}
              />
            </dl>
          </ReviewSection>
        </motion.div>

        {/* Step 2: Project Details */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ReviewSection
            title="Project-Specific Details"
            onEdit={() => handleEdit(2)}
          >
            {dynamicFields.length > 0 ? (
              <dl className="grid gap-3 sm:grid-cols-2">
                {dynamicFields.map((field) => {
                  const value = formData.step2.typeSpecificDetails[field.name];
                  let displayValue: string;

                  if (field.type === "checkbox") {
                    displayValue = value ? "Yes" : "No";
                  } else if (field.type === "select" && field.options) {
                    displayValue =
                      field.options.find((o) => o.value === value)?.label ??
                      String(value ?? "-");
                  } else {
                    displayValue = String(value ?? "-");
                  }

                  return (
                    <ReviewItem
                      key={field.name}
                      label={field.label}
                      value={displayValue}
                    />
                  );
                })}
              </dl>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No additional details required
              </p>
            )}
          </ReviewSection>
        </motion.div>

        {/* Step 3: Reference Files */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <ReviewSection
            title="Reference Files"
            onEdit={() => handleEdit(3)}
            badge={
              formData.step3.referenceFiles.length > 0
                ? `${formData.step3.referenceFiles.length} files`
                : undefined
            }
          >
            {formData.step3.referenceFiles.length > 0 ? (
              <ul className="space-y-2">
                <AnimatePresence>
                  {formData.step3.referenceFiles.map((fileId, index) => {
                    const info = parseFileInfo(fileId);
                    return (
                      <motion.li
                        key={fileId}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-2 text-sm p-2 rounded-md bg-muted/50"
                      >
                        <FileIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate flex-1">{info.name}</span>
                        {info.size > 0 && (
                          <span className="text-muted-foreground text-xs">
                            {formatFileSize(info.size)}
                          </span>
                        )}
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No files uploaded
              </p>
            )}
          </ReviewSection>
        </motion.div>

        {/* Step 4: Description */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <ReviewSection
            title="Description & Notes"
            onEdit={() => handleEdit(4)}
          >
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-1 text-muted-foreground">
                  Description
                </h4>
                <p className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded-lg">
                  {formData.step4.description || "-"}
                </p>
              </div>
              {formData.step4.additionalNotes && (
                <div>
                  <h4 className="text-sm font-medium mb-1 text-muted-foreground">
                    Additional Notes
                  </h4>
                  <p className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded-lg">
                    {formData.step4.additionalNotes}
                  </p>
                </div>
              )}
              <ReviewItem
                icon={<Calendar className="h-3.5 w-3.5" />}
                label="Preferred Delivery Date"
                value={
                  formData.step4.preferredDeliveryDate
                    ? format(formData.step4.preferredDeliveryDate, "PPP")
                    : "Not specified"
                }
              />
            </div>
          </ReviewSection>
        </motion.div>

        {/* Project Code */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-linear-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-6 text-center"
        >
          <p className="text-sm text-muted-foreground mb-1">
            Your Project Code
          </p>
          <motion.p
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="text-2xl font-mono font-bold text-primary"
          >
            {projectCode}
          </motion.p>
          <p className="text-xs text-muted-foreground mt-2">
            Save this code for your records
          </p>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex justify-between pt-4"
        >
          <Button
            type="button"
            variant="outline"
            onClick={handlePrev}
            disabled={wizardLoading}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={wizardLoading}
            size="lg"
            className="min-w-[160px] bg-linear-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
          >
            {wizardLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Submit Request
              </>
            )}
          </Button>
        </motion.div>
      </FieldGroup>
    </motion.div>
  );
}

// ============================================================================
// Helper Components
// ============================================================================

interface ReviewSectionProps {
  title: string;
  onEdit: () => void;
  icon?: React.ReactNode;
  badge?: string;
  children: React.ReactNode;
}

function ReviewSection({
  title,
  onEdit,
  icon,
  badge,
  children,
}: ReviewSectionProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3 bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle className="text-base">{title}</CardTitle>
            {badge && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {badge}
              </span>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="hover:bg-primary/10 hover:text-primary"
          >
            <Edit2 className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4">{children}</CardContent>
    </Card>
  );
}

interface ReviewItemProps {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

function ReviewItem({ icon, label, value }: ReviewItemProps) {
  return (
    <div className="flex items-start gap-2">
      {icon && <span className="text-muted-foreground mt-0.5">{icon}</span>}
      <div>
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd
          className={cn(
            "text-sm font-medium",
            !value && "text-muted-foreground"
          )}
        >
          {value}
        </dd>
      </div>
    </div>
  );
}
