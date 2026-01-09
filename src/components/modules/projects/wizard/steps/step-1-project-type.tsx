/**
 * Wizard Step 1: Project Type & Basic Info
 *
 * Select project type and enter basic event information.
 * Uses TanStack Form with shadcn Field components and Motion animations.
 */

"use client";

import { useState, useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { format } from "date-fns";
import { motion } from "motion/react";
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
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { WizardLoadingState } from "../wizard-loading-state";
import { useWizardForm } from "../wizard-form-context";
import { ProjectTypeSelectionDrawer } from "../project-type-drawer";
import { ArrowRight, CalendarIcon, MapPin, Tag, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function WizardStep1() {
  const {
    formData,
    setFormData,
    nextStep,
    goToStep,
    isLoading: wizardLoading,
    isReviewing,
    setReviewing,
    setSubmitTrigger,
  } = useWizardForm();
  const step1Data = formData.step1;
  const [projectTypeDrawerOpen, setProjectTypeDrawerOpen] = useState(false);

  // Fetch project types from Convex
  const projectTypes = useQuery(
    api.functions.projectTypes.queries.getActiveProjectTypes
  );

  // TanStack Form setup with field-level validation
  const form = useForm({
    defaultValues: {
      projectTypeId: (step1Data.projectTypeId as string) ?? "",
      endClientName: step1Data.endClientName,
      eventName: step1Data.eventName,
      eventDate: step1Data.eventDate,
      venue: step1Data.venue,
    },
    onSubmit: async ({ value }) => {
      // Update wizard context
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

  // Handle project type selection from drawer
  const handleProjectTypeSelect = (projectTypeId: string) => {
    form.setFieldValue("projectTypeId", projectTypeId);
  };

  // Register submit trigger for the global footer
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
          <div className="mb-8 space-y-1">
            <h2 className="text-xl font-black tracking-tight uppercase text-white">
              Basic Information
            </h2>
            <p className="text-sm text-white/40 font-medium">
              Core details about your project request
            </p>
          </div>

          <div className="w-full">
            <FieldSet className="w-full border-none p-0">
              <FieldGroup className="space-y-10">
                <div className="grid gap-x-8 gap-y-10 md:grid-cols-2">
                  {/* Project Type - Opens Drawer */}
                  <form.Field
                    name="projectTypeId"
                    validators={{
                      onChange: ({ value }) =>
                        !value ? "Please select a project type" : undefined,
                    }}
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched &&
                        field.state.meta.errors.length > 0;
                      // Use the form field value to find the selected project type
                      const currentProjectType = projectTypes?.find(
                        (pt: { _id: string; name: string }) =>
                          pt._id === field.state.value
                      );
                      return (
                        <Field
                          data-invalid={isInvalid}
                          className="md:col-span-2"
                        >
                          <FieldLabel className="text-sm font-black uppercase tracking-widest text-white/60 mb-3 flex items-center">
                            Project Type{" "}
                            <span className="text-primary ml-1.5">*</span>
                          </FieldLabel>
                          <FieldContent>
                            <Button
                              type="button"
                              className={cn(
                                "w-full h-12 justify-start gap-4 rounded-xl border border-white/10 bg-white/3 hover:bg-white/5 hover:border-white/20 transition-all duration-300 font-black uppercase tracking-wider px-4",
                                currentProjectType
                                  ? "text-white"
                                  : "text-white/20"
                              )}
                              onClick={() => setProjectTypeDrawerOpen(true)}
                            >
                              <Tag className="h-4 w-4 text-primary" />
                              <span className="text-[15px]">
                                {currentProjectType?.name ||
                                  "Select project type"}
                              </span>
                            </Button>
                            {isInvalid && (
                              <FieldError className="mt-2 ml-1">
                                {field.state.meta.errors.join(", ")}
                              </FieldError>
                            )}
                          </FieldContent>
                        </Field>
                      );
                    }}
                  />

                  {/* End Client Name */}
                  <form.Field
                    name="endClientName"
                    validators={{
                      onChange: ({ value }) =>
                        !value || value.length < 2
                          ? "Client name must be at least 2 characters"
                          : undefined,
                    }}
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched &&
                        field.state.meta.errors.length > 0;
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel className="text-sm font-black uppercase tracking-widest text-white/60 mb-3 flex items-center">
                            End Client Name{" "}
                            <span className="text-primary ml-1.5">*</span>
                          </FieldLabel>
                          <FieldContent>
                            <InputGroup className="bg-white/3 border-white/10 focus-within:border-primary/40 transition-all duration-500 rounded-xl h-12">
                              <InputGroupAddon
                                align="inline-start"
                                className="pl-4"
                              >
                                <User className="h-4 w-4 text-white/10" />
                              </InputGroupAddon>
                              <InputGroupInput
                                id="endClientName"
                                name={field.name}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) =>
                                  field.handleChange(e.target.value)
                                }
                                aria-invalid={isInvalid}
                                placeholder="e.g., John & Jane"
                                className="text-[15px] font-black uppercase tracking-wider text-white placeholder:text-white/10"
                              />
                            </InputGroup>
                            {isInvalid && (
                              <FieldError className="mt-2 ml-1">
                                {field.state.meta.errors.join(", ")}
                              </FieldError>
                            )}
                          </FieldContent>
                        </Field>
                      );
                    }}
                  />

                  {/* Event Name */}
                  <form.Field
                    name="eventName"
                    validators={{
                      onChange: ({ value }) =>
                        !value || value.length < 2
                          ? "Event name must be at least 2 characters"
                          : undefined,
                    }}
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched &&
                        field.state.meta.errors.length > 0;
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel className="text-sm font-black uppercase tracking-widest text-white/60 mb-3 flex items-center">
                            Event Name{" "}
                            <span className="text-primary ml-1.5">*</span>
                          </FieldLabel>
                          <FieldContent>
                            <InputGroup className="bg-white/3 border-white/10 focus-within:border-primary/40 transition-all duration-500 rounded-xl h-12">
                              <InputGroupAddon
                                align="inline-start"
                                className="pl-4"
                              >
                                <Tag className="h-4 w-4 text-white/10" />
                              </InputGroupAddon>
                              <InputGroupInput
                                id="eventName"
                                name={field.name}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) =>
                                  field.handleChange(e.target.value)
                                }
                                aria-invalid={isInvalid}
                                placeholder="e.g., Smith Wedding"
                                className="text-[15px] font-black uppercase tracking-wider text-white placeholder:text-white/10"
                              />
                            </InputGroup>
                            {isInvalid && (
                              <FieldError className="mt-2 ml-1">
                                {field.state.meta.errors.join(", ")}
                              </FieldError>
                            )}
                          </FieldContent>
                        </Field>
                      );
                    }}
                  />

                  {/* Event Date - Calendar Popover */}
                  <form.Field
                    name="eventDate"
                    children={(field) => {
                      return (
                        <Field>
                          <FieldLabel className="text-sm font-black uppercase tracking-widest text-white/60 mb-3 flex items-center">
                            Event Date (Optional)
                          </FieldLabel>
                          <FieldContent>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className={cn(
                                    "w-full h-12 justify-start text-left font-black uppercase tracking-wider rounded-xl border-white/10 bg-white/3 hover:bg-white/5 hover:border-white/20 transition-all duration-300 px-4",
                                    !field.state.value && "text-white/20"
                                  )}
                                >
                                  <CalendarIcon className="mr-3 h-4 w-4 text-white/10" />
                                  <span className="text-[15px]">
                                    {field.state.value
                                      ? format(field.state.value, "PPP")
                                      : "Pick a date"}
                                  </span>
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0 bg-background border-white/10 rounded-2xl shadow-2xl"
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
                                  className="p-3"
                                />
                              </PopoverContent>
                            </Popover>
                          </FieldContent>
                        </Field>
                      );
                    }}
                  />

                  {/* Venue */}
                  <form.Field
                    name="venue"
                    children={(field) => {
                      return (
                        <Field>
                          <FieldLabel className="text-sm font-black uppercase tracking-widest text-white/60 mb-3 flex items-center">
                            Venue (Optional)
                          </FieldLabel>
                          <FieldContent>
                            <InputGroup className="bg-white/3 border-white/10 focus-within:border-primary/40 transition-all duration-500 rounded-xl h-12">
                              <InputGroupAddon
                                align="inline-start"
                                className="pl-4"
                              >
                                <MapPin className="h-4 w-4 text-white/10" />
                              </InputGroupAddon>
                              <InputGroupInput
                                id="venue"
                                name={field.name}
                                value={field.state.value ?? ""}
                                onBlur={field.handleBlur}
                                onChange={(e) =>
                                  field.handleChange(e.target.value)
                                }
                                placeholder="e.g., Grand Ballroom"
                                className="text-[15px] font-black uppercase tracking-wider text-white placeholder:text-white/10"
                              />
                            </InputGroup>
                          </FieldContent>
                        </Field>
                      );
                    }}
                  />
                </div>
              </FieldGroup>
            </FieldSet>
          </div>
        </div>
      </form>

      {/* Project Type Selection Drawer */}
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
