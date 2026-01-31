"use client";

import { useEffect } from "react";
import { api } from "@convex/_generated/api";
import { useForm } from "@tanstack/react-form";
import { useQuery } from "convex/react";
import { Info } from "lucide-react";
import * as z from "zod";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useBuilder } from "./builder-context";

const step1Schema = z.object({
  name: z
    .string()
    .min(1, "Package name is required")
    .max(100, "Package name must be 100 characters or less"),
  description: z
    .string()
    .max(500, "Description must be 500 characters or less"),
  categoryId: z.string(),
});

export function Step1Identity() {
  const { step1Data, setStep1Data, setCurrentStep, setSubmitTrigger } =
    useBuilder();
  const categories =
    useQuery(api.functions.projectCategories.queries.getProjectCategories) ||
    [];

  const form = useForm({
    defaultValues: {
      name: step1Data?.name ?? "",
      description: step1Data?.description ?? "",
      categoryId: step1Data?.categoryId ?? "",
    },
    validators: {
      onChange: step1Schema,
    },
    onSubmit: async ({ value }) => {
      setStep1Data({
        name: value.name,
        description: value.description || undefined,
        categoryId: value.categoryId || undefined,
      });
      setCurrentStep(2);
    },
  });

  // Register submit trigger
  useEffect(() => {
    setSubmitTrigger(() => form.handleSubmit());
    return () => setSubmitTrigger(null);
  }, [form, setSubmitTrigger]);

  return (
    <div className="max-w-2xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-10 space-y-2 text-center">
        <h2 className="text-3xl font-black text-white uppercase tracking-tight">
          Package Identity
        </h2>
        <p className="text-white/40 font-medium text-sm">
          Define how this package appears in your catalog and quotations.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-8"
      >
        <form.Field name="name">
          {(field) => {
            const hasError = field.state.meta.errors.length > 0;
            return (
              <Field data-invalid={hasError}>
                <FieldLabel
                  htmlFor={field.name}
                  className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1"
                >
                  Package Name *
                </FieldLabel>
                <Input
                  id={field.name}
                  placeholder="e.g. Premium Wedding Photography"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={hasError}
                  className="bg-zinc-950 border-white/5 focus:border-primary/50 focus:ring-primary/20 h-14 rounded-2xl text-base transition-all shadow-inner px-6"
                />
                <FieldDescription className="text-[10px] text-white/20 uppercase tracking-widest font-black ml-1 mt-2">
                  The public name of the service offering.
                </FieldDescription>
                <FieldError className="text-[10px] uppercase tracking-wider font-bold">
                  {field.state.meta.errors
                    .map((err) =>
                      typeof err === "string" ? err : (err as any)?.message,
                    )
                    .filter(Boolean)
                    .join(", ")}
                </FieldError>
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="description">
          {(field) => {
            const hasError = field.state.meta.errors.length > 0;
            return (
              <Field data-invalid={hasError}>
                <FieldLabel
                  htmlFor={field.name}
                  className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1"
                >
                  Public Description
                </FieldLabel>
                <div className="relative">
                  <Textarea
                    id={field.name}
                    placeholder="Describe what's included in this package..."
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={hasError}
                    className="bg-zinc-950 border-white/5 focus:border-primary/50 focus:ring-primary/20 resize-none h-40 rounded-2xl text-base transition-all p-6 shadow-inner"
                  />
                  <div className="absolute bottom-4 right-4 text-[9px] font-black text-white/20 uppercase tracking-widest">
                    {field.state.value?.length ?? 0}/500
                  </div>
                </div>
                <FieldDescription className="text-[10px] text-white/20 uppercase tracking-widest font-black ml-1 mt-2">
                  Briefly summarize the value proposition.
                </FieldDescription>
                <FieldError className="text-[10px] uppercase tracking-wider font-bold">
                  {field.state.meta.errors
                    .map((err) =>
                      typeof err === "string" ? err : (err as any)?.message,
                    )
                    .filter(Boolean)
                    .join(", ")}
                </FieldError>
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="categoryId">
          {(field) => (
            <Field>
              <FieldLabel
                htmlFor={field.name}
                className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1"
              >
                Service Category
              </FieldLabel>
              <Select
                value={field.state.value || "__none__"}
                onValueChange={(value) =>
                  field.handleChange(value === "__none__" ? "" : value)
                }
              >
                <SelectTrigger
                  id={field.name}
                  className="bg-zinc-950 border-white/5 focus:ring-primary/20 h-14 rounded-2xl text-base transition-all shadow-inner px-6"
                >
                  <SelectValue placeholder="Select a category..." />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-white/10 rounded-2xl p-2">
                  <SelectItem
                    value="__none__"
                    className="focus:bg-white/5 focus:text-white rounded-xl mx-1 my-1 cursor-pointer italic text-white/40 h-12"
                  >
                    No Category (Uncategorized)
                  </SelectItem>
                  {categories.map((cat) => (
                    <SelectItem
                      key={cat._id}
                      value={cat._id}
                      className="focus:bg-primary/20 focus:text-primary rounded-xl mx-1 my-1 cursor-pointer h-12"
                    >
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldDescription className="text-[10px] text-white/20 uppercase tracking-widest font-black ml-1 mt-2">
                Helps in filtering and reporting.
              </FieldDescription>
              <FieldError className="text-[10px] uppercase tracking-wider font-bold">
                {field.state.meta.errors
                  .map((err) =>
                    typeof err === "string" ? err : (err as any)?.message,
                  )
                  .filter(Boolean)
                  .join(", ")}
              </FieldError>
            </Field>
          )}
        </form.Field>

        <div className="pt-8 border-t border-white/5">
          <div className="flex items-center gap-3 px-6 py-4 bg-white/5 rounded-2xl border border-white/5 w-fit">
            <Info className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
              Fields marked with * are required
            </span>
          </div>
        </div>
      </form>
    </div>
  );
}
