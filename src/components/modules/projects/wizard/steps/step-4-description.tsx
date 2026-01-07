/**
 * Wizard Step 4: Description & Additional Notes
 *
 * Add project description, notes, and preferred delivery date.
 * Uses TanStack Form with shadcn Field components and Motion animations.
 */

"use client";

import { useForm } from "@tanstack/react-form";
import { format } from "date-fns";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { InputGroup, InputGroupTextarea } from "@/components/ui/input-group";
import { useWizardForm } from "../wizard-form-context";
import {
  ArrowLeft,
  ArrowRight,
  CalendarIcon,
  FileText,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function WizardStep4() {
  const {
    formData,
    setFormData,
    nextStep,
    prevStep,
    isLoading: wizardLoading,
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
      await nextStep();
    },
  });

  const handlePrev = async () => {
    // Save current data before going back
    setFormData("step4", {
      description: form.state.values.description,
      additionalNotes: form.state.values.additionalNotes ?? "",
      preferredDeliveryDate: form.state.values.preferredDeliveryDate ?? null,
    });
    await prevStep();
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <Card className="border border-border/50 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">
            Description & Notes
          </CardTitle>
          <CardDescription className="text-sm">
            Tell us more about your project vision
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldSet>
            <FieldGroup className="space-y-4">
              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <form.Field
                  name="description"
                  validators={{
                    onChange: ({ value }) =>
                      !value || value.length < 10
                        ? "Description must be at least 10 characters"
                        : undefined,
                  }}
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched &&
                      field.state.meta.errors.length > 0;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor="description">
                          Project Description{" "}
                          <span className="text-destructive">*</span>
                        </FieldLabel>
                        <FieldContent>
                          <InputGroup className="focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-200">
                            <InputGroupTextarea
                              id="description"
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              aria-invalid={isInvalid}
                              placeholder="Describe your project in detail. Include any specific requirements, style preferences, or vision you have in mind..."
                              className="min-h-[150px] resize-y text-sm"
                              data-slot="input-group-control"
                            />
                          </InputGroup>
                          <FieldDescription className="mt-2 flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            Be as detailed as possible to help our team
                            understand your requirements
                          </FieldDescription>
                          {isInvalid && (
                            <FieldError>
                              {field.state.meta.errors.join(", ")}
                            </FieldError>
                          )}
                        </FieldContent>
                      </Field>
                    );
                  }}
                />
              </motion.div>

              {/* Additional Notes */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <form.Field
                  name="additionalNotes"
                  children={(field) => {
                    return (
                      <Field>
                        <FieldLabel htmlFor="additionalNotes">
                          Additional Notes (Optional)
                        </FieldLabel>
                        <FieldContent>
                          <InputGroup className="focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-200">
                            <InputGroupTextarea
                              id="additionalNotes"
                              name={field.name}
                              value={field.state.value ?? ""}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              placeholder="Any special instructions, preferences, or notes for our team..."
                              className="min-h-[100px] resize-y text-sm"
                              data-slot="input-group-control"
                            />
                          </InputGroup>
                          <FieldDescription className="mt-2 flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            Include any other information that might be helpful
                          </FieldDescription>
                        </FieldContent>
                      </Field>
                    );
                  }}
                />
              </motion.div>

              {/* Preferred Delivery Date - Calendar Popover */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <form.Field
                  name="preferredDeliveryDate"
                  children={(field) => {
                    return (
                      <Field>
                        <FieldLabel htmlFor="deliveryDate">
                          Preferred Delivery Date (Optional)
                        </FieldLabel>
                        <FieldContent>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                className={cn(
                                  "w-full max-w-xs justify-start text-left font-normal",
                                  !field.state.value && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.state.value
                                  ? format(field.state.value, "PPP")
                                  : "Pick a date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
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
                              />
                            </PopoverContent>
                          </Popover>
                          <FieldDescription className="mt-2">
                            Let us know your deadline. Actual delivery will be
                            confirmed in the quotation.
                          </FieldDescription>
                        </FieldContent>
                      </Field>
                    );
                  }}
                />
              </motion.div>
            </FieldGroup>
          </FieldSet>
        </CardContent>
      </Card>

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex justify-between pt-6"
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
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              disabled={!canSubmit || isSubmitting || wizardLoading}
              className="min-w-[120px]"
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        />
      </motion.div>
    </motion.form>
  );
}
