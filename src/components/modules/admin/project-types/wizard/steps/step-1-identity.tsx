"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useForm, useStore } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { useMutation, useQuery } from "convex/react";
import { Plus, Tag } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import { IconPicker } from "@/components/ui/icon-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useProjectTypeWizard } from "../wizard-context";

const step1Schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  categoryId: z.string().min(1, "Category is required"),
  isActive: z.boolean(),
  icon: z.string(),
});

export function Step1Identity({ compact = false }: { compact?: boolean }) {
  const { step1Data, setStep1Data } = useProjectTypeWizard();
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  const categories = useQuery(
    api.functions.projectCategories.queries.getActiveCategories,
  );
  const createCategory = useMutation(
    api.functions.projectCategories.mutations.createCategoryOnFly,
  );

  const form = useForm({
    defaultValues: {
      name: step1Data?.name ?? "",
      categoryId: (step1Data?.categoryId as string) ?? "",
      isActive: step1Data?.isActive ?? true,
      icon: step1Data?.icon ?? "",
    },
    validatorAdapter: zodValidator(),
    validators: {
      onChange: step1Schema,
    },
    onSubmit: async ({ value }) => {
      setStep1Data({
        name: value.name,
        categoryId: (value.categoryId as Id<"projectCategories">) || undefined,
        icon: value.icon || undefined,
        isActive: value.isActive,
      });
    },
  });

  // Auto-sync form state to context for single-page editor support
  const formValues = useStore(form.store, (state) => state.values);

  // Auto-sync context to form on first load (important for edit mode)
  useEffect(() => {
    if (step1Data && !formValues.name && !formValues.categoryId) {
      form.setFieldValue("name", step1Data.name);
      form.setFieldValue("categoryId", (step1Data.categoryId as string) ?? "");
      form.setFieldValue("isActive", step1Data.isActive);
      form.setFieldValue("icon", step1Data.icon ?? "");
    }
  }, [step1Data, form]);

  useEffect(() => {
    if (!formValues) return;

    // Only update context if the form has actual data to avoid blanking out loaded data
    // OR if we are in a state where context is already populated
    const hasData = formValues.name || formValues.categoryId;
    if (!hasData && !step1Data) return;

    // Only update if something actually changed to avoid render cycles
    const hasChanged =
      formValues.name !== (step1Data?.name ?? "") ||
      formValues.categoryId !== (step1Data?.categoryId ?? "") ||
      formValues.icon !== (step1Data?.icon ?? "") ||
      formValues.isActive !== (step1Data?.isActive ?? true);

    if (hasChanged) {
      setStep1Data({
        name: formValues.name,
        categoryId:
          (formValues.categoryId as Id<"projectCategories">) || undefined,
        icon: formValues.icon || undefined,
        isActive: formValues.isActive,
      });
    }
  }, [formValues, setStep1Data, step1Data]);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    setIsCreatingCategory(true);
    try {
      const id = await createCategory({ name: newCategoryName });
      toast.success("New category created");
      form.setFieldValue("categoryId", id);
      setNewCategoryName("");
      setIsAddingCategory(false);
    } catch (error) {
      console.error("Create category error:", error);
      toast.error("Failed to create category");
    } finally {
      setIsCreatingCategory(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Step Header - Compact Inline */}
      {!compact && (
        <div className="shrink-0 flex items-center gap-4 pb-4">
          <div className="h-1 w-10 rounded-full bg-primary" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
            Step 01
          </span>
          <h2 className="text-xl font-black uppercase tracking-tight text-white">
            Project Type Identity
          </h2>
        </div>
      )}

      {/* Form - Takes remaining space */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="flex-1 min-h-0 flex flex-col gap-4"
      >
        {/* Top Row - Name and Icon */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name Field */}
          <form.Field
            name="name"
            validators={{ onChange: step1Schema.shape.name }}
          >
            {(field) => (
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">
                  Project Type Name *
                </Label>
                <div className="flex items-center gap-3">
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <form.Subscribe selector={(state) => state.values.icon}>
                      {(icon) => (
                        <DynamicIcon
                          name={icon || "Package"}
                          className="h-5 w-5 text-primary"
                        />
                      )}
                    </form.Subscribe>
                  </div>
                  <Input
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="bg-white/5 border-white/10 text-white h-10 rounded-xl focus:ring-primary/20 font-bold flex-1"
                    placeholder="e.g. Wedding Photography"
                  />
                </div>
                {field.state.meta.errors.length > 0 && (
                  <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">
                    {field.state.meta.errors
                      .map((err: any) =>
                        typeof err === "string" ? err : err?.message,
                      )
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Icon Field */}
          <form.Field name="icon">
            {(field) => (
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">
                  Icon Identifier (Optional)
                </Label>
                <IconPicker
                  value={field.state.value}
                  onChange={(val) => field.handleChange(val)}
                />
              </div>
            )}
          </form.Field>
        </div>

        {/* Second Row - Category and Availability */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category Field */}
          <form.Field
            name="categoryId"
            validators={{ onChange: step1Schema.shape.categoryId }}
          >
            {(field) => (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">
                    Category *
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAddingCategory(true)}
                    className="h-6 px-2 text-[9px] font-black uppercase tracking-widest text-primary hover:text-primary hover:bg-primary/10 rounded-lg gap-1"
                  >
                    <Plus className="h-3 w-3" /> New Category
                  </Button>
                </div>

                <Select
                  value={field.state.value}
                  onValueChange={(val) => {
                    if (val === "ADD_NEW") {
                      setIsAddingCategory(true);
                    } else {
                      field.handleChange(val);
                    }
                  }}
                >
                  <SelectTrigger className="w-full bg-white/5 border-white/10 text-white h-10 rounded-xl focus:ring-primary/20">
                    <SelectValue placeholder="Select a category..." />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-xl">
                    <SelectItem
                      value="ADD_NEW"
                      className="rounded-lg focus:bg-primary/10 focus:text-primary py-2.5 border-b border-white/5"
                    >
                      <div className="flex items-center gap-3 text-primary">
                        <Plus className="h-4 w-4" />
                        <span className="font-black uppercase tracking-widest text-[10px]">
                          Add New Category
                        </span>
                      </div>
                    </SelectItem>
                    {categories?.map((cat) => (
                      <SelectItem
                        key={cat._id}
                        value={cat._id}
                        className="rounded-lg focus:bg-primary/10 focus:text-primary py-2.5"
                      >
                        <div className="flex items-center gap-3">
                          <Tag className="h-4 w-4 text-white/20" />
                          <span className="font-bold">{cat.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {field.state.meta.errors.length > 0 && (
                  <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">
                    {field.state.meta.errors
                      .map((err: any) =>
                        typeof err === "string" ? err : err?.message,
                      )
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Is Active Toggle */}
          <form.Field name="isActive">
            {(field) => (
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">
                  Status
                </Label>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/5 h-10">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-2 w-2 rounded-full ${field.state.value ? "bg-emerald-500 animate-pulse" : "bg-zinc-500"}`}
                    />
                    <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                      {field.state.value ? "Active" : "Draft"}
                    </span>
                  </div>
                  <Switch
                    checked={field.state.value}
                    onCheckedChange={field.handleChange}
                    className="scale-90"
                  />
                </div>
              </div>
            )}
          </form.Field>
        </div>
      </form>

      {/* Add Category Dialog */}
      <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
        <DialogContent className="bg-zinc-950 border-white/10 sm:max-w-[425px] rounded-4xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-white uppercase tracking-tighter">
              New Category
            </DialogTitle>
            <DialogDescription className="text-white/40 font-medium">
              Create a new category to group project types.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-3">
              Category Name
            </Label>
            <Input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus:ring-primary/20 font-bold"
              placeholder="e.g. Events"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={isCreatingCategory}
              onClick={() => setIsAddingCategory(false)}
              className="rounded-xl border-white/10 bg-white/5 text-white/40 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddCategory}
              disabled={isCreatingCategory || !newCategoryName.trim()}
              className="bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] px-6 rounded-xl"
            >
              {isCreatingCategory ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
