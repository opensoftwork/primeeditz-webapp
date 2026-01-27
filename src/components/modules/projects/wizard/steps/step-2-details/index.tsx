/**
 * Wizard Step 2: Project-Specific Details
 *
 * Dynamic form fields based on selected project type.
 * Fetches field definitions from the database for flexible admin configuration.
 * Uses modular field components and AlbumConfigField for album-based projects.
 */

"use client";

import { api } from "@convex/_generated/api";
import { useForm } from "@tanstack/react-form";
import { useQuery } from "convex/react";
import { ArrowLeft, ArrowRight, Layers } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import {
  type FieldValue,
  filterAlbumFields,
  hasAlbumConfig,
} from "@/components/shared/dynamic-form-fields";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldGroup, FieldSet } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { useWizardForm } from "../../wizard-form-context";
import { WizardLoadingState } from "../../wizard-loading-state";
import { AlbumConfigSection } from "./album-config-section";
import { FormFieldWrapper } from "./form-field-wrapper";
import { NoFieldsState } from "./no-fields-state";
import { NoProjectTypeState } from "./no-project-type-state";

export function WizardStep2() {
  const {
    formData,
    setFormData,
    nextStep,
    prevStep,
    goToStep,
    isLoading: wizardLoading,
    isReviewing,
    setReviewing,
    setSubmitTrigger,
  } = useWizardForm();
  const step2Data = formData.step2;

  const projectType = useQuery(
    api.functions.projectTypes.queries.getProjectType,
    formData.step1.projectTypeId
      ? { projectTypeId: formData.step1.projectTypeId }
      : "skip",
  );

  const dbFields = useQuery(
    api.functions.projectTypeFields.queries.getFieldsByProjectType,
    formData.step1.projectTypeId
      ? { projectTypeId: formData.step1.projectTypeId }
      : "skip",
  );

  const isAlbumProject = dbFields ? hasAlbumConfig(dbFields) : false;
  const displayFields = dbFields ? filterAlbumFields(dbFields) : [];

  const form = useForm({
    defaultValues: {
      ...(step2Data.typeSpecificDetails as Record<string, FieldValue>),
      sheetsPerAlbum:
        (step2Data.typeSpecificDetails?.sheetsPerAlbum as number[]) ?? [],
    },
    onSubmit: async ({ value }) => {
      setFormData("step2", {
        typeSpecificDetails: value as Record<string, FieldValue>,
      });
      if (isReviewing) {
        setReviewing(false);
        await goToStep(5);
      } else {
        await nextStep();
      }
    },
  });

  const isLoading =
    (dbFields === undefined || projectType === undefined) &&
    formData.step1.projectTypeId;

  // Register submit trigger for the global footer
  useEffect(() => {
    setSubmitTrigger(() => form.handleSubmit());
    return () => setSubmitTrigger(null);
  }, [form, setSubmitTrigger]);

  const handlePrev = async () => {
    setFormData("step2", {
      typeSpecificDetails: form.state.values as Record<string, FieldValue>,
    });
    await prevStep();
  };

  return (
    <WizardLoadingState isLoading={!!isLoading}>
      {!projectType ? (
        <NoProjectTypeState onBack={handlePrev} />
      ) : !dbFields || dbFields.length === 0 ? (
        <NoFieldsState
          projectTypeName={projectType.name}
          onPrev={handlePrev}
          onNext={nextStep}
          isLoading={wizardLoading}
        />
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="w-full flex flex-col h-full"
        >
          <div className="flex-1">
            <div className="mb-8 space-y-1">
              <h2 className="text-xl font-black tracking-tight uppercase">
                {projectType.name} Configuration
              </h2>
              <p className="text-sm text-white/40 font-medium">
                Customize specific parameters for your{" "}
                {projectType.name.toLowerCase()} project
              </p>
            </div>

            <FieldSet className="w-full border-none p-0">
              <FieldGroup className="space-y-8">
                <div className="grid gap-x-8 gap-y-10 md:grid-cols-2">
                  {displayFields.map((fieldDef, index) => (
                    <motion.div
                      key={fieldDef._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className={cn(
                        "w-full",
                        fieldDef.type === "textarea" ? "md:col-span-2" : "",
                      )}
                    >
                      <FormFieldWrapper
                        form={form}
                        fieldDef={fieldDef}
                        isAlbumCountField={
                          isAlbumProject && fieldDef.name === "albumCount"
                        }
                      />
                    </motion.div>
                  ))}
                </div>

                {isAlbumProject && (
                  <form.Subscribe
                    selector={(state) =>
                      (state.values as Record<string, unknown>)
                        .albumCount as number
                    }
                    children={(albumCount) => (
                      <AlbumConfigSection
                        form={form}
                        albumCount={albumCount ?? 0}
                      />
                    )}
                  />
                )}
              </FieldGroup>
            </FieldSet>
          </div>
        </form>
      )}
    </WizardLoadingState>
  );
}
