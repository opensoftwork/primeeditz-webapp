"use client";

import { useForm } from "@tanstack/react-form";
import { useEffect } from "react";
import { FieldGroup, FieldSet } from "@/components/ui/field";
import { useWizardForm } from "../../wizard-form-context";
import { DeliveryNotesFields } from "./delivery-notes-fields";
import { DescriptionField } from "./description-field";
import { Step4Header } from "./header";

export function WizardStep4() {
  const {
    formData,
    setFormData,
    nextStep,
    goToStep,
    isReviewing,
    setReviewing,
    setSubmitTrigger,
  } = useWizardForm();
  const step4Data = formData.step4;

  const form = useForm({
    defaultValues: {
      description: step4Data.description,
      additionalNotes: step4Data.additionalNotes,
      preferredDeliveryDate: step4Data.preferredDeliveryDate,
    },
    onSubmit: async ({ value }) => {
      setFormData("step4", {
        description: value.description,
        additionalNotes: value.additionalNotes ?? "",
        preferredDeliveryDate: value.preferredDeliveryDate ?? null,
      });
      if (isReviewing) {
        setReviewing(false);
        await goToStep(5);
      } else {
        await nextStep();
      }
    },
  });

  useEffect(() => {
    setSubmitTrigger(() => form.handleSubmit());
    return () => setSubmitTrigger(null);
  }, [form, setSubmitTrigger]);

  return (
    <div className="w-full space-y-10">
      <Step4Header />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="w-full flex flex-col h-full"
      >
        <div className="flex-1">
          <FieldSet className="w-full border-none p-0">
            <FieldGroup className="space-y-10">
              <DescriptionField form={form} />
              <DeliveryNotesFields form={form} />
            </FieldGroup>
          </FieldSet>
        </div>
      </form>
    </div>
  );
}
