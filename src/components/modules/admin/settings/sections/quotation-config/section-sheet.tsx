"use client";

import { useForm } from "@tanstack/react-form";
import { Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { sectionSchema, SectionFormData } from "./schema";
import { colorOptions } from "./constants";

export function SectionSheet({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: any;
  onSubmit: (values: SectionFormData) => Promise<void>;
  onDelete?: () => void;
}) {
  const form = useForm({
    defaultValues: {
      name: initialData?.name ?? "",
      color: initialData?.color ?? "zinc",
    } as SectionFormData,
    validators: {
      onSubmit: sectionSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-zinc-950 border-l border-white/10 p-0 sm:max-w-md">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-6 border-b border-white/5 space-y-1">
            <SheetTitle className="text-2xl font-black uppercase tracking-tight text-white">
              {initialData ? "Edit Section" : "New Section"}
            </SheetTitle>
            <SheetDescription className="text-white/40 font-medium">
              Configure the details for this proposal section.
            </SheetDescription>
          </SheetHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="flex-1 overflow-y-auto p-6 space-y-8"
          >
            <form.Field name="name">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel
                      htmlFor={field.name}
                      className="text-[10px] font-black uppercase tracking-widest text-white/40"
                    >
                      Section Name
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="e.g. Photography"
                      className="bg-white/5 border-white/10 rounded-xl h-12 font-bold text-white text-lg focus:border-primary/50 transition-all"
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="color">
              {(field) => (
                <Field>
                  <FieldLabel className="text-[10px] font-black uppercase tracking-widest text-white/40">
                    Theme Color
                  </FieldLabel>
                  <div className="grid grid-cols-4 gap-3">
                    {colorOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => field.handleChange(option.value)}
                        className={cn(
                          "aspect-square rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 group/color",
                          option.bg,
                          field.state.value === option.value
                            ? "border-white ring-2 ring-white/20 ring-offset-2 ring-offset-zinc-950 scale-105"
                            : "border-transparent opacity-80 hover:opacity-100 hover:scale-105",
                        )}
                      >
                        {field.state.value === option.value && (
                          <Check className="h-6 w-6 text-white drop-shadow-md" />
                        )}
                      </button>
                    ))}
                  </div>
                </Field>
              )}
            </form.Field>
          </form>

          <div className="p-6 border-t border-white/5 bg-zinc-900/50 flex items-center justify-between gap-4">
            {initialData && onDelete && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  if (
                    confirm("Are you sure you want to delete this section?")
                  ) {
                    onDelete();
                    onOpenChange(false);
                  }
                }}
                className="h-12 w-12 rounded-xl text-red-500 hover:bg-red-500/10"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            )}

            <div className="flex gap-3 ml-auto w-full justify-end">
              <SheetClose asChild>
                <Button
                  variant="ghost"
                  className="h-12 rounded-xl text-white/60 hover:text-white hover:bg-white/5"
                >
                  Cancel
                </Button>
              </SheetClose>
              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
              >
                {([canSubmit, isSubmitting]) => (
                  <Button
                    onClick={form.handleSubmit}
                    disabled={!canSubmit || isSubmitting}
                    className="h-12 w-32 rounded-xl bg-primary text-[11px] font-black uppercase tracking-widest text-primary-foreground shadow-lg shadow-primary/20"
                  >
                    {isSubmitting ? "Saving..." : "Save"}
                  </Button>
                )}
              </form.Subscribe>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
