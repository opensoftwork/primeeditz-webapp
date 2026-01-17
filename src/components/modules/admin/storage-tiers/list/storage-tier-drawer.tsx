"use client";

import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useEffect } from "react";
import { HardDrive, IndianRupee, ArrowRight } from "lucide-react";

const storageTierSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  sizeGB: z.number().min(1, "Capacity must be at least 1 GB"),
  priceINR: z.number().min(0, "Price cannot be negative"),
  isActive: z.boolean().default(true),
});

export type StorageTierFormValues = z.infer<typeof storageTierSchema>;

interface StorageTier {
  _id: string;
  name: string;
  sizeGB: number;
  priceINR: number;
  isActive: boolean;
}

interface StorageTierDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (values: StorageTierFormValues) => Promise<void>;
  initialData?: StorageTier | null;
}

export function StorageTierDrawer({
  open,
  onOpenChange,
  onSave,
  initialData,
}: StorageTierDrawerProps) {
  const form = useForm({
    defaultValues: {
      name: initialData?.name ?? "",
      sizeGB: initialData?.sizeGB ?? 100,
      priceINR: initialData?.priceINR ?? 0,
      isActive: initialData?.isActive ?? true,
    },
    onSubmit: async ({ value }) => {
      await onSave(value as StorageTierFormValues);
    },
  });

  // Reset form when initialData or open changes
  useEffect(() => {
    if (open) {
      form.reset();
    }
  }, [initialData, open, form]);

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="bg-zinc-950 border-white/10 h-full max-sm:w-full ml-auto rounded-none">
        <div className="mx-auto w-full flex flex-col h-full">
          <DrawerHeader>
            <DrawerTitle className="text-2xl font-black text-white uppercase tracking-tighter">
              {initialData ? "Edit Storage Tier" : "New Storage Tier"}
            </DrawerTitle>
            <DrawerDescription className="text-white/40 font-bold uppercase tracking-widest text-[10px]">
              {initialData
                ? "Update the storage tier configuration."
                : "Create a new storage package with capacity and pricing."}
            </DrawerDescription>
          </DrawerHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="flex-1 overflow-y-auto p-6 space-y-8"
          >
            <div className="space-y-6">
              {/* Name Field */}
              <form.Field
                name="name"
                validators={{
                  onChange: ({ value }) =>
                    !value || value.length < 2
                      ? "Name must be at least 2 characters"
                      : undefined,
                }}
              >
                {(field) => (
                  <div className="space-y-3">
                    <Label
                      htmlFor={field.name}
                      className="text-[10px] font-black uppercase tracking-widest text-white/40"
                    >
                      Step 01 / Tier Name
                    </Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="bg-white/5 border-white/10 text-white h-14 rounded-2xl focus:ring-primary/20 font-bold"
                      placeholder="e.g. Premium 500GB"
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">
                        {field.state.meta.errors.join(", ")}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>

              {/* Capacity Field */}
              <form.Field
                name="sizeGB"
                validators={{
                  onChange: ({ value }) =>
                    value < 1 ? "Capacity must be at least 1 GB" : undefined,
                }}
              >
                {(field) => (
                  <div className="space-y-3">
                    <Label
                      htmlFor={field.name}
                      className="text-[10px] font-black uppercase tracking-widest text-white/40"
                    >
                      Step 02 / Storage Capacity
                    </Label>
                    <div className="relative">
                      <HardDrive className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20" />
                      <Input
                        id={field.name}
                        type="number"
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(Number(e.target.value))
                        }
                        className="bg-white/5 border-white/10 text-white h-14 rounded-2xl focus:ring-primary/20 font-bold pl-12 pr-16"
                        placeholder="500"
                        min={1}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 font-black text-sm">
                        GB
                      </span>
                    </div>
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">
                        {field.state.meta.errors.join(", ")}
                      </p>
                    )}
                    <p className="text-[9px] text-white/20 font-medium">
                      For terabyte packages, use 1000 GB = 1 TB, 2000 GB = 2 TB,
                      etc.
                    </p>
                  </div>
                )}
              </form.Field>

              {/* Price Field */}
              <form.Field
                name="priceINR"
                validators={{
                  onChange: ({ value }) =>
                    value < 0 ? "Price cannot be negative" : undefined,
                }}
              >
                {(field) => (
                  <div className="space-y-3">
                    <Label
                      htmlFor={field.name}
                      className="text-[10px] font-black uppercase tracking-widest text-white/40"
                    >
                      Step 03 / Price (INR)
                    </Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20" />
                      <Input
                        id={field.name}
                        type="number"
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(Number(e.target.value))
                        }
                        className="bg-white/5 border-white/10 text-white h-14 rounded-2xl focus:ring-primary/20 font-bold pl-12"
                        placeholder="5000"
                        min={0}
                      />
                    </div>
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">
                        {field.state.meta.errors.join(", ")}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>

              {/* Active Toggle */}
              <form.Field name="isActive">
                {(field) => (
                  <div className="flex items-center justify-between p-5 rounded-2xl bg-white/3 border border-white/5 transition-colors hover:bg-white/5">
                    <div className="space-y-1">
                      <Label className="text-white font-black uppercase tracking-tight">
                        Availability
                      </Label>
                      <p className="text-[9px] text-white/20 uppercase tracking-[0.2em] font-black">
                        Show in Quotation Selection
                      </p>
                    </div>
                    <Switch
                      checked={field.state.value}
                      onCheckedChange={field.handleChange}
                    />
                  </div>
                )}
              </form.Field>
            </div>

            {/* Summary Preview */}
            <form.Subscribe
              selector={(state) => [state.values]}
            >
              {([values]) => (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                  <p className="text-[9px] text-primary/60 font-black uppercase tracking-widest mb-2">
                    Preview
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-white">
                      {values.sizeGB >= 1000
                        ? `${(values.sizeGB / 1000).toFixed(values.sizeGB % 1000 === 0 ? 0 : 1)} TB`
                        : `${values.sizeGB} GB`}
                    </span>
                    <span className="text-white/40">—</span>
                    <span className="text-xl font-black text-primary">
                      {new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                        minimumFractionDigits: 0,
                      }).format(values.priceINR)}
                    </span>
                  </div>
                  <p className="text-white/40 font-bold text-sm mt-1">
                    {values.name || "Untitled Tier"}
                  </p>
                </div>
              )}
            </form.Subscribe>

            <div className="pt-4">
              <form.Subscribe
                selector={(state) => ({
                  canSubmit: state.canSubmit,
                  isSubmitting: state.isSubmitting,
                  name: state.values.name,
                })}
              >
                {({ canSubmit, isSubmitting, name }) => (
                  <Button
                    type="submit"
                    className="w-full h-14 bg-primary text-primary-foreground font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    disabled={!canSubmit || isSubmitting || !name}
                  >
                    {isSubmitting ? (
                      "Saving..."
                    ) : (
                      <div className="flex items-center gap-2">
                        {initialData ? "Update Tier" : "Create Tier"}
                        {!initialData && <ArrowRight className="h-3 w-3" />}
                      </div>
                    )}
                  </Button>
                )}
              </form.Subscribe>
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
