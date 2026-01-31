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
import { Card } from "@/components/ui/card";

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
    setSubmitTrigger(() => () => form.handleSubmit());
    return () => setSubmitTrigger(null);
  }, [form, setSubmitTrigger]);

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="h-0.5 w-8 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary/60">
            Service Definition
          </span>
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tighter text-white">
          Package Identity
        </h2>
        <p className="text-xs font-semibold text-white/40 max-w-lg leading-relaxed">
          Define how this package appears in your catalog and quotations.
        </p>
      </div>

      <Card className="bg-zinc-900/30 border-white/5 p-8 rounded-3xl backdrop-blur-sm overflow-hidden relative group">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-size-[32px_32px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-[80px] rounded-full -mr-24 -mt-24 pointer-events-none opacity-50 transition-opacity duration-1000 group-hover:opacity-100" />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-10 relative z-10"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
            <form.Field name="name">
              {(field) => {
                const hasError = field.state.meta.errors.length > 0;
                return (
                  <Field data-invalid={hasError} className="space-y-3">
                    <FieldLabel
                      htmlFor={field.name}
                      className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2 pl-2"
                    >
                      Package Name <span className="text-primary">*</span>
                    </FieldLabel>
                    <Input
                      id={field.name}
                      placeholder="e.g. Premium Wedding Photography"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={hasError}
                      className="h-12 bg-black/20 border-white/5 rounded-2xl font-bold text-white text-base focus:border-primary/50 focus:bg-black/40 focus:ring-4 focus:ring-primary/5 transition-all outline-none placeholder:text-white/10"
                    />
                    <FieldError className="text-[10px] uppercase tracking-wider font-bold pl-2">
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
                <Field className="space-y-3">
                  <FieldLabel
                    htmlFor={field.name}
                    className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2 pl-2"
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
                      className="h-12 bg-black/20 border-white/5 rounded-2xl font-bold text-white text-base focus:border-primary/50 focus:bg-black/40 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                    >
                      <SelectValue placeholder="Select a category..." />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-white/10 rounded-2xl p-2">
                      <SelectItem
                        value="__none__"
                        className="focus:bg-white/5 focus:text-white rounded-xl mx-1 my-1 cursor-pointer italic text-white/40 h-10"
                      >
                        No Category (Uncategorized)
                      </SelectItem>
                      {categories.map((cat) => (
                        <SelectItem
                          key={cat._id}
                          value={cat._id}
                          className="focus:bg-primary/20 focus:text-primary rounded-xl mx-1 my-1 cursor-pointer h-10"
                        >
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError className="text-[10px] uppercase tracking-wider font-bold pl-2">
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

            <form.Field name="description">
              {(field) => {
                const hasError = field.state.meta.errors.length > 0;
                return (
                  <Field
                    data-invalid={hasError}
                    className="md:col-span-2 space-y-3"
                  >
                    <FieldLabel
                      htmlFor={field.name}
                      className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2 pl-2"
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
                        className="py-4 min-h-[140px] bg-black/20 border-white/5 rounded-2xl font-medium text-white text-sm leading-relaxed focus:border-primary/50 focus:bg-black/40 focus:ring-4 focus:ring-primary/5 transition-all outline-none resize-none placeholder:text-white/10"
                      />
                      <div className="absolute bottom-4 right-4 text-[9px] font-black text-white/20 uppercase tracking-widest">
                        {field.state.value?.length ?? 0}/500
                      </div>
                    </div>
                    <FieldError className="text-[10px] uppercase tracking-wider font-bold pl-2">
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
          </div>

          <div className="pt-6 border-t border-white/5 flex items-center gap-3">
            <Info className="h-4 w-4 text-primary" />
            <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">
              High visibility fields for the client catalog
            </span>
          </div>
        </form>
      </Card>
    </div>
  );
}
