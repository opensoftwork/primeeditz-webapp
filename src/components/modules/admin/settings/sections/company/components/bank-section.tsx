"use client";

import {
  Landmark,
  Pencil,
  X,
  Check,
  Loader2,
  User,
  Hash,
  Globe,
  MapPin,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { bankSchema, BankFormData } from "../schema";

export function BankSection({ initialData }: { initialData: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const updateCompany = useMutation(api.functions.company.mutations.update);

  const form = useForm({
    defaultValues: {
      bankDetails: {
        bankName: initialData?.bankDetails?.bankName ?? "",
        accountHolder: initialData?.bankDetails?.accountHolder ?? "",
        accountNumber: initialData?.bankDetails?.accountNumber ?? "",
        ifscCode: initialData?.bankDetails?.ifscCode ?? "",
        branch: initialData?.bankDetails?.branch ?? "",
      },
    } as BankFormData,
    validators: {
      onSubmit: bankSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const { _id, _creationTime, updatedAt, updatedBy, ...cleanData } =
          initialData || {};
        await updateCompany({ ...cleanData, ...value });
        toast.success("Bank details updated successfully");
        setIsEditing(false);
      } catch (error) {
        console.error(error);
        toast.error("Failed to update bank details");
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
      {isEditing && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
      )}

      <div className="flex items-center justify-between mb-10 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <Landmark className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-white/90">
              Bank Details
            </h2>
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-0.5">
              Payment & Transfers
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
            Edit Bank
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
                  className="h-9 px-4 text-[10px] font-black uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl transition-all gap-2 shadow-xl shadow-primary/20"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                  Save Bank
                </Button>
              )}
            </form.Subscribe>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 relative z-10">
        <form.Field name="bankDetails.bankName">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel
                  htmlFor={field.name}
                  className="text-[10px] font-black uppercase tracking-widest text-white/40 group-focus-within:text-primary transition-colors block mb-2"
                >
                  Bank Name
                </FieldLabel>
                {isEditing ? (
                  <div className="relative">
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="HDFC Bank"
                      className="bg-white/5 border-white/5 focus:border-primary/30 focus:bg-white/8 rounded-xl h-12 font-bold text-white text-sm transition-all px-4 pl-11"
                      aria-invalid={isInvalid}
                    />
                    <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                  </div>
                ) : (
                  <div className="text-white/80 font-bold h-12 flex items-center px-4 text-sm bg-white/2 border border-white/5 rounded-xl">
                    {field.state.value || (
                      <span className="opacity-20 font-medium italic text-xs">
                        Not set
                      </span>
                    )}
                  </div>
                )}
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="bankDetails.accountHolder">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel
                  htmlFor={field.name}
                  className="text-[10px] font-black uppercase tracking-widest text-white/40 group-focus-within:text-primary transition-colors block mb-2"
                >
                  Account Holder Name
                </FieldLabel>
                {isEditing ? (
                  <div className="relative">
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="PRIMEEDITZ PRIVATE LIMITED"
                      className="bg-white/5 border-white/5 focus:border-primary/30 focus:bg-white/8 rounded-xl h-12 font-bold text-white text-sm transition-all px-4 pl-11"
                      aria-invalid={isInvalid}
                    />
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                  </div>
                ) : (
                  <div className="text-white/80 font-bold h-12 flex items-center px-4 text-sm bg-white/2 border border-white/5 rounded-xl">
                    {field.state.value || (
                      <span className="opacity-20 font-medium italic text-xs">
                        Not set
                      </span>
                    )}
                  </div>
                )}
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="bankDetails.accountNumber">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel
                  htmlFor={field.name}
                  className="text-[10px] font-black uppercase tracking-widest text-white/40 group-focus-within:text-primary transition-colors block mb-2"
                >
                  Account Number
                </FieldLabel>
                {isEditing ? (
                  <div className="relative">
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="50200012345678"
                      className="bg-white/5 border-white/5 focus:border-primary/30 focus:bg-white/8 rounded-xl h-12 font-bold text-white text-sm transition-all px-4 pl-11"
                      aria-invalid={isInvalid}
                    />
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                  </div>
                ) : (
                  <div className="text-white/80 font-bold h-12 flex items-center px-4 text-sm bg-white/2 border border-white/5 rounded-xl uppercase tracking-widest">
                    {field.state.value || (
                      <span className="opacity-20 font-medium italic text-xs tracking-normal">
                        Not set
                      </span>
                    )}
                  </div>
                )}
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <div className="grid grid-cols-2 gap-x-12 gap-y-10">
          <form.Field name="bankDetails.ifscCode">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel
                    htmlFor={field.name}
                    className="text-[10px] font-black uppercase tracking-widest text-white/40 group-focus-within:text-primary transition-colors block mb-2"
                  >
                    IFSC Code
                  </FieldLabel>
                  {isEditing ? (
                    <div className="relative">
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="HDFC0001234"
                        className="bg-white/5 border-white/5 focus:border-primary/30 focus:bg-white/8 rounded-xl h-12 font-bold text-white text-sm transition-all px-4 pl-11"
                        aria-invalid={isInvalid}
                      />
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                    </div>
                  ) : (
                    <div className="text-white/80 font-bold h-12 flex items-center px-4 text-sm bg-white/2 border border-white/5 rounded-xl uppercase">
                      {field.state.value || (
                        <span className="opacity-20 font-medium italic text-xs tracking-normal">
                          Not set
                        </span>
                      )}
                    </div>
                  )}
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="bankDetails.branch">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel
                    htmlFor={field.name}
                    className="text-[10px] font-black uppercase tracking-widest text-white/40 group-focus-within:text-primary transition-colors block mb-2"
                  >
                    Branch
                  </FieldLabel>
                  {isEditing ? (
                    <div className="relative">
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Film City Branch"
                        className="bg-white/5 border-white/5 focus:border-primary/30 focus:bg-white/8 rounded-xl h-12 font-bold text-white text-sm transition-all px-4 pl-11"
                        aria-invalid={isInvalid}
                      />
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                    </div>
                  ) : (
                    <div className="text-white/80 font-bold h-12 flex items-center px-4 text-sm bg-white/2 border border-white/5 rounded-xl">
                      {field.state.value || (
                        <span className="opacity-20 font-medium italic text-xs">
                          Not set
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
    </div>
  );
}
