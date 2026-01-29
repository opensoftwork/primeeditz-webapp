"use client";

import { api } from "@convex/_generated/api";
import { useForm } from "@tanstack/react-form";
import { useQuery } from "convex/react";
import { ArrowRight, Info } from "lucide-react";
import * as z from "zod";
import { Button } from "@/components/ui/button";
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
  const { step1Data, setStep1Data, setCurrentStep } = useBuilder();
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

  return (
    <div className="max-w-2xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-10 space-y-2">
        <h2 className="text-2xl font-black text-white uppercase tracking-tight">
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
                  className="bg-white/5 border-white/5 focus:border-primary/50 focus:ring-primary/20 h-12 rounded-xl text-sm transition-all shadow-inner"
                />
                <FieldDescription className="text-[10px] text-white/20 uppercase tracking-widest font-black ml-1">
                  The public name of the service offering.
                </FieldDescription>
                <FieldError className="text-[10px] uppercase tracking-wider font-bold">
                  {field.state.meta.errors
                    .map((err) => err?.toString())
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
                    className="bg-white/5 border-white/5 focus:border-primary/50 focus:ring-primary/20 resize-none h-32 rounded-xl text-sm transition-all p-4 shadow-inner"
                  />
                  <div className="absolute bottom-3 right-3 text-[9px] font-black text-white/20 uppercase tracking-widest">
                    {field.state.value?.length ?? 0}/500
                  </div>
                </div>
                <FieldDescription className="text-[10px] text-white/20 uppercase tracking-widest font-black ml-1">
                  Briefly summarize the value proposition.
                </FieldDescription>
                <FieldError className="text-[10px] uppercase tracking-wider font-bold">
                  {field.state.meta.errors
                    .map((err) => err?.toString())
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
                  className="bg-white/5 border-white/5 focus:ring-primary/20 h-12 rounded-xl text-sm transition-all shadow-inner"
                >
                  <SelectValue placeholder="Select a category..." />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-white/10 rounded-xl">
                  <SelectItem
                    value="__none__"
                    className="focus:bg-white/5 focus:text-white rounded-lg mx-1 my-0.5 cursor-pointer italic text-white/40"
                  >
                    No Category (Uncategorized)
                  </SelectItem>
                  {categories.map((cat) => (
                    <SelectItem
                      key={cat._id}
                      value={cat._id}
                      className="focus:bg-primary/20 focus:text-primary rounded-lg mx-1 my-0.5 cursor-pointer"
                    >
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldDescription className="text-[10px] text-white/20 uppercase tracking-widest font-black ml-1">
                Helps in filtering and reporting.
              </FieldDescription>
            </Field>
          )}
        </form.Field>

        <div className="pt-8 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
            <Info className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
              Fields marked with * are required
            </span>
          </div>

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[10px] h-12 px-8 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] gap-2"
              >
                {isSubmitting ? "Processing..." : "Next: Configuration"}
                {!isSubmitting && (
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                )}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </div>
  );
}
