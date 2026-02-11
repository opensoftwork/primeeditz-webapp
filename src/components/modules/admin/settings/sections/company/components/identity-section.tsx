"use client";

import {
  Building2,
  Pencil,
  X,
  Check,
  Loader2,
  Upload,
  ImageIcon,
  Trash2,
  User,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { useState, useEffect, useRef } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useAction } from "convex/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { identitySchema, IdentityFormData } from "../schema";
import { api } from "@convex/_generated/api";
import Image from "next/image";

export function IdentitySection({ initialData }: { initialData: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateCompany = useMutation(api.functions.company.mutations.update);
  const generateUploadUrl = useAction(
    api.functions.storage.actions.generateSystemUploadUrl,
  );
  const getSignedUrl = useAction(
    api.functions.storage.actions.getSignedFileUrl,
  );

  const form = useForm({
    defaultValues: {
      name: initialData?.name ?? "",
      tagline: initialData?.tagline ?? "",
      logoUrl: initialData?.logoUrl ?? "",
    } as IdentityFormData,
    validators: {
      onSubmit: identitySchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const { _id, _creationTime, updatedAt, updatedBy, ...cleanData } =
          initialData || {};
        await updateCompany({ ...cleanData, ...value });
        toast.success("Identity updated successfully");
        setIsEditing(false);
      } catch (error) {
        console.error(error);
        toast.error("Failed to update identity");
      }
    },
  });

  // Resolve storage key to signed URL for preview
  useEffect(() => {
    const fetchLogo = async () => {
      const key = form.getFieldValue("logoUrl");
      if (key && (key.startsWith("system/") || key.includes("/"))) {
        try {
          const url = await getSignedUrl({ storageKey: key });
          setLogoUrl(url);
        } catch (error) {
          console.error("Failed to fetch logo URL:", error);
          setLogoUrl(null);
        }
      } else {
        setLogoUrl(key || null);
      }
    };
    fetchLogo();
  }, [initialData?.logoUrl, getSignedUrl, form]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    setIsUploading(true);
    try {
      const { url, storageKey } = await generateUploadUrl({
        fileName: file.name,
        contentType: file.type,
      });

      const response = await fetch(url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!response.ok) throw new Error("Upload failed");

      form.setFieldValue("logoUrl", storageKey);

      // Get a fresh signed URL for immediate preview
      const preview = await getSignedUrl({ storageKey });
      setLogoUrl(preview);

      toast.success("Logo uploaded successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload logo");
    } finally {
      setIsUploading(false);
    }
  };

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
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-white/90">
              Identity
            </h2>
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-0.5">
              Brand & Company Profile
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
            Edit Identity
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
                  disabled={!canSubmit || isSubmitting || isUploading}
                  size="sm"
                  className="h-9 px-4 text-[10px] font-black uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl transition-all gap-2 shadow-xl shadow-primary/20 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                  Save Brand
                </Button>
              )}
            </form.Subscribe>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-12 relative z-10">
        {/* Logo Section */}
        <div className="flex flex-col items-center gap-6">
          <div className="relative group">
            <div
              className={cn(
                "w-32 h-32 rounded-3xl overflow-hidden border-2 border-dashed transition-all duration-500 flex items-center justify-center bg-white/2 relative",
                isEditing
                  ? "border-white/10 hover:border-primary/30"
                  : "border-transparent",
                logoUrl && "border-solid",
              )}
            >
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt="Company Logo"
                  fill
                  className="object-contain p-4"
                  unoptimized
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-white/10">
                  <ImageIcon className="h-8 w-8" />
                  <span className="text-[8px] font-black uppercase tracking-widest">
                    No Logo
                  </span>
                </div>
              )}

              {isUploading && (
                <div className="absolute inset-0 bg-white/2 flex items-center justify-center z-20">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              )}

              {isEditing && (
                <div
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer pointer-events-none group-hover:pointer-events-auto"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-xl shadow-primary/40">
                    <Upload className="h-5 w-5 text-primary-foreground" />
                  </div>
                </div>
              )}
            </div>

            {isEditing && logoUrl && (
              <button
                type="button"
                onClick={() => {
                  form.setFieldValue("logoUrl", "");
                  setLogoUrl(null);
                }}
                className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/20 hover:scale-110 transition-transform z-30"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleLogoUpload}
            accept="image/*"
            className="hidden"
          />

          {isEditing && (
            <div className="text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">
                Brand Mark
              </p>
              <p className="text-[8px] font-medium text-white/20 uppercase tracking-widest leading-relaxed">
                Square PNG/SVG
                <br />
                Recommended
              </p>
            </div>
          )}
        </div>

        {/* Fields Section */}
        <div className="flex-1 grid grid-cols-1 gap-8">
          <form.Field name="name">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel
                    htmlFor={field.name}
                    className="text-[10px] font-black uppercase tracking-widest text-white/40 group-focus-within:text-primary transition-colors block mb-2"
                  >
                    Company Name
                  </FieldLabel>
                  {isEditing ? (
                    <div className="relative">
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="PrimeEditz"
                        className="bg-white/5 border-white/5 focus:border-primary/30 focus:bg-white/8 rounded-xl h-12 font-bold text-white text-sm transition-all px-4 pl-11"
                        aria-invalid={isInvalid}
                      />
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                    </div>
                  ) : (
                    <div className="text-white font-bold h-12 flex items-center px-4 text-sm bg-white/2 border border-white/5 rounded-xl">
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

          <form.Field name="tagline">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel
                    htmlFor={field.name}
                    className="text-[10px] font-black uppercase tracking-widest text-white/40 group-focus-within:text-primary transition-colors block mb-2"
                  >
                    Brand Tagline
                  </FieldLabel>
                  {isEditing ? (
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Post-Production Excellence"
                      className="bg-white/5 border-white/5 focus:border-primary/30 focus:bg-white/8 rounded-xl h-12 font-bold text-white text-sm transition-all px-4"
                      aria-invalid={isInvalid}
                    />
                  ) : (
                    <div className="text-white/60 font-medium h-12 flex items-center px-4 text-sm bg-white/2 border border-white/5 rounded-xl italic">
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
