"use client";

import { useForm } from "@tanstack/react-form";
import {
  ArrowRight,
  Database,
  HardDrive,
  IndianRupee,
  Info,
} from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { StorageTier } from "./types";

export interface StorageTierFormValues {
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
      sizeGB: initialData?.sizeGB ?? 0,
      priceINR: initialData?.priceINR ?? 0,
      isActive: initialData?.isActive ?? true,
    },
    onSubmit: async ({ value }) => {
      await onSave(value as StorageTierFormValues);
    },
  });

  // Reset form when initialData or open changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: form.reset() needs to happen when open state or initialData changes
  useEffect(() => {
    if (open) {
      form.reset();
    }
  }, [initialData, open]);

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="bg-zinc-950 border-white/10 h-full sm:max-w-xl ml-auto rounded-none flex flex-col">
        <DrawerHeader className="border-b border-white/5 py-8">
          <DrawerTitle className="text-3xl font-black text-white uppercase tracking-tighter">
            {initialData ? "Modify Tier" : "Create Tier"}
          </DrawerTitle>
          <DrawerDescription className="text-white/40 font-bold uppercase tracking-widest text-[10px] mt-2">
            Pricing structure for client cloud storage allocation
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
            {/* Tier Name */}
            <form.Field name="name">
              {(field) => (
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">
                    Plan Name
                  </Label>
                  <div className="relative">
                    <Database className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20" />
                    <Input
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="bg-white/5 border-white/10 text-white h-12 rounded-xl pl-12 focus:ring-primary/20 font-bold"
                      placeholder="e.g. Pro Suite"
                    />
                  </div>
                </div>
              )}
            </form.Field>

            <div className="grid grid-cols-2 gap-6">
              {/* Size in GB */}
              <form.Field name="sizeGB">
                {(field) => (
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">
                      Capacity (GB)
                    </Label>
                    <div className="relative">
                      <HardDrive className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20" />
                      <Input
                        type="number"
                        value={field.state.value}
                        onChange={(e) =>
                          field.handleChange(Number(e.target.value))
                        }
                        className="bg-white/5 border-white/10 text-white h-12 rounded-xl pl-12 focus:ring-primary/20 font-bold"
                        placeholder="100"
                      />
                    </div>
                  </div>
                )}
              </form.Field>

              {/* Price in INR */}
              <form.Field name="priceINR">
                {(field) => (
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">
                      Price (INR)
                    </Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20" />
                      <Input
                        type="number"
                        value={field.state.value}
                        onChange={(e) =>
                          field.handleChange(Number(e.target.value))
                        }
                        className="bg-white/5 border-white/10 text-white h-12 rounded-xl pl-12 focus:ring-primary/20 font-bold"
                        placeholder="999"
                      />
                    </div>
                  </div>
                )}
              </form.Field>
            </div>

            {/* Active Status */}
            <form.Field name="isActive">
              {(field) => (
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/3 border border-white/5 transition-colors hover:bg-white/5">
                  <div className="flex gap-4">
                    <div className="mt-1 p-2 rounded-xl bg-white/5 border border-white/5">
                      <Info className="h-4 w-4 text-white/40" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-white uppercase tracking-tight">
                        Active Status
                      </p>
                      <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-0.5">
                        {field.state.value
                          ? "Available for new quotations"
                          : "Hidden from tier selection"}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={field.state.value}
                    onCheckedChange={field.handleChange}
                  />
                </div>
              )}
            </form.Field>
          </div>

          <div className="pt-8">
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
                      "Processing..."
                    ) : (
                      <>
                        {initialData ? "Update Plan" : "Confirm Plan"}
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
              className="w-full h-12 text-white/40 hover:text-white font-black uppercase tracking-widest text-[10px] mt-2"
            >
              Discard Changes
            </Button>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
