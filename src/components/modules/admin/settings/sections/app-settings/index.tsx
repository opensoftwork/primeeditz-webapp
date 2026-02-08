"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { toast } from "sonner";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import {
  FileText,
  Bell,
  Save,
  Loader2,
  Trash2,
  Plus,
  Pencil,
  X,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldSet,
  FieldLegend,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { appSettingsSchema } from "./schema";
import { AppSettingsSkeleton } from "./app-settings-skeleton";

export function AppSettings() {
  const settings = useQuery(api.functions.settings.queries.get);
  const updateQuotation = useMutation(
    api.functions.settings.mutations.updateQuotationSettings,
  );
  const updateNotifications = useMutation(
    api.functions.settings.mutations.updateNotificationSettings,
  );

  const [isEditing, setIsEditing] = useState(false);

  const form = useForm({
    defaultValues: {
      quotation: {
        defaultTaxRate: settings?.quotation?.defaultTaxRate ?? 18,
        defaultValidityDays: settings?.quotation?.defaultValidityDays ?? 30,
        defaultTerms: settings?.quotation?.defaultTerms ?? "",
        codePrefix: settings?.quotation?.codePrefix ?? "QE-",
      },
      notifications: {
        adminEmails: settings?.notifications?.adminEmails ?? [],
        enableEmailNotifications:
          settings?.notifications?.enableEmailNotifications ?? true,
      },
    },
    validators: {
      onSubmit: appSettingsSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await Promise.all([
          updateQuotation(value.quotation),
          updateNotifications(value.notifications),
        ]);
        toast.success("General settings updated successfully");
        setIsEditing(false);
      } catch (error) {
        console.error(error);
        toast.error("Failed to update settings");
      }
    },
  });

  if (settings === undefined) {
    return <AppSettingsSkeleton />;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="w-full"
      >
        <div className="flex items-center justify-between border-b border-white/5 pb-6">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-white mb-2">
              General Settings
            </h1>
            <p className="text-sm text-white/40 font-medium tracking-tight">
              Manage global application behaviors and defaults.
            </p>
          </div>
          <div>
            {!isEditing ? (
              <Button
                type="button"
                onClick={() => setIsEditing(true)}
                size="sm"
                className="bg-white/5 hover:bg-white/10 text-white border border-white/5 gap-2 rounded-lg font-bold text-xs uppercase tracking-wider h-10 px-4"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit Settings
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  onClick={() => {
                    form.reset();
                    setIsEditing(false);
                  }}
                  size="sm"
                  variant="ghost"
                  className="text-white/60 hover:text-white hover:bg-white/5 gap-2 rounded-lg font-bold text-xs uppercase tracking-wider h-10 px-4"
                >
                  <X className="h-3.5 w-3.5" />
                  Cancel
                </Button>
                <form.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
                >
                  {([canSubmit, isSubmitting]) => (
                    <Button
                      type="submit"
                      disabled={!canSubmit || isSubmitting}
                      size="sm"
                      className={cn(
                        "gap-2 rounded-lg font-bold text-xs uppercase tracking-wider h-10 px-4 transition-all",
                        isSubmitting
                          ? "bg-white/10 text-white/50"
                          : "bg-primary text-primary-foreground shadow-lg shadow-primary/20",
                      )}
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Check className="h-3.5 w-3.5" />
                      )}
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                  )}
                </form.Subscribe>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 space-y-12">
          {/* Quotation Defaults */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 pb-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-black uppercase tracking-widest text-white/60">
                  Quotation Defaults
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <form.Field name="quotation.defaultTaxRate">
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
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="quotation.defaultValidityDays">
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
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="quotation.codePrefix">
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
                          Prefix for generated quotation numbers (e.g. QE-1001)
                        </FieldDescription>
                      )}
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>
            </div>

            <form.Field name="quotation.defaultTerms">
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
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>
          </section>

          {/* Notifications */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 pb-2 border-b border-white/5 justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-black uppercase tracking-widest text-white/60">
                  Notifications
                </h2>
              </div>

              <form.Field name="notifications.enableEmailNotifications">
                {(field) => (
                  <Field
                    orientation="horizontal"
                    className={cn(
                      "bg-transparent px-3 py-1 rounded-lg transition-colors gap-3 items-center",
                      isEditing
                        ? "cursor-pointer hover:bg-white/5"
                        : "cursor-default",
                    )}
                  >
                    <FieldLabel
                      className={cn(
                        "text-[10px] font-black uppercase tracking-widest text-white/40 mb-0",
                        isEditing ? "cursor-pointer" : "cursor-default",
                      )}
                    >
                      Email Alerts
                    </FieldLabel>
                    <Switch
                      checked={field.state.value}
                      onCheckedChange={field.handleChange}
                      disabled={!isEditing}
                      className="scale-90"
                    />
                  </Field>
                )}
              </form.Field>
            </div>

            <form.Field name="notifications.adminEmails" mode="array">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <FieldSet>
                    <div className="flex items-center justify-between mb-2">
                      <FieldLegend
                        variant="label"
                        className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-0"
                      >
                        Admin Alert Recipients
                      </FieldLegend>
                    </div>

                    <div className="space-y-3">
                      {field.state.value.length === 0 && !isEditing && (
                        <p className="text-sm text-white/30 italic px-1">
                          No email recipients configured.
                        </p>
                      )}
                      {field.state.value.map((_, index) => (
                        <form.Field
                          key={index}
                          name={`notifications.adminEmails[${index}]`}
                        >
                          {(subField) => {
                            const subInvalid =
                              subField.state.meta.isTouched &&
                              !subField.state.meta.isValid;
                            return (
                              <Field
                                orientation="horizontal"
                                data-invalid={subInvalid}
                                className="items-start"
                              >
                                <div className="flex-1">
                                  {isEditing ? (
                                    <Input
                                      value={subField.state.value}
                                      onBlur={subField.handleBlur}
                                      onChange={(e) =>
                                        subField.handleChange(e.target.value)
                                      }
                                      className="bg-white/5 border-white/10 focus:border-primary/50 focus:bg-white/10 rounded-lg h-10 font-bold text-white flex-1 transition-all text-sm"
                                      placeholder="admin@example.com"
                                      aria-invalid={subInvalid}
                                    />
                                  ) : (
                                    <div className="text-white font-medium h-10 flex items-center px-1 text-sm bg-transparent border-transparent">
                                      {subField.state.value}
                                    </div>
                                  )}
                                  {subInvalid && (
                                    <FieldError
                                      errors={subField.state.meta.errors}
                                    />
                                  )}
                                </div>
                                {isEditing && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => field.removeValue(index)}
                                    className="h-10 w-10 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:scale-110 transition-all"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </Field>
                            );
                          }}
                        </form.Field>
                      ))}
                      {isEditing && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => field.pushValue("")}
                          className="w-full h-10 border-dashed border-white/10 hover:border-primary/50 hover:bg-primary/5 rounded-lg text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-primary transition-all gap-2"
                        >
                          <Plus className="h-3 w-3" />
                          Add Recipient Email
                        </Button>
                      )}
                    </div>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </FieldSet>
                );
              }}
            </form.Field>
          </section>
        </div>
      </form>
    </div>
  );
}
