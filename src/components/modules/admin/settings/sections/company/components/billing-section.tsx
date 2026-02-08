"use client";

import { CreditCard, Pencil, X, Check, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { companySchema } from "../schema";

export function BillingSection({ initialData }: { initialData: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const updateCompany = useMutation(api.functions.company.mutations.update);

  const form = useForm({
    defaultValues: {
      gstNumber: initialData?.gstNumber ?? "",
      panNumber: initialData?.panNumber ?? "",
    },
    validators: {
      onSubmit: companySchema.pick({ gstNumber: true, panNumber: true }) as any,
    },
    onSubmit: async ({ value }) => {
      try {
        const { _id, _creationTime, updatedAt, updatedBy, ...cleanData } =
          initialData;
        await updateCompany({ ...cleanData, ...value });
        toast.success("Billing details updated successfully");
        setIsEditing(false);
      } catch (error) {
        console.error(error);
        toast.error("Failed to update billing details");
      }
    },
  });

  return (
    <div
      className={cn(
        "p-8 rounded-3xl border transition-all duration-500",
        isEditing
          ? "bg-white/3 border-white/10 shadow-2xl shadow-black/20"
          : "bg-white/1 border-white/5",
      )}
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <CreditCard className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-black uppercase tracking-widest text-white/60">
            Tax & Billing
          </h2>
        </div>

        {!isEditing ? (
          <Button
            type="button"
            onClick={() => setIsEditing(true)}
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-primary hover:bg-primary/5 rounded-lg transition-all gap-2"
          >
            <Pencil className="h-3 w-3" />
            Edit
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={() => {
                form.reset();
                setIsEditing(false);
              }}
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white rounded-lg transition-all gap-2"
            >
              <X className="h-3 w-3" />
              Cancel
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
                  className="h-8 px-3 text-[10px] font-black uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-all gap-2 shadow-lg shadow-primary/20"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Check className="h-3 w-3" />
                  )}
                  Save
                </Button>
              )}
            </form.Subscribe>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
        <form.Field name="gstNumber">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel
                  htmlFor={field.name}
                  className="text-[10px] font-black uppercase tracking-widest text-white/40 group-focus-within:text-primary transition-colors"
                >
                  GST Number
                </FieldLabel>
                {isEditing ? (
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="27AAAC... (Optional)"
                    className="bg-white/5 border-white/10 focus:border-primary/50 focus:bg-white/10 rounded-lg h-10 font-bold text-white text-sm transition-all"
                    aria-invalid={isInvalid}
                  />
                ) : (
                  <div className="text-white font-bold h-10 flex items-center px-1 text-sm bg-transparent border-transparent">
                    {field.state.value || (
                      <span className="opacity-20 font-medium italic text-xs">
                        Not Set
                      </span>
                    )}
                  </div>
                )}
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="panNumber">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel
                  htmlFor={field.name}
                  className="text-[10px] font-black uppercase tracking-widest text-white/40 group-focus-within:text-primary transition-colors"
                >
                  PAN Number
                </FieldLabel>
                {isEditing ? (
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="ABCDE1234F (Optional)"
                    className="bg-white/5 border-white/10 focus:border-primary/50 focus:bg-white/10 rounded-lg h-10 font-bold text-white text-sm transition-all"
                    aria-invalid={isInvalid}
                  />
                ) : (
                  <div className="text-white font-bold h-10 flex items-center px-1 text-sm bg-transparent border-transparent">
                    {field.state.value || (
                      <span className="opacity-20 font-medium italic text-xs">
                        Not Set
                      </span>
                    )}
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
