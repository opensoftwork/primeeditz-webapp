import {
  MapPin,
  Pencil,
  X,
  Check,
  Loader2,
  Mail,
  Globe,
  Phone,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { contactSchema, ContactFormData } from "../schema";
import { PhoneInput } from "@/components/ui/phone-input";

export function ContactSection({ initialData }: { initialData: any }) {
  const [isEditing, setIsEditing] = useState(false);
  // @ts-ignore
  const updateCompany = useMutation(api.functions.company.mutations.update);

  const form = useForm({
    defaultValues: {
      address: initialData?.address ?? "",
      phone: initialData?.phone ?? "",
      email: initialData?.email ?? "",
      website: initialData?.website ?? "",
    } as ContactFormData,
    validators: {
      onSubmit: contactSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const { _id, _creationTime, updatedAt, updatedBy, ...cleanData } =
          initialData || {};
        await updateCompany({ ...cleanData, ...value });
        toast.success("Contact details updated successfully");
        setIsEditing(false);
      } catch (error) {
        console.error(error);
        toast.error("Failed to update contact details");
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
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-white/90">
              Contact & Location
            </h2>
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-0.5">
              Public contact information
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
            Edit Profile
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

      <div className="grid grid-cols-1 gap-10 relative z-10">
        <form.Field name="address">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid} className="w-full">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-3 w-3 text-white/20" />
                  <FieldLabel
                    htmlFor={field.name}
                    className="text-[10px] font-black uppercase tracking-widest text-white/40 group-focus-within:text-primary transition-colors"
                  >
                    Office Address
                  </FieldLabel>
                </div>
                {isEditing ? (
                  <Textarea
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Enter full registered address..."
                    className="bg-white/5 border-white/5 focus:border-primary/30 focus:bg-white/8 rounded-xl min-h-[120px] font-bold text-white text-sm resize-none transition-all p-4 placeholder:text-white/10"
                    aria-invalid={isInvalid}
                  />
                ) : (
                  <div className="text-white/80 font-bold min-h-12 flex items-start py-3 px-4 text-sm bg-white/2 border border-white/5 rounded-xl whitespace-pre-wrap leading-relaxed">
                    {field.state.value || (
                      <span className="opacity-20 font-medium italic text-xs">
                        No address provided
                      </span>
                    )}
                  </div>
                )}
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <form.Field name="phone">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="h-3 w-3 text-white/20" />
                    <FieldLabel
                      htmlFor={field.name}
                      className="text-[10px] font-black uppercase tracking-widest text-white/40 group-focus-within:text-primary transition-colors"
                    >
                      Phone Number
                    </FieldLabel>
                  </div>
                  {isEditing ? (
                    <PhoneInput
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(value) => field.handleChange(value)}
                      placeholder="98765 43210"
                      className="w-full"
                    />
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

          <form.Field name="email">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="h-3 w-3 text-white/20" />
                    <FieldLabel
                      htmlFor={field.name}
                      className="text-[10px] font-black uppercase tracking-widest text-white/40 group-focus-within:text-primary transition-colors"
                    >
                      Business Email
                    </FieldLabel>
                  </div>
                  {isEditing ? (
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="studio@primeeditz.com"
                      className="bg-white/5 border-white/5 focus:border-primary/30 focus:bg-white/8 rounded-xl h-12 font-bold text-white text-sm transition-all px-4 placeholder:text-white/10"
                      aria-invalid={isInvalid}
                    />
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

          <form.Field name="website">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="h-3 w-3 text-white/20" />
                    <FieldLabel
                      htmlFor={field.name}
                      className="text-[10px] font-black uppercase tracking-widest text-white/40 group-focus-within:text-primary transition-colors"
                    >
                      Website URL
                    </FieldLabel>
                  </div>
                  {isEditing ? (
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="https://primeeditz.com"
                      className="bg-white/5 border-white/5 focus:border-primary/30 focus:bg-white/8 rounded-xl h-12 font-bold text-white text-sm transition-all px-4 placeholder:text-white/10"
                      aria-invalid={isInvalid}
                    />
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
