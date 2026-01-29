"use client";

import { api } from "@convex/_generated/api";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "convex/react";
import { ArrowRight, Plus, Tag } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
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

const projectTypeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().max(500).optional().or(z.literal("")),
  categoryId: z.string().min(1, "Category is required"),
  isActive: z.boolean().default(true),
  icon: z.string().optional().or(z.literal("")),
});

export type ProjectTypeFormValues = z.infer<typeof projectTypeSchema>;

interface ProjectTypeDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (values: ProjectTypeFormValues) => Promise<void>;
  initialData?: any | null;
}

export function ProjectTypeDrawer({
  open,
  onOpenChange,
  onSave,
  initialData,
}: ProjectTypeDrawerProps) {
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const categories = useQuery(
    api.functions.projectCategories.queries.getActiveCategories,
  );
  const createCategory = useMutation(
    api.functions.projectCategories.mutations.createCategoryOnFly,
  );

  const form = useForm({
    defaultValues: {
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
      categoryId: initialData?.categoryId ?? "",
      isActive: initialData?.isActive ?? true,
      icon: initialData?.icon ?? "",
    },
    onSubmit: async ({ value }) => {
      await onSave(value as ProjectTypeFormValues);
    },
  });

  // Reset form when initialData or open changes
  useEffect(() => {
    if (open) {
      form.reset();
    }
  }, [initialData, open, form]);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const id = await createCategory({ name: newCategoryName });
      toast.success("New category created");
      form.setFieldValue("categoryId", id);
      setNewCategoryName("");
      setIsAddingCategory(false);
    } catch (error) {
      toast.error("Failed to create category");
    }
  };

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange} direction="right">
        <DrawerContent className="bg-zinc-950 border-white/10 h-full max-sm:w-full ml-auto rounded-none">
          <div className="mx-auto w-full flex flex-col h-full">
            <DrawerHeader>
              <DrawerTitle className="text-2xl font-black text-white uppercase tracking-tighter">
                {initialData ? "Edit Configuration" : "Initialize Type"}
              </DrawerTitle>
              <DrawerDescription className="text-white/40 font-bold uppercase tracking-widest text-[10px]">
                {initialData
                  ? "Modify the existing project type parameters."
                  : "Start by selecting a category and providing a unique type name."}
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
                {/* Always visible flow for better UX */}
                <form.Field name="categoryId">
                  {(field) => (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor={field.name}
                          className="text-[10px] font-black uppercase tracking-widest text-white/40"
                        >
                          Step 01 / Select Category
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
                        onValueChange={field.handleChange}
                      >
                        <SelectTrigger className="bg-white/5 border-white/10 text-white h-14 rounded-2xl focus:ring-primary/20">
                          <SelectValue placeholder="Browse categories..." />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-xl">
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
                    </div>
                  )}
                </form.Field>

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
                        Step 02 / Define Type Name
                      </Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="bg-white/5 border-white/10 text-white h-14 rounded-2xl focus:ring-primary/20 font-bold"
                        placeholder="e.g. Cinematic Wedding Edit"
                      />
                      {field.state.meta.errors.length > 0 && (
                        <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">
                          {field.state.meta.errors.join(", ")}
                        </p>
                      )}
                    </div>
                  )}
                </form.Field>

                <form.Field name="description">
                  {(field) => (
                    <div className="space-y-3">
                      <Label
                        htmlFor={field.name}
                        className="text-[10px] font-black uppercase tracking-widest text-white/40"
                      >
                        Description (Optional)
                      </Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="bg-white/5 border-white/10 text-white h-14 rounded-2xl focus:ring-primary/20"
                        placeholder="Briefly describe what this project type covers..."
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="icon">
                  {(field) => (
                    <div className="space-y-3">
                      <Label
                        htmlFor={field.name}
                        className="text-[10px] font-black uppercase tracking-widest text-white/40"
                      >
                        Icon Identifier (Optional)
                      </Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="bg-white/5 border-white/10 text-white h-14 rounded-2xl focus:ring-primary/20"
                        placeholder="e.g. video, camera, music"
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="isActive">
                  {(field) => (
                    <div className="flex items-center justify-between p-5 rounded-2xl bg-white/3 border border-white/5 transition-colors hover:bg-white/5">
                      <div className="space-y-1">
                        <Label className="text-white font-black uppercase tracking-tight">
                          Availability
                        </Label>
                        <p className="text-[9px] text-white/20 uppercase tracking-[0.2em] font-black">
                          Show in Client Portal
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
                  selector={(state) => [
                    state.canSubmit,
                    state.isSubmitting,
                    state.values.categoryId,
                  ]}
                >
                  {([canSubmit, isSubmitting, categoryId]) => (
                    <Button
                      type="submit"
                      className="w-full h-14 bg-primary text-primary-foreground font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                      disabled={!canSubmit || isSubmitting || !categoryId}
                    >
                      {isSubmitting ? (
                        "Synchronizing..."
                      ) : (
                        <div className="flex items-center gap-2">
                          {initialData
                            ? "Update Configuration"
                            : "Initialize Type"}
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

      <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
        <DialogContent className="bg-zinc-950 border-white/10 sm:max-w-[425px] rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-white uppercase tracking-tighter">
              New Master Category
            </DialogTitle>
            <DialogDescription className="text-white/40 font-medium">
              Create a new high-level category to group your project types.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <Label
              htmlFor="category-name"
              className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-3"
            >
              Category Label
            </Label>
            <Input
              id="category-name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="bg-white/5 border-white/10 text-white h-14 rounded-2xl focus:ring-primary/20 font-bold"
              placeholder="e.g. Motion Graphics"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddingCategory(false)}
              className="rounded-xl border-white/10 bg-white/5 text-white/40 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddCategory}
              className="bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] px-6 rounded-xl"
            >
              Confirm Creation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
