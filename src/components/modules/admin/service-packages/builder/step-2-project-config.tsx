"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useForm } from "@tanstack/react-form";
import { useQuery } from "convex/react";
import {
  ArrowLeft,
  ArrowRight,
  FolderTree,
  HardDrive,
  Info,
  Layout,
} from "lucide-react";
import { useState } from "react";
import * as z from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBuilder } from "./builder-context";
import { FolderPreview } from "./components/folder-preview";
import { StorageSelector } from "./components/storage-selector";

const step2Schema = z.object({
  projectTypeId: z.string().min(1, "Project type is required"),
  folderTemplateId: z.string().min(1, "Folder template is required"),
  defaultStorageTierId: z.string(),
});

export function Step2ProjectConfig() {
  const { step2Data, setStep2Data, setCurrentStep } = useBuilder();

  // Queries
  const projectTypes = useQuery(api.functions.projectTypes.queries.list) || [];
  const storageTiers =
    useQuery(api.functions.storageTiers.queries.listStorageTiers) || [];

  // Local state for interactive filtering
  const [selectedProjectTypeId, setSelectedProjectTypeId] = useState<string>(
    step2Data?.projectTypeId ?? "",
  );
  const [selectedFolderTemplateId, setSelectedFolderTemplateId] =
    useState<string>(step2Data?.folderTemplateId ?? "");

  // Folder templates filtered by project type
  const folderTemplates =
    useQuery(
      api.functions.folderTemplates.queries.listByProjectType,
      selectedProjectTypeId
        ? { projectTypeId: selectedProjectTypeId as Id<"projectTypes"> }
        : "skip",
    ) || [];

  const form = useForm({
    defaultValues: {
      projectTypeId: step2Data?.projectTypeId ?? "",
      folderTemplateId: step2Data?.folderTemplateId ?? "",
      defaultStorageTierId: step2Data?.defaultStorageTierId ?? "",
    },
    validators: {
      onChange: step2Schema,
    },
    onSubmit: async ({ value }) => {
      setStep2Data({
        projectTypeId: value.projectTypeId,
        folderTemplateId: value.folderTemplateId,
        defaultStorageTierId: value.defaultStorageTierId || undefined,
      });
      setCurrentStep(3);
    },
  });

  return (
    <div className="max-w-6xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-10 space-y-2">
        <h2 className="text-2xl font-black text-white uppercase tracking-tight">
          Project Configuration
        </h2>
        <p className="text-white/40 font-medium text-sm">
          Define the technical structure and delivery settings for projects
          spawned from this package.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Form Column */}
        <div className="lg:col-span-7">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-8"
          >
            {/* Project Type */}
            <form.Field name="projectTypeId">
              {(field) => {
                const hasError = field.state.meta.errors.length > 0;
                return (
                  <Field data-invalid={hasError}>
                    <div className="flex items-center gap-2 mb-2 ml-1">
                      <Layout className="h-3.5 w-3.5 text-primary" />
                      <FieldLabel
                        htmlFor={field.name}
                        className="text-[10px] font-black uppercase tracking-widest text-white/50"
                      >
                        Project Type *
                      </FieldLabel>
                    </div>
                    <Select
                      value={field.state.value}
                      onValueChange={(value) => {
                        field.handleChange(value);
                        setSelectedProjectTypeId(value);
                        // Clear folder template when project type changes
                        form.setFieldValue("folderTemplateId", "");
                        setSelectedFolderTemplateId("");
                      }}
                    >
                      <SelectTrigger
                        id={field.name}
                        aria-invalid={hasError}
                        className="bg-white/5 border-white/5 focus:ring-primary/20 h-12 rounded-xl text-sm transition-all shadow-inner"
                      >
                        <SelectValue placeholder="Select project type..." />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-950 border-white/10 rounded-xl">
                        {projectTypes.map((type) => (
                          <SelectItem
                            key={type._id}
                            value={type._id}
                            className="focus:bg-primary/20 focus:text-primary rounded-lg mx-1 my-0.5"
                          >
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldDescription className="text-[10px] text-white/20 uppercase tracking-widest font-black ml-1">
                      Determines the workflow and field requirements.
                    </FieldDescription>
                    <FieldError className="text-[10px] uppercase tracking-wider font-bold">
                      {field.state.meta.errors
                        .map((err) => err?.toString())
                        .join(", ")}
                    </FieldError>
                  </Field>
                );
              }}
            </form.Field>

            {/* Folder Template */}
            <form.Field name="folderTemplateId">
              {(field) => {
                const hasError = field.state.meta.errors.length > 0;
                return (
                  <Field data-invalid={hasError}>
                    <div className="flex items-center gap-2 mb-2 ml-1">
                      <FolderTree className="h-3.5 w-3.5 text-primary" />
                      <FieldLabel
                        htmlFor={field.name}
                        className="text-[10px] font-black uppercase tracking-widest text-white/50"
                      >
                        Folder Hierarchy *
                      </FieldLabel>
                    </div>
                    <Select
                      value={field.state.value}
                      onValueChange={(value) => {
                        field.handleChange(value);
                        setSelectedFolderTemplateId(value);
                      }}
                      disabled={!selectedProjectTypeId}
                    >
                      <SelectTrigger
                        id={field.name}
                        aria-invalid={hasError}
                        className="bg-white/5 border-white/5 focus:ring-primary/20 h-12 rounded-xl text-sm transition-all shadow-inner disabled:opacity-50"
                      >
                        <SelectValue
                          placeholder={
                            selectedProjectTypeId
                              ? "Select folder structure..."
                              : "Choose project type first"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-950 border-white/10 rounded-xl">
                        {folderTemplates.map((template) => (
                          <SelectItem
                            key={template._id}
                            value={template._id}
                            className="focus:bg-primary/20 focus:text-primary rounded-lg mx-1 my-0.5"
                          >
                            {template.name}
                            {template.variant && (
                              <span className="ml-2 text-[10px] opacity-40">
                                ({template.variant})
                              </span>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldDescription className="text-[10px] text-white/20 uppercase tracking-widest font-black ml-1">
                      Defines the directory structure for asset uploads.
                    </FieldDescription>
                    <FieldError className="text-[10px] uppercase tracking-wider font-bold">
                      {field.state.meta.errors
                        .map((err) => err?.toString())
                        .join(", ")}
                    </FieldError>
                  </Field>
                );
              }}
            </form.Field>

            {/* Storage Tier */}
            <form.Field name="defaultStorageTierId">
              {(field) => (
                <StorageSelector
                  tiers={storageTiers}
                  value={field.state.value}
                  onChange={field.handleChange}
                />
              )}
            </form.Field>

            <div className="pt-8 border-t border-white/5 flex items-center justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCurrentStep(1)}
                className="hover:bg-white/5 text-white/40 hover:text-white font-black uppercase tracking-widest text-[10px] h-12 px-6 rounded-2xl transition-all gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Identity
              </Button>

              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
              >
                {([canSubmit, isSubmitting]) => (
                  <Button
                    type="submit"
                    disabled={!canSubmit || isSubmitting}
                    className="bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[10px] h-12 px-8 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] gap-2"
                  >
                    {isSubmitting ? "Processing..." : "Next: Pricing"}
                    {!isSubmitting && (
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    )}
                  </Button>
                )}
              </form.Subscribe>
            </div>
          </form>
        </div>

        {/* Preview Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center gap-2 ml-1">
            <Info className="h-4 w-4 text-primary" />
            <h3 className="text-[10px] font-black text-white/60 uppercase tracking-widest">
              Live Preview
            </h3>
          </div>

          <Card className="bg-zinc-900/40 border-white/5 rounded-[32px] overflow-hidden glass-subtle flex flex-col min-h-[500px]">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">
                  Active Configuration
                </p>
                <h4 className="text-sm font-black text-white uppercase tracking-tight mt-1">
                  Folder Structure
                </h4>
              </div>
              {selectedProjectTypeId && (
                <Badge className="bg-primary/10 text-primary border-primary/20 font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full">
                  {
                    projectTypes.find((t) => t._id === selectedProjectTypeId)
                      ?.name
                  }
                </Badge>
              )}
            </div>

            <div className="flex-1 bg-zinc-950/20">
              <FolderPreview templateId={selectedFolderTemplateId} />
            </div>

            <div className="p-4 bg-white/2 border-t border-white/5">
              <div className="flex items-center gap-2 px-3 py-2 bg-white/3 rounded-xl border border-white/5">
                <HardDrive className="h-3.5 w-3.5 text-white/20" />
                <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">
                  {form.getFieldValue("defaultStorageTierId")
                    ? `Default Tier: ${storageTiers.find((t) => t._id === form.getFieldValue("defaultStorageTierId"))?.name}`
                    : "On-demand storage allocation"}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
