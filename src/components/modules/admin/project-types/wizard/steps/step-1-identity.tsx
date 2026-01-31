"use client";

import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import * as z from "zod";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Plus, Tag } from "lucide-react";
import { useProjectTypeWizard } from "../wizard-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const step1Schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string(),
  categoryId: z.string().min(1, "Category is required"),
  isActive: z.boolean(),
  icon: z.string(),
});

export function Step1Identity() {
  const { step1Data, setStep1Data, handleNext } = useProjectTypeWizard();
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
      description: step1Data?.description ?? "",
      categoryId: (step1Data?.categoryId as string) ?? "",
      isActive: step1Data?.isActive ?? true,
      icon: step1Data?.icon ?? "",
    },
    validators: {
      onChange: step1Schema,
    },
    onSubmit: async ({ value }) => {
      setStep1Data({
        name: value.name,
        description: value.description || undefined,
        categoryId: (value.categoryId as Id<"projectCategories">) || undefined,
        icon: value.icon || undefined,
        isActive: value.isActive,
      });
      handleNext();
    },
  });

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

  // Enable/Disable next button based on form state
  const isFormValid = useMemo(() => {
    return (
      !!form.getFieldValue("name") &&
      form.getFieldValue("name").length >= 2 &&
      !!form.getFieldValue("categoryId")
    );
  }, [form.state.values]);

  return (
    <div className="h-full flex flex-col">
      {/* Step Header - Compact Inline */}
      <div className="shrink-0 flex items-center gap-4 pb-4">
        <div className="h-1 w-10 rounded-full bg-primary" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
          Step 01
        </span>
        <h2 className="text-xl font-black uppercase tracking-tight text-white">
          Project Type Identity
        </h2>
      </div>

      {/* Form - Takes remaining space */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="flex-1 min-h-0 flex flex-col gap-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            {/* Name Field */}
            <form.Field
              name="name"
              validators={{ onChange: step1Schema.shape.name }}
            >
              {(field) => (
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">
                    Project Type Name *
                  </Label>
                  <Input
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus:ring-primary/20 font-bold"
                    placeholder="e.g. Wedding Photography"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">
                      {field.state.meta.errors.join(", ")}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            {/* Category Field */}
            <form.Field
              name="categoryId"
              validators={{ onChange: step1Schema.shape.categoryId }}
            >
              {(field) => (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">
                      Category *
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsAddingCategory(true)}
                      className="h-7 px-2 text-[9px] font-black uppercase tracking-widest text-primary hover:text-primary hover:bg-primary/10 rounded-lg gap-1"
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
                    <SelectTrigger className="w-full bg-white/5 border-white/10 text-white h-12 rounded-xl focus:ring-primary/20">
                      <SelectValue placeholder="Select a category..." />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-xl">
                      <SelectItem
                        value="ADD_NEW"
                        className="rounded-lg focus:bg-primary/10 focus:text-primary py-3 border-b border-white/5"
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
                          className="rounded-lg focus:bg-primary/10 focus:text-primary py-3"
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
                      {field.state.meta.errors.join(", ")}
                    </p>
                  )}
                </div>
              )}
            </form.Field>
          </div>

          <div className="space-y-4">
            {/* Icon Field */}
            <form.Field name="icon">
              {(field) => (
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">
                    Icon Identifier (Optional)
                  </Label>
                  <Input
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus:ring-primary/20"
                    placeholder="e.g. camera, video, music"
                  />
                  <p className="text-[9px] text-white/20 uppercase tracking-widest font-black">
                    Use Lucide icon name
                  </p>
                </div>
              )}
            </form.Field>

            {/* Is Active Toggle */}
            <form.Field name="isActive">
              {(field) => (
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/3 border border-white/5 transition-colors hover:bg-white/5">
                  <div className="space-y-1">
                    <Label className="text-white font-black uppercase tracking-tight">
                      Availability
                    </Label>
                    <p className="text-[9px] text-white/20 uppercase tracking-[0.2em] font-black">
                      Show in Studio Portal
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

        {/* Description Field */}
        <form.Field name="description">
          {(field) => (
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">
                Description (Optional)
              </Label>
              <Input
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus:ring-primary/20"
                placeholder="Describe what this project type covers..."
              />
            </div>
          )}
        </form.Field>
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
