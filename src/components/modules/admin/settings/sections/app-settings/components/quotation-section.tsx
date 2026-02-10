"use client";

import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { toast } from "sonner";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { FileText, Pencil, X, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { quotationSchema, QuotationFormData } from "../schema";

interface QuotationSectionProps {
  initialData: any;
}

export function QuotationSection({ initialData }: QuotationSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const updateQuotation = useMutation(
    api.functions.settings.mutations.updateQuotationSettings,
  );

  const form = useForm({
    defaultValues: {
      defaultTaxRate: initialData?.defaultTaxRate ?? 18,
      defaultValidityDays: initialData?.defaultValidityDays ?? 30,
      defaultTerms: initialData?.defaultTerms ?? "",
      codePrefix: initialData?.codePrefix ?? "QE-",
    } as QuotationFormData,
    validators: {
      onSubmit: quotationSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await updateQuotation(value);
        toast.success("Quotation settings updated successfully");
        setIsEditing(false);
      } catch (error) {
        console.error(error);
        toast.error("Failed to update quotation settings");
      }
    },
  });

  return (
    <div
      className={cn(
        "p-8 rounded-4xl border transition-all duration-500 relative overflow-hidden",
        isEditing
          ? "bg-white/3 border-white/10 shadow-2xl shadow-black/40 ring-1 ring-primary/20"
          : "bg-white/1 border-white/5 hover:bg-white/2",
      )}
    >
      <div className="flex items-center justify-between mb-10 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-white/90">
              Quotation Defaults
            </h2>
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-0.5">
              Default values for new quotations
            </p>
          </div>
        </div>

        {!isEditing ? (
          <Button
            type="button"
            onClick={() => setIsEditing(true)}
            variant="ghost"
            size="sm"
            className="h-9 px-4 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-primary hover:bg-primary/10 rounded-xl transition-all gap-2 border border-transparent hover:border-primary/20"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit Quotation
          </Button>
        ) : (
          <div className="flex items-center gap-3">
            <Button
              type="button"
              onClick={() => {
                form.reset();
                setIsEditing(false);
              }}
              variant="ghost"
              size="sm"
              className="h-9 px-4 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white rounded-xl transition-all gap-2"
            >
              <X className="h-3.5 w-3.5" />
              Discard
            </Button>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <Button
                  type="button"
                  onClick={() => form.handleSubmit()}
                  disabled={!canSubmit || isSubmitting}
                  size="sm"
                  className="h-9 px-4 text-[10px] font-black uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl transition-all gap-2 shadow-xl shadow-primary/20 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                  Save Changes
                </Button>
              )}
            </form.Subscribe>
          </div>
        )}
      </div>

      <div className="mt-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <form.Field name="defaultTaxRate">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel className="text-[10px] font-black uppercase tracking-widest text-white/40 group-focus-within:text-primary transition-colors">
                    Default Tax Rate (%)
                  </FieldLabel>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={field.state.value}
                      onChange={(e) =>
                        field.handleChange(Number(e.target.value))
                      }
                      className="bg-white/5 border-white/10 focus:border-primary/50 focus:bg-white/10 rounded-lg h-10 font-bold text-white text-sm transition-all"
                      aria-invalid={isInvalid}
                    />
                  ) : (
                    <div className="text-white font-bold h-10 flex items-center px-1 text-sm bg-transparent border-transparent">
                      {field.state.value}%
                    </div>
                  )}
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="defaultValidityDays">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel className="text-[10px] font-black uppercase tracking-widest text-white/40 group-focus-within:text-primary transition-colors">
                    Default Validity (Days)
                  </FieldLabel>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={field.state.value}
                      onChange={(e) =>
                        field.handleChange(Number(e.target.value))
                      }
                      className="bg-white/5 border-white/10 focus:border-primary/50 focus:bg-white/10 rounded-lg h-10 font-bold text-white text-sm transition-all"
                      aria-invalid={isInvalid}
                    />
                  ) : (
                    <div className="text-white font-bold h-10 flex items-center px-1 text-sm bg-transparent border-transparent">
                      {field.state.value} Days
                    </div>
                  )}
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="codePrefix">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel className="text-[10px] font-black uppercase tracking-widest text-white/40 group-focus-within:text-primary transition-colors">
                    Quotation Code Prefix
                  </FieldLabel>
                  {isEditing ? (
                    <Input
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="QE-"
                      className="bg-white/5 border-white/10 focus:border-primary/50 focus:bg-white/10 rounded-lg h-10 font-bold text-white text-sm transition-all"
                      aria-invalid={isInvalid}
                    />
                  ) : (
                    <div className="text-white font-bold h-10 flex items-center px-1 text-sm bg-transparent border-transparent">
                      {field.state.value || "Not Set"}
                    </div>
                  )}
                  {isEditing && (
                    <FieldDescription className="text-[10px] mt-1">
                      Prefix for (e.g. QE-1001)
                    </FieldDescription>
                  )}
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>
        </div>

        <form.Field name="defaultTerms">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid} className="w-full">
                <FieldLabel className="text-[10px] font-black uppercase tracking-widest text-white/40 group-focus-within:text-primary transition-colors">
                  Default Terms & Conditions
                </FieldLabel>
                {isEditing ? (
                  <Textarea
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Enter global terms..."
                    className="bg-white/5 border-white/10 focus:border-primary/50 focus:bg-white/10 rounded-xl min-h-[120px] font-medium text-white/80 resize-none p-4 text-sm transition-all custom-scrollbar"
                    aria-invalid={isInvalid}
                  />
                ) : (
                  <div className="text-white/80 font-medium p-4 rounded-xl bg-white/3 border border-white/5 min-h-[80px] text-sm whitespace-pre-wrap">
                    {field.state.value || "No default terms set."}
                  </div>
                )}
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>
      </div>
    </div>
  );
}
