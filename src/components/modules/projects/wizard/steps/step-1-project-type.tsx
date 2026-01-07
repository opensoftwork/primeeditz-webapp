/**
 * Wizard Step 1: Project Type & Basic Info
 *
 * Select project type and enter basic event information.
 * Uses TanStack Form with shadcn Field components and Motion animations.
 */

"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Skeleton } from "@/components/ui/skeleton";
import { useWizardForm } from "../wizard-form-context";
import { ProjectTypeSelectionDrawer } from "../project-type-drawer";
import { ArrowRight, CalendarIcon, MapPin, Tag, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function WizardStep1() {
  const {
    formData,
    setFormData,
    nextStep,
    isLoading: wizardLoading,
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
      await nextStep();
    },
  });

  // Handle project type selection from drawer
  const handleProjectTypeSelect = (projectTypeId: string) => {
    form.setFieldValue("projectTypeId", projectTypeId);
  };

  if (!projectTypes) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <>
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
              Basic Information
            </CardTitle>
            <CardDescription className="text-sm">
              Core details about your project request
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldSet>
              <FieldGroup className="space-y-4">
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
                      (pt) => pt._id === field.state.value
                    );
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor="projectType">
                          Project Type{" "}
                          <span className="text-destructive">*</span>
                        </FieldLabel>
                        <FieldContent>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setProjectTypeDrawerOpen(true)}
                            className={cn(
                              "w-full justify-start gap-2",
                              !currentProjectType && "text-muted-foreground"
                            )}
                          >
                            <Tag className="h-4 w-4" />
                            {currentProjectType?.name || "Select project type"}
                          </Button>
                          <FieldDescription className="mt-2">
                            Click to select from available project types
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
                        <FieldLabel htmlFor="endClientName">
                          End Client Name{" "}
                          <span className="text-destructive">*</span>
                        </FieldLabel>
                        <FieldContent>
                          <InputGroup>
                            <InputGroupAddon align="inline-start">
                              <User className="h-4 w-4 text-muted-foreground" />
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
                              autoComplete="off"
                            />
                          </InputGroup>
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
                        <FieldLabel htmlFor="eventName">
                          Event Name <span className="text-destructive">*</span>
                        </FieldLabel>
                        <FieldContent>
                          <InputGroup>
                            <InputGroupAddon align="inline-start">
                              <Tag className="h-4 w-4 text-muted-foreground" />
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
                              autoComplete="off"
                            />
                          </InputGroup>
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

                {/* Event Date - Calendar Popover */}
                <form.Field
                  name="eventDate"
                  children={(field) => {
                    return (
                      <Field>
                        <FieldLabel htmlFor="eventDate">
                          Event Date (Optional)
                        </FieldLabel>
                        <FieldContent>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
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
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FieldDescription className="mt-2">
                            Select the date when your event will take place
                          </FieldDescription>
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
                        <FieldLabel htmlFor="venue">
                          Venue (Optional)
                        </FieldLabel>
                        <FieldContent>
                          <InputGroup>
                            <InputGroupAddon align="inline-start">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                            </InputGroupAddon>
                            <InputGroupInput
                              id="venue"
                              name={field.name}
                              value={field.state.value ?? ""}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              placeholder="e.g., Grand Ballroom, Central Park"
                              autoComplete="off"
                            />
                          </InputGroup>
                          <FieldDescription className="text-xs">
                            Location or venue where the event will be held
                          </FieldDescription>
                        </FieldContent>
                      </Field>
                    );
                  }}
                />
              </FieldGroup>
            </FieldSet>
          </CardContent>
        </Card>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-end pt-6"
        >
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

      {/* Project Type Selection Drawer */}
      <ProjectTypeSelectionDrawer
        open={projectTypeDrawerOpen}
        onOpenChange={setProjectTypeDrawerOpen}
        projectTypes={projectTypes}
        selectedProjectTypeId={form.state.values.projectTypeId}
        onSelect={handleProjectTypeSelect}
      />
    </>
  );
}
