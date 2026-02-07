"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { toast } from "sonner";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import * as z from "zod";
import { FileText, Bell, Save, Percent, Calendar, Hash, Mail, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";

const appSettingsSchema = z.object({
  quotation: z.object({
    defaultTaxRate: z.number().min(0).max(100),
    defaultValidityDays: z.number().min(1),
    defaultTerms: z.string().optional(),
    codePrefix: z.string().optional(),
  }),
  notifications: z.object({
    adminEmails: z.array(z.string().email()),
    enableEmailNotifications: z.boolean(),
  }),
});

export function AppSettings() {
  const settings = useQuery(api.functions.settings.queries.get);
  const updateQuotation = useMutation(api.functions.settings.mutations.updateQuotationSettings);
  const updateNotifications = useMutation(api.functions.settings.mutations.updateNotificationSettings);

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
        enableEmailNotifications: settings?.notifications?.enableEmailNotifications ?? true,
      },
    },
    validatorAdapter: zodValidator(),
    onSubmit: async ({ value }) => {
      try {
        await Promise.all([
          updateQuotation(value.quotation),
          updateNotifications(value.notifications),
        ]);
        toast.success("General settings updated successfully");
      } catch (error) {
        console.error(error);
        toast.error("Failed to update settings");
      }
    },
  });

  if (!settings) {
    return <AppSettingsSkeleton />;
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-16"
    >
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black uppercase tracking-tight text-white mb-2 italic">General Settings</h1>
        <p className="text-sm text-white/40 font-bold tracking-tight">Manage global application behaviors and defaults.</p>
      </div>

      {/* Quotation Defaults */}
      <section className="space-y-8">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-black uppercase tracking-tight text-white">Quotation Defaults</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <form.Field name="quotation.defaultTaxRate">
            {(field) => (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Default Tax Rate (%)</Label>
                  <Percent className="h-3 w-3 text-white/20" />
                </div>
                <Input
                  type="number"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                  className="bg-white/5 border-white/10 rounded-xl h-12 font-bold text-white text-lg"
                />
              </div>
            )}
          </form.Field>

          <form.Field name="quotation.defaultValidityDays">
            {(field) => (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Default Validity (Days)</Label>
                  <Calendar className="h-3 w-3 text-white/20" />
                </div>
                <Input
                  type="number"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                  className="bg-white/5 border-white/10 rounded-xl h-12 font-bold text-white text-lg"
                />
              </div>
            )}
          </form.Field>

          <form.Field name="quotation.codePrefix">
            {(field) => (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Quotation Code Prefix</Label>
                  <Hash className="h-3 w-3 text-white/20" />
                </div>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="QE-"
                  className="bg-white/5 border-white/10 rounded-xl h-12 font-bold text-white text-lg"
                />
              </div>
            )}
          </form.Field>
        </div>

        <form.Field name="quotation.defaultTerms">
          {(field) => (
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Default Terms & Conditions</Label>
              <Textarea
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Enter global terms..."
                className="bg-white/5 border-white/10 rounded-2xl min-h-[150px] font-medium text-white/60 resize-none p-6 text-sm"
              />
            </div>
          )}
        </form.Field>
      </section>

      {/* Notifications */}
      <section className="space-y-8">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight text-white">Notifications</h2>
          </div>
          
          <form.Field name="notifications.enableEmailNotifications">
            {(field) => (
              <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Email Alerts</Label>
                <Switch
                  checked={field.state.value}
                  onCheckedChange={field.handleChange}
                />
              </div>
            )}
          </form.Field>
        </div>

        <form.Field name="notifications.adminEmails">
          {(field) => (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Admin Alert Recipients</Label>
                <Mail className="h-3 w-3 text-white/20" />
              </div>
              <div className="space-y-3">
                {field.state.value.map((email, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={email}
                      onChange={(e) => {
                        const next = [...field.state.value];
                        next[index] = e.target.value;
                        field.handleChange(next);
                      }}
                      className="bg-white/5 border-white/10 rounded-xl h-11 font-bold text-white flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        const next = field.state.value.filter((_, i) => i !== index);
                        field.handleChange(next);
                      }}
                      className="h-11 w-11 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20"
                    >
                      <ShieldAlert className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => field.handleChange([...field.state.value, ""])}
                  className="w-full h-11 border-dashed border-white/10 hover:border-primary/50 hover:bg-primary/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-primary transition-all"
                >
                  + Add Recipient Email
                </Button>
              </div>
            </div>
          )}
        </form.Field>
      </section>

      {/* Footer Actions */}
      <div className="pt-10 border-t border-white/5 flex justify-end">
        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="h-14 px-10 rounded-2xl bg-primary text-[12px] font-black uppercase tracking-[0.2em] text-primary-foreground gap-3 transition-all hover:scale-[1.05] active:scale-[0.95] shadow-xl shadow-primary/20"
            >
              {isSubmitting ? (
                "Syncing..."
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Save Global Config
                </>
              )}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}

function AppSettingsSkeleton() {
  return (
    <div className="space-y-16">
      <div className="space-y-3">
        <Skeleton className="h-10 w-64 bg-white/5" />
        <Skeleton className="h-4 w-96 bg-white/5" />
      </div>
      <div className="space-y-8">
        <Skeleton className="h-12 w-full bg-white/5 rounded-2xl" />
        <div className="grid grid-cols-2 gap-8">
          <Skeleton className="h-24 w-full bg-white/5 rounded-2xl" />
          <Skeleton className="h-24 w-full bg-white/5 rounded-2xl" />
        </div>
        <Skeleton className="h-48 w-full bg-white/5 rounded-2xl" />
      </div>
    </div>
  );
}
