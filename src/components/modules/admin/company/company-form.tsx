"use client";

import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { Save, Building2, MapPin, Phone, Mail, Globe, CreditCard, Landmark } from "lucide-react";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const companySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  tagline: z.string().optional(),
  address: z.string().min(5, "Address must be at least 5 characters"),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  gstNumber: z.string().optional(),
  panNumber: z.string().optional(),
  bankDetails: z.object({
    bankName: z.string(),
    accountHolder: z.string(),
    accountNumber: z.string(),
    ifscCode: z.string(),
    branch: z.string().optional(),
  }),
});

type CompanyFormData = z.infer<typeof companySchema>;

interface CompanyFormProps {
  initialData?: any;
  onSubmit: (values: CompanyFormData) => Promise<void>;
}

export function CompanyForm({ initialData, onSubmit }: CompanyFormProps) {
  const form = useForm<CompanyFormData>({
    defaultValues: {
      name: initialData?.name ?? "",
      tagline: initialData?.tagline ?? "",
      address: initialData?.address ?? "",
      phone: initialData?.phone ?? "",
      email: initialData?.email ?? "",
      website: initialData?.website ?? "",
      gstNumber: initialData?.gstNumber ?? "",
      panNumber: initialData?.panNumber ?? "",
      bankDetails: {
        bankName: initialData?.bankDetails?.bankName ?? "",
        accountHolder: initialData?.bankDetails?.accountHolder ?? "",
        accountNumber: initialData?.bankDetails?.accountNumber ?? "",
        ifscCode: initialData?.bankDetails?.ifscCode ?? "",
        branch: initialData?.bankDetails?.branch ?? "",
      },
    },
    validatorAdapter: zodValidator(),
    validators: {
      onChange: companySchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-12"
    >
      {/* Identity Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
          <Building2 className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-black uppercase tracking-tight text-white">Identity</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <form.Field name="name">
            {(field) => (
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Company Name *</Label>
                <Input
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="PrimeEditz"
                  className="bg-white/5 border-white/10 rounded-xl h-11 font-bold text-white"
                />
              </div>
            )}
          </form.Field>
          <form.Field name="tagline">
            {(field) => (
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Tagline</Label>
                <Input
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Post-Production Excellence"
                  className="bg-white/5 border-white/10 rounded-xl h-11 font-bold text-white"
                />
              </div>
            )}
          </form.Field>
        </div>
      </section>

      {/* Contact Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
          <MapPin className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-black uppercase tracking-tight text-white">Contact & Location</h2>
        </div>
        <div className="grid grid-cols-1 gap-6">
          <form.Field name="address">
            {(field) => (
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Full Billing Address *</Label>
                <Textarea
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Enter full registered address..."
                  className="bg-white/5 border-white/10 rounded-xl min-h-[100px] font-bold text-white resize-none"
                />
              </div>
            )}
          </form.Field>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <form.Field name="phone">
              {(field) => (
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Phone Number</Label>
                  <Input
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="+91 22 4455 6677"
                    className="bg-white/5 border-white/10 rounded-xl h-11 font-bold text-white"
                  />
                </div>
              )}
            </form.Field>
            <form.Field name="email">
              {(field) => (
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Support Email</Label>
                  <Input
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="studio@primeeditz.com"
                    className="bg-white/5 border-white/10 rounded-xl h-11 font-bold text-white"
                  />
                </div>
              )}
            </form.Field>
            <form.Field name="website">
              {(field) => (
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Website</Label>
                  <Input
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="https://primeeditz.com"
                    className="bg-white/5 border-white/10 rounded-xl h-11 font-bold text-white"
                  />
                </div>
              )}
            </form.Field>
          </div>
        </div>
      </section>

      {/* Billing Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
          <CreditCard className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-black uppercase tracking-tight text-white">Tax & Billing</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <form.Field name="gstNumber">
            {(field) => (
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">GST Number</Label>
                <Input
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="27AAAC... (Optional)"
                  className="bg-white/5 border-white/10 rounded-xl h-11 font-bold text-white"
                />
              </div>
            )}
          </form.Field>
          <form.Field name="panNumber">
            {(field) => (
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">PAN Number</Label>
                <Input
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="ABCDE1234F (Optional)"
                  className="bg-white/5 border-white/10 rounded-xl h-11 font-bold text-white"
                />
              </div>
            )}
          </form.Field>
        </div>
      </section>

      {/* Bank Details Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
          <Landmark className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-black uppercase tracking-tight text-white">Bank Details (for Payments)</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <form.Field name="bankDetails.bankName">
            {(field) => (
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Bank Name</Label>
                <Input
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="HDFC Bank"
                  className="bg-white/5 border-white/10 rounded-xl h-11 font-bold text-white"
                />
              </div>
            )}
          </form.Field>
          <form.Field name="bankDetails.accountHolder">
            {(field) => (
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Account Holder Name</Label>
                <Input
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="PRIMEEDITZ PRIVATE LIMITED"
                  className="bg-white/5 border-white/10 rounded-xl h-11 font-bold text-white"
                />
              </div>
            )}
          </form.Field>
          <form.Field name="bankDetails.accountNumber">
            {(field) => (
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Account Number</Label>
                <Input
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="50200012345678"
                  className="bg-white/5 border-white/10 rounded-xl h-11 font-bold text-white"
                />
              </div>
            )}
          </form.Field>
          <div className="grid grid-cols-2 gap-6">
            <form.Field name="bankDetails.ifscCode">
              {(field) => (
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">IFSC Code</Label>
                  <Input
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="HDFC0001234"
                    className="bg-white/5 border-white/10 rounded-xl h-11 font-bold text-white"
                  />
                </div>
              )}
            </form.Field>
            <form.Field name="bankDetails.branch">
              {(field) => (
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Branch</Label>
                  <Input
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Film City Branch"
                    className="bg-white/5 border-white/10 rounded-xl h-11 font-bold text-white"
                  />
                </div>
              )}
            </form.Field>
          </div>
        </div>
      </section>

      {/* Footer Actions */}
      <div className="pt-10 border-t border-white/5 flex justify-end">
        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="h-12 px-8 rounded-xl bg-primary text-[11px] font-black uppercase tracking-widest text-primary-foreground gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {isSubmitting ? (
                "Saving..."
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
