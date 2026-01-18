"use client";

import { useForm } from "@tanstack/react-form";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone, Building, ArrowRight, X } from "lucide-react";
import { useEffect } from "react";
import type { AdminClient } from "./client-list/types";

interface ClientFormValues {
  name: string;
  email: string;
  phone?: string;
  company?: string;
}

interface ClientEditDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (values: ClientFormValues) => Promise<void>;
  client: AdminClient | null;
}

export function ClientEditDrawer({
  open,
  onOpenChange,
  onSave,
  client,
}: ClientEditDrawerProps) {
  const form = useForm({
    defaultValues: {
      name: client?.name ?? "",
      email: client?.email ?? "",
      phone: client?.phone ?? "",
      company: client?.company ?? "",
    },
    onSubmit: async ({ value }) => {
      await onSave(value as ClientFormValues);
    },
  });

  // Reset form when client or open changes
  useEffect(() => {
    if (open && client) {
      form.reset();
    }
  }, [client, open]);

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="bg-zinc-950 border-white/10 h-full sm:max-w-xl ml-auto rounded-none flex flex-col">
        <DrawerHeader className="border-b border-white/5 py-8 relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 text-white/20 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
          <DrawerTitle className="text-3xl font-black text-white uppercase tracking-tighter">
            Edit Client
          </DrawerTitle>
          <DrawerDescription className="text-white/40 font-bold uppercase tracking-widest text-[10px] mt-2">
            Update profile information for {client?.name}
          </DrawerDescription>
        </DrawerHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar"
        >
          <div className="space-y-8">
            {/* Name */}
            <form.Field name="name">
              {(field) => (
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20" />
                    <Input
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="bg-white/5 border-white/10 text-white h-12 rounded-xl pl-12 focus:ring-primary/20 font-bold"
                      placeholder="Client Name"
                    />
                  </div>
                </div>
              )}
            </form.Field>

            {/* Email */}
            <form.Field name="email">
              {(field) => (
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20" />
                    <Input
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      disabled // Email is typically read-only as it's linked to auth
                      className="bg-white/5 border-white/10 text-white/40 h-12 rounded-xl pl-12 font-bold cursor-not-allowed"
                    />
                  </div>
                </div>
              )}
            </form.Field>

            {/* Phone */}
            <form.Field name="phone">
              {(field) => (
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20" />
                    <Input
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="bg-white/5 border-white/10 text-white h-12 rounded-xl pl-12 focus:ring-primary/20 font-bold"
                    />
                  </div>
                </div>
              )}
            </form.Field>

            {/* Company */}
            <form.Field name="company">
              {(field) => (
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">
                    Company Name
                  </Label>
                  <div className="relative">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20" />
                    <Input
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="bg-white/5 border-white/10 text-white h-12 rounded-xl pl-12 focus:ring-primary/20 font-bold"
                    />
                  </div>
                </div>
              )}
            </form.Field>
          </div>

          <div className="pt-8 space-y-3">
            <form.Subscribe
              selector={(state) => ({
                canSubmit: state.canSubmit,
                isSubmitting: state.isSubmitting,
              })}
            >
              {({ canSubmit, isSubmitting }) => (
                <Button
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                  className="w-full h-14 bg-primary text-primary-foreground font-black uppercase tracking-[0.3em] text-[10px] rounded-xl shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 group"
                >
                  <div className="flex items-center gap-3">
                    {isSubmitting ? (
                      "Saving..."
                    ) : (
                      <>
                        Update Profile
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </div>
                </Button>
              )}
            </form.Subscribe>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="w-full h-12 text-white/40 hover:text-white font-black uppercase tracking-widest text-[10px]"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
