"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useForm } from "@tanstack/react-form";
import { useQuery } from "convex/react";
import {
  ArrowRight,
  ChevronRight,
  FolderTree,
  Globe,
  Info,
  Star,
  Tag,
} from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
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
import { FolderListEditor } from "./folder-list-editor";
import { ProjectTypePickerDrawer } from "./project-type-picker-drawer";

const folderTemplateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  folders: z.array(z.string()).min(1, "At least one folder is required"),
  projectTypeId: z.string().optional(),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export type FolderTemplateFormValues = z.infer<typeof folderTemplateSchema>;

interface FolderTemplate {
  _id: string;
  name: string;
  folders: string[];
  projectTypeId?: string;
  isDefault?: boolean;
  isActive: boolean;
}

interface FolderTemplateDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (values: FolderTemplateFormValues) => Promise<void>;
  initialData?: FolderTemplate | null;
}

export function FolderTemplateDrawer({
  open,
  onOpenChange,
  onSave,
  initialData,
}: FolderTemplateDrawerProps) {
  const projectTypes = useQuery(
    api.functions.projectTypes.queries.getProjectTypes,
  );
  const [isProjectTypePickerOpen, setIsProjectTypePickerOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      name: initialData?.name ?? "",
      folders: initialData?.folders ?? [],
      projectTypeId: initialData?.projectTypeId ?? undefined,
      isDefault: initialData?.isDefault ?? false,
      isActive: initialData?.isActive ?? true,
    },
    onSubmit: async ({ value }) => {
      await onSave(value as FolderTemplateFormValues);
    },
  });

  // Reset form when initialData or open changes
  useEffect(() => {
    if (open) {
      form.reset();
    }
  }, [initialData, open, form]);

  // Get the selected project type name
  const getSelectedTypeName = (typeId: string | undefined) => {
    if (!typeId) return "General (All Projects)";
    const type = projectTypes?.find((t) => t._id === typeId);
    return type?.name ?? "Select Project Type";
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="bg-zinc-950 border-white/10 h-full sm:max-w-2xl ml-auto rounded-none flex flex-col">
        <DrawerHeader className="border-b border-white/5 py-8">
          <DrawerTitle className="text-3xl font-black text-white uppercase tracking-tighter">
            {initialData ? "Edit Template" : "New Template"}
          </DrawerTitle>
          <DrawerDescription className="text-white/40 font-bold uppercase tracking-widest text-[10px]">
            {initialData
              ? "Refine your folder template configuration."
              : "Design a standardized folder structure for projects."}
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
            {/* Step 01: Basics */}
            <div className="space-y-6">
              <form.Field name="name">
                {(field) => (
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">
                      Step 01 / Template Name
                    </Label>
                    <div className="relative">
                      <FolderTree className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20" />
                      <Input
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="bg-white/5 border-white/10 text-white h-12 rounded-xl pl-12 focus:ring-primary/20 font-bold"
                        placeholder="e.g. Standard Wedding Workflow"
                      />
                    </div>
                  </div>
                )}
              </form.Field>

              <form.Field name="projectTypeId">
                {(field) => (
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">
                      Step 02 / Project Type Association
                    </Label>
                    <button
                      type="button"
                      onClick={() => setIsProjectTypePickerOpen(true)}
                      className="w-full flex items-center gap-3 bg-white/5 border border-white/10 text-white h-12 rounded-xl px-4 hover:bg-white/8 hover:border-white/15 transition-all group"
                    >
                      {field.state.value ? (
                        <Tag className="h-5 w-5 text-primary" />
                      ) : (
                        <Globe className="h-5 w-5 text-white/20" />
                      )}
                      <span className="flex-1 text-left font-bold">
                        {getSelectedTypeName(field.state.value)}
                      </span>
                      <ChevronRight className="h-4 w-4 text-white/30 group-hover:text-white/50 transition-colors" />
                    </button>
                    <p className="text-[9px] text-white/20 font-medium px-1 leading-relaxed">
                      General templates appear for all projects. Specific
                      templates only show for projects of that type.
                    </p>

                    {/* Project Type Picker Drawer */}
                    <ProjectTypePickerDrawer
                      open={isProjectTypePickerOpen}
                      onOpenChange={setIsProjectTypePickerOpen}
                      selectedTypeId={field.state.value}
                      onSelect={(typeId) => field.handleChange(typeId)}
                    />
                  </div>
                )}
              </form.Field>
            </div>

            {/* Step 02: Folder Structure */}
            <form.Field name="folders">
              {(field) => (
                <FolderListEditor
                  folders={field.state.value}
                  onChange={field.handleChange}
                />
              )}
            </form.Field>

            {/* Step 03: Options */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              <form.Field name="isDefault">
                {(field) => (
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/3 border border-white/5 transition-colors hover:bg-white/5">
                    <div className="flex gap-4">
                      <div className="mt-1 p-2 rounded-xl bg-primary/10 border border-primary/20">
                        <Star className="h-4 w-4 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-white font-black uppercase tracking-tight text-xs">
                          Set as Default
                        </Label>
                        <p className="text-[9px] text-white/20 uppercase tracking-widest font-black leading-relaxed">
                          Auto-apply this template to new projects
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

              <form.Field name="isActive">
                {(field) => (
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/3 border border-white/5 transition-colors hover:bg-white/5">
                    <div className="flex gap-4">
                      <div className="mt-1 p-2 rounded-xl bg-white/5 border border-white/5">
                        <Info className="h-4 w-4 text-white/40" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-white font-black uppercase tracking-tight text-xs">
                          Active Status
                        </Label>
                        <p className="text-[9px] text-white/20 uppercase tracking-widest font-black leading-relaxed">
                          Template remains available for selection
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
          </div>

          <div className="pt-8 sticky bottom-0 bg-zinc-950 pb-2">
            <form.Subscribe
              selector={(state) => ({
                canSubmit: state.canSubmit,
                isSubmitting: state.isSubmitting,
                name: state.values.name,
                folders: state.values.folders,
              })}
            >
              {({ canSubmit, isSubmitting, name, folders }) => (
                <Button
                  type="submit"
                  disabled={
                    !canSubmit || isSubmitting || !name || folders.length === 0
                  }
                  className="w-full h-14 bg-primary text-primary-foreground font-black uppercase tracking-[0.3em] text-[10px] rounded-xl shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 group"
                >
                  <div className="flex items-center gap-3">
                    {isSubmitting ? (
                      "Processing..."
                    ) : (
                      <>
                        {initialData ? "Update Template" : "Confirm Template"}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </div>
                </Button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
