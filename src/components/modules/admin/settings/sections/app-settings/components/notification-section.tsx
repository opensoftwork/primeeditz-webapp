"use client";

import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { toast } from "sonner";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { Bell, Pencil, X, Check, Loader2, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldSet,
  FieldLegend,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { notificationsSchema, NotificationsFormData } from "../schema";

interface NotificationSectionProps {
  initialData: any;
}

export function NotificationSection({ initialData }: NotificationSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const updateNotifications = useMutation(
    api.functions.settings.mutations.updateNotificationSettings,
  );

  const form = useForm({
    defaultValues: {
      adminEmails: initialData?.adminEmails ?? [],
      enableEmailNotifications: initialData?.enableEmailNotifications ?? true,
    } as NotificationsFormData,
    validators: {
      onSubmit: notificationsSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await updateNotifications(value);
        toast.success("Notification settings updated successfully");
        setIsEditing(false);
      } catch (error) {
        console.error(error);
        toast.error("Failed to update notification settings");
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
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-white/90">
              Notification Settings
            </h2>
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-0.5">
              Manage system alerts and recipients
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
            Edit Notifications
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

      <div className="mt-8 space-y-8">
        <form.Field name="enableEmailNotifications">
          {(field) => (
            <Field
              orientation="horizontal"
              className={cn(
                "bg-white/2 p-4 rounded-xl border border-white/5 transition-colors gap-3 items-center",
                isEditing
                  ? "cursor-pointer hover:bg-white/5"
                  : "cursor-default",
              )}
            >
              <div className="flex-1">
                <FieldLabel
                  className={cn(
                    "text-xs font-bold uppercase tracking-widest text-white/90 mb-1",
                    isEditing ? "cursor-pointer" : "cursor-default",
                  )}
                >
                  Email Alerts
                </FieldLabel>
                <p className="text-[10px] font-medium text-white/20 uppercase tracking-widest">
                  Enable or disable all outgoing email notifications
                </p>
              </div>
              <Switch
                checked={field.state.value}
                onCheckedChange={field.handleChange}
                disabled={!isEditing}
                className="scale-90"
              />
            </Field>
          )}
        </form.Field>

        <form.Field name="adminEmails" mode="array">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <FieldSet>
                <div className="flex items-center justify-between mb-6">
                  <FieldLegend
                    variant="label"
                    className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-0"
                  >
                    Admin Alert Recipients
                  </FieldLegend>
                </div>

                <div className="space-y-4">
                  {field.state.value.length === 0 && !isEditing && (
                    <p className="text-sm text-white/30 italic px-1">
                      No email recipients configured.
                    </p>
                  )}
                  {field.state.value.map((_, index) => (
                    <form.Field key={index} name={`adminEmails[${index}]`}>
                      {(subField) => {
                        const subInvalid =
                          subField.state.meta.isTouched &&
                          !subField.state.meta.isValid;
                        return (
                          <Field
                            orientation="horizontal"
                            data-invalid={subInvalid}
                            className="items-start gap-4"
                          >
                            <div className="flex-1">
                              {isEditing ? (
                                <Input
                                  value={subField.state.value}
                                  onBlur={subField.handleBlur}
                                  onChange={(e) =>
                                    subField.handleChange(e.target.value)
                                  }
                                  className="bg-white/5 border-white/5 focus:border-primary/30 focus:bg-white/8 rounded-xl h-12 font-bold text-white text-sm transition-all px-4"
                                  placeholder="admin@example.com"
                                  aria-invalid={subInvalid}
                                />
                              ) : (
                                <div className="text-white font-bold h-12 flex items-center px-4 text-sm bg-white/2 border border-white/5 rounded-xl">
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
                                className="h-12 w-12 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 hover:scale-110 transition-all border border-rose-500/20"
                              >
                                <Trash2 className="h-5 w-5" />
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
                      className="w-full h-12 border-dashed border-white/10 hover:border-primary/50 hover:bg-primary/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-primary transition-all gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Recipient Email
                    </Button>
                  )}
                </div>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </FieldSet>
            );
          }}
        </form.Field>
      </div>
    </div>
  );
}
