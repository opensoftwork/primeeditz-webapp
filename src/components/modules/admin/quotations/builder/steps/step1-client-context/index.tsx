/**
 * Quotation Builder Step 1: Studio & Context
 */

"use client";

import { useForm } from "@tanstack/react-form";
import { format } from "date-fns";
import { Calendar as CalendarIcon, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { toast } from "sonner";
import type { Studio } from "@/components/modules/admin/studio/studio-data-table";
import { StudioDataTable } from "@/components/modules/admin/studio/studio-data-table";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useQuotationBuilder } from "../../quotation-builder-context";

export function Step1StudioContext() {
  const { formData, setFormData, nextStep, selectedStudio, setSubmitTrigger } =
    useQuotationBuilder();

  const step1Data = formData.step1;

  // TanStack Form setup
  const form = useForm({
    defaultValues: {
      studioId: step1Data.studioId,
      validUntil: step1Data.validUntil,
    },
    onSubmit: async ({ value }) => {
      setFormData("step1", {
        studioId: value.studioId,
        validUntil: value.validUntil ?? undefined,
      });
      nextStep();
    },
  });

  // Register submit trigger for the global footer
  useEffect(() => {
    setSubmitTrigger(() => form.handleSubmit());
    return () => setSubmitTrigger(null);
  }, [form, setSubmitTrigger]);

  // Handle client selection from table
  const handleClientSelect = (studio: Studio) => {
    form.setFieldValue("studioId", studio._id);
    setFormData("step1", { studioId: studio._id });
    toast.success(`Selected ${studio.name}`);
  };

  return (
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
            Studio & Context
          </h2>
          <p className="text-sm text-white/40 font-medium">
            Select the strategic studio and configure project context
          </p>
        </div>

        <div className="w-full space-y-8">
          {/* Client Selection */}
          <FieldSet className="w-full border-none p-0">
            <FieldGroup className="space-y-6">
              <form.Field
                name="studioId"
                validators={{
                  onChange: ({ value }) =>
                    !value ? "Please select a client" : undefined,
                }}
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched &&
                    field.state.meta.errors.length > 0;
                  return (
                    <Field data-invalid={isInvalid}>
                      <div className="flex items-center justify-between mb-4">
                        <FieldLabel className="text-sm font-black uppercase tracking-widest text-white/60 flex items-center">
                          Select Studio{" "}
                          <span className="text-primary ml-1.5">*</span>
                        </FieldLabel>
                        {field.state.value && (
                          <motion.div
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20"
                          >
                            <CheckCircle2 className="h-3 w-3 text-primary" />
                            <span className="text-[8px] font-black text-primary uppercase tracking-widest">
                              {selectedStudio?.name}
                            </span>
                          </motion.div>
                        )}
                      </div>
                      <FieldContent>
                        <StudioDataTable
                          onSelect={handleClientSelect}
                          selectedId={field.state.value}
                        />
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
            </FieldGroup>
          </FieldSet>

          {/* Project & Validity */}
          <div className="p-1 rounded-3xl bg-white/2 border border-white/5">
            <div className="p-8 space-y-8">
              {/* Validity Window */}
              <div>
                <form.Field
                  name="validUntil"
                  children={(field) => (
                    <Field>
                      <FieldLabel className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3">
                        Validity Window
                      </FieldLabel>
                      <FieldContent>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              className={cn(
                                "w-full h-14 bg-white/5 border-white/5 rounded-2xl px-5 flex items-center justify-between text-white font-bold hover:bg-white/10 transition-colors text-left",
                                !field.state.value && "text-white/40",
                              )}
                            >
                              <span>
                                {field.state.value
                                  ? format(field.state.value, "PPP")
                                  : "Pick a date"}
                              </span>
                              <CalendarIcon className="h-4 w-4 opacity-40" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-auto p-0 bg-zinc-900 border-white/10"
                            align="start"
                          >
                            <Calendar
                              mode="single"
                              selected={field.state.value}
                              onSelect={(date) => {
                                field.handleChange(date);
                                setFormData("step1", {
                                  validUntil: date ?? undefined,
                                });
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </FieldContent>
                    </Field>
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
