/**
 * Wizard Step 4: Description & Additional Notes
 *
 * Add project description, notes, and preferred delivery date.
 * Uses TanStack Form with shadcn Field components and Motion animations.
 */

"use client";

import { useState, useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { format } from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useWizardForm } from "../wizard-form-context";
import { FileText, MessageSquare, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function WizardStep4() {
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
  const step4Data = formData.step4;

  // TanStack Form setup with field-level validation
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

  // Register submit trigger for the global footer
  useEffect(() => {
    setSubmitTrigger(() => form.handleSubmit());
    return () => setSubmitTrigger(null);
  }, [form, setSubmitTrigger]);

  return (
    <div className="w-full space-y-10">
      {/* Header Section */}
      <div className="space-y-2">
        <h2 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-3">
          Description & Delivery
          <Badge
            variant="outline"
            className="ml-2 border-primary/20 text-primary uppercase text-[10px] tracking-widest font-black py-0.5"
          >
            Stage 04
          </Badge>
        </h2>
        <p className="text-sm font-medium text-white/20 max-w-lg">
          Tell us more about your project vision and delivery requirements.
        </p>
      </div>

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
              {/* Description Field */}
              <form.Field
                name="description"
                validators={{
                  onChange: ({ value }) =>
                    !value || value.length < 10
                      ? "Project description required (min 10 chars)"
                      : undefined,
                }}
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched &&
                    field.state.meta.errors.length > 0;
                  return (
                    <Field data-invalid={isInvalid}>
                      <div className="flex items-center justify-between mb-3">
                        <FieldLabel className="text-sm font-black uppercase tracking-widest text-white/60 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Project Description{" "}
                          <span className="text-primary ml-1">*</span>
                        </FieldLabel>

                        <div className="text-[10px] font-mono text-white/10 flex items-center gap-2">
                          <span
                            className={cn(
                              "transition-colors",
                              field.state.value.length >= 10
                                ? "text-primary/40"
                                : "text-destructive/40"
                            )}
                          >
                            {field.state.value.length}
                          </span>
                          <span>/</span>
                          <span>10+</span>
                        </div>
                      </div>

                      <FieldContent>
                        <Textarea
                          id="description"
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="Describe the creative vision, specific requirements, and overall vibe you want to achieve..."
                          className="min-h-[160px] p-6 text-[15px] font-bold text-white bg-white/3 border-white/10 focus:border-primary/40 focus:ring-primary/20 transition-all rounded-2xl resize-none placeholder:text-white/10"
                        />

                        <AnimatePresence>
                          {isInvalid && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="mt-4 text-[10px] font-black uppercase tracking-widest text-destructive flex items-center gap-2"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                              {field.state.meta.errors[0]}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </FieldContent>
                    </Field>
                  );
                }}
              />

              <div className="grid gap-x-8 gap-y-10 md:grid-cols-2">
                {/* Additional Notes Field */}
                <form.Field
                  name="additionalNotes"
                  children={(field) => {
                    return (
                      <Field>
                        <FieldLabel className="text-sm font-black uppercase tracking-widest text-white/60 mb-3 flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Internal Notes
                        </FieldLabel>
                        <FieldContent>
                          <Textarea
                            id="additionalNotes"
                            name={field.name}
                            value={field.state.value ?? ""}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="Any secondary instructions (Optional)..."
                            className="min-h-[120px] p-6 text-[15px] font-bold text-white bg-white/3 border-white/10 focus:border-primary/40 focus:ring-primary/20 transition-all rounded-2xl resize-none placeholder:text-white/10"
                          />
                        </FieldContent>
                      </Field>
                    );
                  }}
                />

                {/* Preferred Delivery Date Field */}
                <form.Field
                  name="preferredDeliveryDate"
                  children={(field) => {
                    return (
                      <Field>
                        <FieldLabel className="text-sm font-black uppercase tracking-widest text-white/60 mb-3 flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4" />
                          Delivery Date
                        </FieldLabel>
                        <FieldContent className="flex flex-col h-full">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                type="button"
                                className={cn(
                                  "w-full h-full min-h-[120px] flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-white/5 bg-white/2 hover:bg-white/4 hover:border-primary/20 transition-all duration-500 group",
                                  field.state.value &&
                                    "border-solid border-primary/20 bg-primary/5"
                                )}
                              >
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform duration-500">
                                  <CalendarIcon
                                    className={cn(
                                      "h-6 w-6",
                                      field.state.value
                                        ? "text-primary"
                                        : "text-white/20"
                                    )}
                                  />
                                </div>
                                <div className="text-center space-y-1">
                                  <span
                                    className={cn(
                                      "block text-xs font-black uppercase tracking-widest transition-colors",
                                      field.state.value
                                        ? "text-white"
                                        : "text-white/20"
                                    )}
                                  >
                                    {field.state.value
                                      ? format(field.state.value, "PPP")
                                      : "Set Target Date"}
                                  </span>
                                </div>
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0 bg-background border-white/10 rounded-2xl shadow-2xl"
                              align="end"
                            >
                              <Calendar
                                mode="single"
                                selected={
                                  field.state.value
                                    ? new Date(field.state.value)
                                    : undefined
                                }
                                onSelect={(date) =>
                                  field.handleChange(date?.getTime() ?? null)
                                }
                                disabled={(date) => date < new Date()}
                                initialFocus
                                className="p-3"
                              />
                            </PopoverContent>
                          </Popover>
                        </FieldContent>
                      </Field>
                    );
                  }}
                />
              </div>
            </FieldGroup>
          </FieldSet>
        </div>
      </form>
    </div>
  );
}
