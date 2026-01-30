"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { FolderTree, Layout, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@tanstack/react-form";
import { StorageSelector } from "./storage-selector";

interface ProjectConfigCardProps {
  form: any; // FormApi from TanStack Form
  index: number;
  onRemove: () => void;
  canRemove: boolean;
  projectTypes: any[];
  storageTiers: any[];
}

export function ProjectConfigCard({
  form,
  index,
  onRemove,
  canRemove,
  projectTypes,
  storageTiers,
}: ProjectConfigCardProps) {
  // Get selected project type to filter folder templates
  const projectTypeId = useStore(
    form.store,
    (state: any) => state.values.projectConfigs[index]?.projectTypeId
  );

  const folderTemplates =
    useQuery(
      api.functions.folderTemplates.queries.listByProjectType,
      projectTypeId
        ? { projectTypeId: projectTypeId as Id<"projectTypes"> }
        : "skip"
    ) || [];

  return (
    <Card className="relative bg-white/5 border-white/5 rounded-[24px] overflow-hidden glass-subtle mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Remove Button */}
      {canRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 h-8 w-8 rounded-full hover:bg-red-500/20 hover:text-red-500 transition-colors z-10"
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      <CardContent className="p-6 space-y-6">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-2">
          <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-black text-primary">{index + 1}</span>
          </div>
          <h3 className="text-xs font-black text-white uppercase tracking-widest">
            Project configuration {index + 1}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Label field */}
          <form.Field name={`projectConfigs[${index}].label`}>
            {(field: any) => (
              <Field>
                <div className="flex items-center gap-2 mb-2 ml-1">
                  <FieldLabel
                    htmlFor={field.name}
                    className="text-[10px] font-black uppercase tracking-widest text-white/50"
                  >
                    Configuration Label
                  </FieldLabel>
                </div>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g., Photo Editing, Video Editing"
                  className="bg-white/5 border-white/5 focus:ring-primary/20 h-11 rounded-xl text-sm transition-all"
                />
                <FieldDescription className="text-[9px] text-white/20 uppercase tracking-widest font-black ml-1 mt-1">
                  How this project is identified in the package.
                </FieldDescription>
              </Field>
            )}
          </form.Field>

          {/* Project Type selector */}
          <form.Field name={`projectConfigs[${index}].projectTypeId`}>
            {(field: any) => {
              const hasError = field.state.meta.errors.length > 0;
              return (
                <Field data-invalid={hasError}>
                  <div className="flex items-center gap-2 mb-2 ml-1">
                    <Layout className="h-3 w-3 text-primary" />
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
                      // Clear folder template when project type changes
                      form.setFieldValue(
                        `projectConfigs[${index}].folderTemplateId`,
                        ""
                      );
                    }}
                  >
                    <SelectTrigger
                      id={field.name}
                      aria-invalid={hasError}
                      className="bg-white/5 border-white/5 focus:ring-primary/20 h-11 rounded-xl text-sm transition-all shadow-inner"
                    >
                      <SelectValue placeholder="Select type..." />
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
                  <FieldError className="text-[9px] uppercase tracking-wider font-bold mt-1">
                    {field.state.meta.errors.map((err: any) => err?.toString()).join(", ")}
                  </FieldError>
                </Field>
              );
            }}
          </form.Field>

          {/* Folder Template selector */}
          <form.Field name={`projectConfigs[${index}].folderTemplateId`}>
            {(field: any) => {
              const hasError = field.state.meta.errors.length > 0;
              return (
                <Field data-invalid={hasError}>
                  <div className="flex items-center gap-2 mb-2 ml-1">
                    <FolderTree className="h-3 w-3 text-primary" />
                    <FieldLabel
                      htmlFor={field.name}
                      className="text-[10px] font-black uppercase tracking-widest text-white/50"
                    >
                      Folder Hierarchy *
                    </FieldLabel>
                  </div>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => field.handleChange(value)}
                    disabled={!projectTypeId}
                  >
                    <SelectTrigger
                      id={field.name}
                      aria-invalid={hasError}
                      className="bg-white/5 border-white/5 focus:ring-primary/20 h-11 rounded-xl text-sm transition-all shadow-inner disabled:opacity-50"
                    >
                      <SelectValue
                        placeholder={
                          projectTypeId
                            ? "Select structure..."
                            : "Select type first"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-white/10 rounded-xl">
                      {folderTemplates.map((template: any) => (
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
                  <FieldError className="text-[9px] uppercase tracking-wider font-bold mt-1">
                    {field.state.meta.errors.map((err: any) => err?.toString()).join(", ")}
                  </FieldError>
                </Field>
              );
            }}
          </form.Field>

          {/* Storage Tier */}
          <form.Field name={`projectConfigs[${index}].defaultStorageTierId`}>
            {(field: any) => (
              <div className="md:pt-1">
                <StorageSelector
                  tiers={storageTiers}
                  value={field.state.value}
                  onChange={field.handleChange}
                />
              </div>
            )}
          </form.Field>
        </div>
      </CardContent>
    </Card>
  );
}
