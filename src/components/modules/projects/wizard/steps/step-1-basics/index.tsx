"use client";

import { useState, useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import type { Id } from "@convex/_generated/dataModel";
import { FieldGroup, FieldSet } from "@/components/ui/field";
import { WizardLoadingState } from "../../wizard-loading-state";
import { useWizardForm } from "../../wizard-form-context";
import { ProjectTypeSelectionDrawer } from "../../project-type-drawer";
import { Step1Header } from "./header";
import { ProjectTypeField } from "./project-type-field";
import { ClientEventFields } from "./client-event-fields";
import { DateVenueFields } from "./date-venue-fields";

export function WizardStep1() {
  const {
    mode,
    formData,
    setFormData,
    nextStep,
    goToStep,
    isReviewing,
    setReviewing,
    setSubmitTrigger,
    projectTypes,
  } = useWizardForm();

  const step1Data = formData.step1;
  const step0Data = formData.step0;
  const [projectTypeDrawerOpen, setProjectTypeDrawerOpen] = useState(false);

  // Pre-fill endClientName if client is selected in Step 0 (Admin Mode)
  const isClientSelectedOrNew =
    mode === "admin" &&
    (step0Data.selectionMode === "existing" || step0Data.selectionMode === "new") &&
    !!step0Data.clientData;

  const preFilledEndClientName = isClientSelectedOrNew
    ? step0Data.clientData?.name
    : step1Data.endClientName;

  const form = useForm({
    defaultValues: {
      projectTypeId: (step1Data.projectTypeId as string) ?? "",
      endClientName: preFilledEndClientName ?? "",
      eventName: step1Data.eventName,
      eventDate: step1Data.eventDate,
      venue: step1Data.venue,
    },
    onSubmit: async ({ value }) => {
      setFormData("step1", {
        projectTypeId: value.projectTypeId as Id<"projectTypes">,
        endClientName: value.endClientName,
        eventName: value.eventName,
        eventDate: value.eventDate ?? null,
        venue: value.venue ?? "",
      });
      if (isReviewing) {
        setReviewing(false);
        await goToStep(5);
      } else {
        await nextStep();
      }
    },
  });

  // Sync endClientName if it changes in step0 (though step0 usually happens before step1)
  useEffect(() => {
    if (isClientSelectedOrNew && step0Data.clientData?.name) {
      if (form.getFieldValue("endClientName") !== step0Data.clientData.name) {
        form.setFieldValue("endClientName", step0Data.clientData.name);
      }
    }
  }, [isClientSelectedOrNew, step0Data.clientData?.name, form]);

  const handleProjectTypeSelect = (projectTypeId: string) => {
    form.setFieldValue("projectTypeId", projectTypeId);
  };

  useEffect(() => {
    setSubmitTrigger(() => form.handleSubmit());
    return () => setSubmitTrigger(null);
  }, [form, setSubmitTrigger]);

  return (
    <WizardLoadingState isLoading={!projectTypes}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="w-full flex flex-col h-full"
      >
        <div className="flex-1">
          <Step1Header />

          <div className="w-full">
            <FieldSet className="w-full border-none p-0">
              <FieldGroup className="space-y-10">
                <div className="grid gap-x-8 gap-y-10 md:grid-cols-2">
                  <form.Field
                    name="projectTypeId"
                    validators={{
                      onChange: ({ value }) =>
                        !value ? "Please select a project type" : undefined,
                    }}
                    children={(field) => (
                      <ProjectTypeField
                        field={field}
                        projectTypes={projectTypes!}
                        onOpenDrawer={() => setProjectTypeDrawerOpen(true)}
                      />
                    )}
                  />

                  <ClientEventFields
                    form={form}
                    mode={mode}
                    isClientSelectedOrNew={isClientSelectedOrNew}
                    selectionMode={step0Data.selectionMode}
                  />
                  <DateVenueFields form={form} />
                </div>
              </FieldGroup>
            </FieldSet>
          </div>
        </div>
      </form>

      <ProjectTypeSelectionDrawer
        open={projectTypeDrawerOpen}
        onOpenChange={setProjectTypeDrawerOpen}
        projectTypes={projectTypes}
        selectedProjectTypeId={form.state.values.projectTypeId}
        onSelect={handleProjectTypeSelect}
      />
    </WizardLoadingState>
  );
}
