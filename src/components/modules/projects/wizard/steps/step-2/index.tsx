/**
 * Wizard Step 2: Project-Specific Details
 *
 * Dynamic form fields based on selected project type.
 * Fetches field definitions from the database for flexible admin configuration.
 * Uses modular field components and AlbumConfigField for album-based projects.
 */

"use client";

import { useForm } from "@tanstack/react-form";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldGroup, FieldSet } from "@/components/ui/field";
import { useWizardForm } from "../../wizard-form-context";
import {
  hasAlbumConfig,
  filterAlbumFields,
} from "@/components/shared/dynamic-form-fields";
import { ArrowLeft, ArrowRight, Layers } from "lucide-react";
import { LoadingState } from "./loading-state";
import { NoProjectTypeState } from "./no-project-type-state";
import { NoFieldsState } from "./no-fields-state";
import { FormFieldWrapper } from "./form-field-wrapper";
import { AlbumConfigSection } from "./album-config-section";

export function WizardStep2() {
  const {
    formData,
    setFormData,
    nextStep,
    prevStep,
    isLoading: wizardLoading,
  } = useWizardForm();
  const step2Data = formData.step2;

  const projectType = useQuery(
    api.functions.projectTypes.queries.getProjectType,
    formData.step1.projectTypeId
      ? { projectTypeId: formData.step1.projectTypeId }
      : "skip"
  );

  const dbFields = useQuery(
    api.functions.projectTypeFields.queries.getFieldsByProjectType,
    formData.step1.projectTypeId
      ? { projectTypeId: formData.step1.projectTypeId }
      : "skip"
  );

  const isAlbumProject = dbFields ? hasAlbumConfig(dbFields) : false;
  const displayFields = dbFields ? filterAlbumFields(dbFields) : [];

  const form = useForm({
    defaultValues: {
      ...(step2Data.typeSpecificDetails as Record<string, unknown>),
      sheetsPerAlbum:
        (step2Data.typeSpecificDetails?.sheetsPerAlbum as number[]) ?? [],
    },
    onSubmit: async ({ value }) => {
      setFormData("step2", { typeSpecificDetails: value });
      await nextStep();
    },
  });

  const handlePrev = async () => {
    setFormData("step2", { typeSpecificDetails: form.state.values });
    await prevStep();
  };

  if (
    (dbFields === undefined || projectType === undefined) &&
    formData.step1.projectTypeId
  )
    return <LoadingState />;
  if (!projectType) return <NoProjectTypeState onBack={handlePrev} />;
  if (!dbFields || dbFields.length === 0) {
    return (
      <NoFieldsState
        projectTypeName={projectType.name}
        onPrev={handlePrev}
        onNext={nextStep}
        isLoading={wizardLoading}
      />
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="space-y-6"
    >
      <Card className="border border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="pb-4 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Layers className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">
                {projectType.name} Details
              </CardTitle>
              <CardDescription className="text-sm">
                Provide specific details for your project
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <FieldSet>
            <FieldGroup className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                {displayFields.map((fieldDef, index) => (
                  <motion.div
                    key={fieldDef._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className={
                      fieldDef.type === "textarea" ? "md:col-span-2" : ""
                    }
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
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrev}
          disabled={wizardLoading}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        <Button
          type="submit"
          disabled={wizardLoading}
          className="min-w-[120px]"
        >
          Next <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </motion.form>
  );
}
