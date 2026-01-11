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
import { Textarea } from "@/components/ui/textarea";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { TypeSpecificOptions } from "../fields/type-specific-options";

const fieldSchema = z.object({
  name: z
    .string()
    .min(1, "Field key is required")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers and underscores allowed"),
  label: z.string().min(1, "Display label is required"),
  type: z.enum(["text", "number", "select", "checkbox", "textarea"]),
  required: z.boolean().default(false),
  placeholder: z.string().optional(),
  description: z.string().optional(),
  options: z.string().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  isActive: z.boolean().default(true),
});

export type FieldFormValues = z.infer<typeof fieldSchema>;

interface FieldDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (values: FieldFormValues) => Promise<void>;
  initialData?: any | null;
  projectTypeId: string;
  nextDisplayOrder: number;
}

const FIELD_TYPES = [
  { value: "text", label: "Text Input" },
  { value: "number", label: "Number Input" },
  { value: "select", label: "Dropdown" },
  { value: "checkbox", label: "Checkbox" },
  { value: "textarea", label: "Text Area" },
];

export function FieldDrawer({
  open,
  onOpenChange,
  onSave,
  initialData,
}: FieldDrawerProps) {
  const form = useForm({
    defaultValues: {
      name: initialData?.name ?? "",
      label: initialData?.label ?? "",
      type: (initialData?.type as any) ?? "text",
      required: initialData?.required ?? false,
      placeholder: initialData?.placeholder ?? "",
      description: initialData?.description ?? "",
      options: initialData?.options ?? "[]",
      min: initialData?.min ?? undefined,
      max: initialData?.max ?? undefined,
      isActive: initialData?.isActive ?? true,
    },
    onSubmit: async ({ value }) => {
      await onSave(value);
    },
  });

  useEffect(() => {
    if (open) form.reset();
  }, [initialData, open, form]);

  const handleLabelChange = (label: string, field: any) => {
    field.handleChange(label);
    if (!initialData && !form.getFieldValue("name")) {
      const generatedName = label
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_|_$/g, "");
      form.setFieldValue("name", generatedName);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="bg-zinc-950 border-white/10 h-full max-sm:w-full ml-auto rounded-none">
        <div className="mx-auto w-full flex flex-col h-full">
          <DrawerHeader>
            <DrawerTitle className="text-2xl font-black text-white uppercase tracking-tighter">
              {initialData ? "Modify Field" : "Register Field"}
            </DrawerTitle>
            <DrawerDescription className="text-white/40 font-bold uppercase tracking-widest text-[10px]">
              Configure how this data should be collected in the wizard.
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
              <div className="grid grid-cols-1 gap-6">
                <form.Field
                  name="label"
                  validators={{
                    onChange: ({ value }) =>
                      !value ? "Label is required" : undefined,
                  }}
                >
                  {(field) => (
                    <div className="space-y-2">
                      <Label
                        htmlFor={field.name}
                        className="text-white/60 font-medium"
                      >
                        Display Label
                      </Label>
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          handleLabelChange(e.target.value, field)
                        }
                        className="bg-white/5 border-white/10 text-white h-12 focus:ring-primary/20"
                        placeholder="e.g. Number of Albums"
                      />
                      {field.state.meta.errors.length > 0 && (
                        <p className="text-xs font-medium text-red-500">
                          {field.state.meta.errors.join(", ")}
                        </p>
                      )}
                    </div>
                  )}
                </form.Field>

                <form.Field
                  name="name"
                  validators={{
                    onChange: ({ value }) => {
                      if (!value) return "Name is required";
                      if (!/^[a-zA-Z0-9_]+$/.test(value))
                        return "Only letters, numbers and underscores allowed";
                      return undefined;
                    },
                  }}
                >
                  {(field) => (
                    <div className="space-y-2">
                      <Label
                        htmlFor={field.name}
                        className="text-white/60 font-medium"
                      >
                        Field Key (Internal)
                      </Label>
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="bg-white/5 border-white/10 text-white h-12 font-mono text-sm focus:ring-primary/20"
                        placeholder="e.g. album_count"
                        disabled={!!initialData}
                      />
                      <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                        Unique database identifier
                      </p>
                      {field.state.meta.errors.length > 0 && (
                        <p className="text-xs font-medium text-red-500">
                          {field.state.meta.errors.join(", ")}
                        </p>
                      )}
                    </div>
                  )}
                </form.Field>
              </div>

              <form.Field name="type">
                {(field) => (
                  <div className="space-y-3">
                    <Label className="text-white/60 font-medium">
                      Field Type
                    </Label>
                    <div className="grid grid-cols-3 gap-2">
                      {FIELD_TYPES.map((t) => (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => field.handleChange(t.value as any)}
                          className={cn(
                            "px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border",
                            field.state.value === t.value
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-white/5 text-white/40 border-white/5 hover:border-white/10 hover:text-white"
                          )}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </form.Field>

              <form.Subscribe selector={(state) => state.values.type}>
                {(type) => <TypeSpecificOptions type={type} form={form} />}
              </form.Subscribe>

              <form.Field name="description">
                {(field) => (
                  <div className="space-y-2">
                    <Label className="text-white/60 font-medium text-xs">
                      Help Text (Description)
                    </Label>
                    <Textarea
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="bg-white/5 border-white/10 text-white min-h-[80px]"
                      placeholder="Will appear below the field to guide the user."
                    />
                  </div>
                )}
              </form.Field>

              <div className="grid grid-cols-2 gap-4">
                <form.Field name="required">
                  {(field) => (
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="space-y-0.5">
                        <Label className="text-white text-xs font-medium">
                          Required
                        </Label>
                        <p className="text-[9px] text-white/40 uppercase font-bold tracking-tighter">
                          Mandatory
                        </p>
                      </div>
                      <Switch
                        checked={field.state.value}
                        onCheckedChange={field.handleChange}
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="isActive">
                  {(field) => (
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="space-y-0.5">
                        <Label className="text-white text-xs font-medium">
                          Active
                        </Label>
                        <p className="text-[9px] text-white/40 uppercase font-bold tracking-tighter">
                          Visible
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
            </div>

            <div className="pt-8">
              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
              >
                {([canSubmit, isSubmitting]) => (
                  <Button
                    type="submit"
                    className="w-full h-12 bg-primary text-primary-foreground font-bold uppercase tracking-widest text-xs"
                    disabled={!canSubmit || isSubmitting}
                  >
                    {isSubmitting
                      ? "Saving..."
                      : initialData
                      ? "Update Field"
                      : "Create Field"}
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
