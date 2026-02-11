"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { FolderTree, Layout, X, Database, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
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
  categories: any[];
}

export function ProjectConfigCard({
  form,
  index,
  onRemove,
  canRemove,
  projectTypes,
  storageTiers,
  categories,
}: ProjectConfigCardProps) {
  // Get selected category to filter project types
  const selectedCategoryId = useStore(
    form.store,
    (state: any) => state.values.projectConfigs[index]?.categoryId,
  );

  // Get selected project type to filter folder templates
  const projectTypeId = useStore(
    form.store,
    (state: any) => state.values.projectConfigs[index]?.projectTypeId,
  );

  // Filter project types based on selected category
  const filteredProjectTypes = projectTypes.filter(
    (type) => !selectedCategoryId || type.categoryId === selectedCategoryId,
  );

  const folderTemplates =
    useQuery(
      api.functions.folderTemplates.queries.listByProjectType,
      projectTypeId
        ? { projectTypeId: projectTypeId as Id<"projectTypes"> }
        : "skip",
    ) || [];

  return (
    <Card className="relative bg-zinc-900/30 border-white/5 rounded-3xl backdrop-blur-sm overflow-hidden group">
      {/* Background effects - matching Step 1 */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-size-[32px_32px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[60px] rounded-full -mr-16 -mt-16 pointer-events-none opacity-50 transition-opacity duration-1000 group-hover:opacity-100" />

      {/* Remove Button */}
      {canRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute top-5 right-5 h-9 w-9 rounded-xl bg-zinc-950/50 backdrop-blur-md border border-white/10 opacity-40 group-hover:opacity-100 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all z-50 shadow-xl"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove();
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      <CardContent className="relative p-6 lg:p-8 space-y-8 z-10">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
          <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-black text-primary">{index + 1}</span>
          </div>
          <h3 className="text-xs font-black text-white uppercase tracking-widest">
            Project Configuration {index + 1}
          </h3>
        </div>

        <div className="space-y-8">
          {/* Label field - Full Width */}
          <form.Field name={`projectConfigs[${index}].label`}>
            {(field: any) => (
              <Field className="space-y-3">
                <FieldLabel
                  htmlFor={field.name}
                  className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2 pl-2"
                >
                  Configuration Label
                </FieldLabel>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g., Primary Video Project"
                  className="h-12 bg-black/20 border-white/5 rounded-2xl font-bold text-white text-base focus:border-primary/50 focus:bg-black/40 focus:ring-4 focus:ring-primary/5 transition-all outline-none placeholder:text-white/10"
                />
              </Field>
            )}
          </form.Field>

          {/* Grouped Category & Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Category selector */}
            <form.Field name={`projectConfigs[${index}].categoryId`}>
              {(field: any) => {
                const hasError = field.state.meta.errors.length > 0;
                return (
                  <Field data-invalid={hasError} className="space-y-3">
                    <FieldLabel
                      htmlFor={field.name}
                      className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2 pl-2"
                    >
                      <Layers className="h-3 w-3 text-primary" />
                      Service Category <span className="text-primary">*</span>
                    </FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={(value) => {
                        field.handleChange(value);
                        // Reset dependent fields
                        form.setFieldValue(
                          `projectConfigs[${index}].projectTypeId`,
                          "",
                        );
                        form.setFieldValue(
                          `projectConfigs[${index}].folderTemplateId`,
                          "",
                        );
                      }}
                    >
                      <SelectTrigger
                        id={field.name}
                        aria-invalid={hasError}
                        className="h-12 bg-black/20 border-white/5 rounded-2xl font-bold text-white text-base focus:border-primary/50 focus:bg-black/40 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                      >
                        <SelectValue placeholder="Select category..." />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-950 border-white/10 rounded-2xl p-2">
                        {categories.map((cat) => (
                          <SelectItem
                            key={cat._id}
                            value={cat._id}
                            className="focus:bg-primary/20 focus:text-primary rounded-xl mx-1 my-1 cursor-pointer h-10"
                          >
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError className="text-[10px] uppercase tracking-wider font-bold pl-2">
                      {field.state.meta.errors
                        .map((err: any) =>
                          typeof err === "string" ? err : err?.message,
                        )
                        .filter(Boolean)
                        .join(", ")}
                    </FieldError>
                  </Field>
                );
              }}
            </form.Field>

            {/* Project Type selector */}
            <form.Field name={`projectConfigs[${index}].projectTypeId`}>
              {(field: any) => {
                const hasError = field.state.meta.errors.length > 0;
                return (
                  <Field data-invalid={hasError} className="space-y-3">
                    <FieldLabel
                      htmlFor={field.name}
                      className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2 pl-2"
                    >
                      <Layout className="h-3 w-3 text-primary" />
                      Project Type <span className="text-primary">*</span>
                    </FieldLabel>
                    <Select
                      value={field.state.value}
                      disabled={!selectedCategoryId}
                      onValueChange={(value) => {
                        field.handleChange(value);
                        form.setFieldValue(
                          `projectConfigs[${index}].folderTemplateId`,
                          "",
                        );
                      }}
                    >
                      <SelectTrigger
                        id={field.name}
                        aria-invalid={hasError}
                        className="h-12 bg-black/20 border-white/5 rounded-2xl font-bold text-white text-base focus:border-primary/50 focus:bg-black/40 focus:ring-4 focus:ring-primary/5 transition-all outline-none disabled:opacity-50"
                      >
                        <SelectValue
                          placeholder={
                            selectedCategoryId
                              ? "Select type..."
                              : "Select category first"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-950 border-white/10 rounded-2xl p-2">
                        {filteredProjectTypes.map((type) => (
                          <SelectItem
                            key={type._id}
                            value={type._id}
                            className="focus:bg-primary/20 focus:text-primary rounded-xl mx-1 my-1 cursor-pointer h-10"
                          >
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError className="text-[10px] uppercase tracking-wider font-bold pl-2">
                      {field.state.meta.errors
                        .map((err: any) =>
                          typeof err === "string" ? err : err?.message,
                        )
                        .filter(Boolean)
                        .join(", ")}
                    </FieldError>
                  </Field>
                );
              }}
            </form.Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Folder Template selector */}
            <form.Field name={`projectConfigs[${index}].folderTemplateId`}>
              {(field: any) => {
                const hasError = field.state.meta.errors.length > 0;
                return (
                  <Field data-invalid={hasError} className="space-y-3">
                    <FieldLabel
                      htmlFor={field.name}
                      className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2 pl-2"
                    >
                      <FolderTree className="h-3 w-3 text-primary" />
                      Folder Hierarchy <span className="text-primary">*</span>
                    </FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={(value) => field.handleChange(value)}
                      disabled={!projectTypeId}
                    >
                      <SelectTrigger
                        id={field.name}
                        aria-invalid={hasError}
                        className="h-12 bg-black/20 border-white/5 rounded-2xl font-bold text-white text-base focus:border-primary/50 focus:bg-black/40 focus:ring-4 focus:ring-primary/5 transition-all outline-none disabled:opacity-50"
                      >
                        <SelectValue
                          placeholder={
                            projectTypeId
                              ? "Select structure..."
                              : "Select type first"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-950 border-white/10 rounded-2xl p-2">
                        {folderTemplates.map((template: any) => (
                          <SelectItem
                            key={template._id}
                            value={template._id}
                            className="focus:bg-primary/20 focus:text-primary rounded-xl mx-1 my-1 cursor-pointer h-10"
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
                    <FieldError className="text-[10px] uppercase tracking-wider font-bold pl-2">
                      {field.state.meta.errors
                        .map((err: any) =>
                          typeof err === "string" ? err : err?.message,
                        )
                        .filter(Boolean)
                        .join(", ")}
                    </FieldError>
                  </Field>
                );
              }}
            </form.Field>
          </div>

          {/* Storage Tier */}
          <div className="pt-2 border-t border-white/5">
            <div className="flex items-center gap-2 mb-4 pl-2">
              <Database className="h-3 w-3 text-primary" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
                Default Storage Allocation
              </span>
            </div>
            <form.Field name={`projectConfigs[${index}].defaultStorageTierId`}>
              {(field: any) => (
                <StorageSelector
                  tiers={storageTiers}
                  value={field.state.value}
                  onChange={field.handleChange}
                />
              )}
            </form.Field>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
