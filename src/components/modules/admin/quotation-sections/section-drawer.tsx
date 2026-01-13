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
import { useEffect, useState } from "react";
import {
  Film,
  Hammer,
  PenTool,
  Package,
  Camera,
  Music,
  Briefcase,
  LucideIcon,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Section } from "./types";

const sectionSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  icon: z.string().optional(),
  color: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type SectionFormValues = z.infer<typeof sectionSchema>;

interface SectionDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (values: SectionFormValues) => Promise<void>;
  initialData?: Section | null;
}

const AVAILABLE_ICONS = [
  { name: "Film", icon: Film },
  { name: "Hammer", icon: Hammer },
  { name: "PenTool", icon: PenTool },
  { name: "Package", icon: Package },
  { name: "Camera", icon: Camera },
  { name: "Music", icon: Music },
  { name: "Briefcase", icon: Briefcase },
];

const AVAILABLE_COLORS = [
  { name: "Blue", value: "blue", class: "bg-blue-500" },
  { name: "Purple", value: "purple", class: "bg-purple-500" },
  { name: "Green", value: "green", class: "bg-green-500" },
  { name: "Amber", value: "amber", class: "bg-amber-500" },
  { name: "Red", value: "red", class: "bg-red-500" },
  { name: "Slate", value: "slate", class: "bg-slate-500" },
];

export function SectionDrawer({
  open,
  onOpenChange,
  onSave,
  initialData,
}: SectionDrawerProps) {
  const form = useForm({
    defaultValues: {
      name: initialData?.name ?? "",
      icon: initialData?.icon ?? "Film",
      color: initialData?.color ?? "blue",
      isActive: initialData?.isActive ?? true,
    },
    onSubmit: async ({ value }) => {
      await onSave(value as SectionFormValues);
    },
  });

  useEffect(() => {
    if (open) {
      form.reset();
    }
  }, [initialData, open, form]);

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="bg-zinc-950 border-white/10 h-full max-sm:w-full ml-auto rounded-none w-[400px]">
        <div className="mx-auto w-full flex flex-col h-full">
          <DrawerHeader>
            <DrawerTitle className="text-2xl font-black text-white uppercase tracking-tighter">
              {initialData ? "Edit Section" : "New Section"}
            </DrawerTitle>
            <DrawerDescription className="text-white/40 font-bold uppercase tracking-widest text-[10px]">
              {initialData
                ? "Modify the existing quotation section parameters."
                : "Create a new category to organize quotation line items."}
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
                      Section Name *
                    </Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="bg-white/5 border-white/10 text-white h-14 rounded-2xl focus:ring-primary/20 font-bold"
                      placeholder="e.g. Post-Production Services"
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">
                        {field.state.meta.errors.join(", ")}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>

              <form.Field name="icon">
                {(field) => (
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">
                      Icon
                    </Label>
                    <div className="grid grid-cols-4 gap-2">
                      {AVAILABLE_ICONS.map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.name}
                            type="button"
                            onClick={() => field.handleChange(item.name)}
                            className={cn(
                              "flex items-center justify-center h-12 rounded-xl transition-all border",
                              field.state.value === item.name
                                ? "bg-primary/20 border-primary text-primary"
                                : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white"
                            )}
                          >
                            <Icon className="h-5 w-5" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </form.Field>

              <form.Field name="color">
                {(field) => (
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">
                      Accent Color
                    </Label>
                    <div className="flex flex-wrap gap-3">
                      {AVAILABLE_COLORS.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => field.handleChange(color.value)}
                          className={cn(
                            "h-8 w-8 rounded-full border-2 transition-all flex items-center justify-center",
                            color.class,
                            field.state.value === color.value
                              ? "border-white scale-110"
                              : "border-transparent opacity-60 hover:opacity-100"
                          )}
                        >
                          {field.state.value === color.value && (
                            <Check className="h-4 w-4 text-white" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </form.Field>

              <form.Field name="isActive">
                {(field) => (
                  <div className="flex items-center justify-between p-5 rounded-2xl bg-white/3 border border-white/5 transition-colors hover:bg-white/5">
                    <div className="space-y-1">
                      <Label className="text-white font-black uppercase tracking-tight">
                        Status
                      </Label>
                      <p className="text-[9px] text-white/20 uppercase tracking-[0.2em] font-black">
                        Enable in quotations
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

            <div className="pt-8">
              <form.Subscribe
                selector={(state) => ({
                  canSubmit: state.canSubmit,
                  isSubmitting: state.isSubmitting,
                })}
              >
                {(state) => (
                  <Button
                    type="submit"
                    className="w-full h-14 bg-primary text-primary-foreground font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    disabled={!state.canSubmit || state.isSubmitting}
                  >
                    {state.isSubmitting
                      ? "Saving..."
                      : initialData
                      ? "Update Section"
                      : "Create Section"}
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
