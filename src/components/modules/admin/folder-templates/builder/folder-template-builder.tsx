"use client";

import { useEffect, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import * as z from "zod";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Save, ArrowLeft, FolderTree, Trash2 } from "lucide-react";
import Link from "next/link";
import { 
  Field, 
  FieldContent, 
  FieldDescription, 
  FieldError, 
  FieldLabel 
} from "@/components/ui/field";
import { FolderTree as FolderTreeComponent } from "./folder-tree";
import { FolderEditorDrawer } from "./folder-editor-drawer";
import { FolderTemplateBuilderLoading } from "./folder-template-builder-loading";
import { FolderTemplateBuilderError } from "./folder-template-builder-error";
import type { FolderLevel1, FolderLevel2, FolderLevel3 } from "@convex/schema";
import type { Id } from "@convex/_generated/dataModel";

import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface FormValues {
  name: string;
  projectTypeId: string;
  variant?: string;
  description?: string;
}

const templateSchema = z.object({
  name: z.string().min(1, "Template name is required").max(100),
  projectTypeId: z.string().min(1, "Project type is required"),
  variant: z.string().max(50).optional(),
  description: z.string().max(500).optional(),
});

interface FolderTemplateBuilderProps {
  templateId?: Id<"folderTemplates">;
}

export function FolderTemplateBuilder({ templateId }: FolderTemplateBuilderProps) {
  const router = useRouter();
  
  // Convex Hooks
  const projectTypes = useQuery(api.functions.projectTypes.queries.list) || [];
  const existingTemplate = useQuery(
    api.functions.folderTemplates.queries.get,
    templateId ? { id: templateId } : "skip"
  );
  
  const createTemplate = useMutation(api.functions.folderTemplates.mutations.createFolderTemplate);
  const updateTemplate = useMutation(api.functions.folderTemplates.mutations.updateFolderTemplate);

  // Local state for folder tree
  const [folders, setFolders] = useState<FolderLevel1[]>([]);
  const [editingPath, setEditingPath] = useState<string | null>(null);
  const [editingFolder, setEditingFolder] = useState<FolderLevel1 | FolderLevel2 | FolderLevel3 | null>(null);
  const [deletePath, setDeletePath] = useState<string | null>(null);

  // Sync with existing template
  useEffect(() => {
    if (existingTemplate) {
      setFolders(existingTemplate.folders);
    }
  }, [existingTemplate]);

  // Form setup
  const form = useForm({
    defaultValues: {
      name: (existingTemplate?.name || "") as string,
      projectTypeId: ((existingTemplate?.projectTypeId as string) || "") as string,
      variant: (existingTemplate?.variant || "") as string,
      description: (existingTemplate?.description || "") as string,
    } as FormValues,
    validators: {
      onChange: templateSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        if (folders.length === 0) {
          toast.error("Template must have at least one folder");
          return;
        }

        const data = {
          ...value,
          projectTypeId: value.projectTypeId as Id<"projectTypes">,
          folders,
          isActive: existingTemplate?.isActive ?? true,
        };

        if (templateId) {
          await updateTemplate({ id: templateId, ...data });
          toast.success("Folder template updated successfully");
        } else {
          await createTemplate(data);
          toast.success("Folder template created successfully");
        }
        router.push("/settings/folder-templates");
      } catch (error) {
        console.error("Save error:", error);
        toast.error("Failed to save template");
      }
    },
  });

  // Folder Operations
  const addRootFolder = () => {
    const newRoot: FolderLevel1 = {
      name: "New Root Folder",
      path: "/new-folder",
      description: "",
      isRequired: false,
      children: [],
    };
    setFolders([...folders, newRoot]);
  };

  const addChildFolder = (path: string) => {
    const newFolders = [...folders];
    const parts = path.split(".");
    
    if (parts.length === 1) { // Adding to Level 1
      const l1Idx = parseInt(parts[0]);
      const l1 = newFolders[l1Idx];
      if (!l1.children) l1.children = [];
      l1.children.push({
        name: "New Child Folder",
        path: `${l1.path}/new-child`,
        isRequired: false,
      });
    } else if (parts.length === 3) { // Adding to Level 2
      const l1Idx = parseInt(parts[0]);
      const l2Idx = parseInt(parts[2]);
      const l2 = newFolders[l1Idx].children![l2Idx];
      if (!l2.children) l2.children = [];
      l2.children.push({
        name: "New Sub-child Folder",
        path: `${l2.path}/new-subchild`,
        isRequired: false,
      });
    }
    setFolders(newFolders);
  };

  const confirmDeleteFolder = () => {
    if (!deletePath) return;

    const newFolders = [...folders];
    const parts = deletePath.split(".");
    
    if (parts.length === 1) { // Delete Level 1
      newFolders.splice(parseInt(parts[0]), 1);
    } else if (parts.length === 3) { // Delete Level 2
      newFolders[parseInt(parts[0])].children!.splice(parseInt(parts[2]), 1);
    } else if (parts.length === 5) { // Delete Level 3
      newFolders[parseInt(parts[0])].children![parseInt(parts[2])].children!.splice(parseInt(parts[4]), 1);
    }
    setFolders(newFolders);
    setDeletePath(null);
    toast.success("Folder deleted");
  };

  const updateFolder = (updated: FolderLevel1 | FolderLevel2 | FolderLevel3) => {
    if (!editingPath) return;
    
    const newFolders = [...folders];
    const parts = editingPath.split(".");
    
    if (parts.length === 1) {
      newFolders[parseInt(parts[0])] = { ...newFolders[parseInt(parts[0])], ...updated } as FolderLevel1;
    } else if (parts.length === 3) {
      const l1 = newFolders[parseInt(parts[0])];
      l1.children![parseInt(parts[2])] = { ...l1.children![parseInt(parts[2])], ...updated } as FolderLevel2;
    } else if (parts.length === 5) {
      const l1 = newFolders[parseInt(parts[0])];
      const l2 = l1.children![parseInt(parts[2])];
      l2.children![parseInt(parts[4])] = { ...l2.children![parseInt(parts[4])], ...updated } as FolderLevel3;
    }
    
    setFolders(newFolders);
    setEditingPath(null);
    setEditingFolder(null);
  };

  if (templateId && existingTemplate === undefined) {
    return <FolderTemplateBuilderLoading />;
  }

  if (templateId && existingTemplate === null) {
    return <FolderTemplateBuilderError error="Folder template not found" />;
  }

  return (
    <div className="w-full space-y-12 pb-32 font-geist px-10 pt-16">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-8 border-b border-white/5">
        <div className="flex items-center gap-5">
          <Button 
            variant="ghost" 
            size="icon" 
            asChild
            className="rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all h-11 w-11"
          >
            <Link href="/settings/folder-templates">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight text-white uppercase font-sentient">
              {templateId ? "Edit Template" : "New Template"}
            </h1>
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">
              Directory structure & configuration
            </p>
          </div>
        </div>
        <Button 
          onClick={() => form.handleSubmit()} 
          className="gap-3 bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest text-[10px] h-12 px-8 rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <div className="space-y-16">
        {/* Top Section: Template Basics */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 ml-1">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <Save className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-white/90">Template Details</h2>
              <p className="text-[10px] text-white/30 font-medium mt-0.5">Define core properties for this template</p>
            </div>
          </div>
          
          <Card className="relative overflow-hidden bg-zinc-900/40 border-white/5 p-1 rounded-3xl glass-subtle">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 blur-[100px] rounded-full" />
            <CardContent className="relative z-10 p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <form.Field
                  name="name"
                  children={(field) => (
                    <Field data-invalid={field.state.meta.errors.length > 0}>
                      <FieldLabel htmlFor={field.name} className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Template Name</FieldLabel>
                      <Input
                        id={field.name}
                        placeholder="e.g. Wedding Photography"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="bg-zinc-950/30 border-white/5 focus:border-primary/50 focus:ring-primary/20 h-11 rounded-xl text-sm transition-all text-white/90 placeholder:text-white/20"
                      />
                      <FieldError errors={field.state.meta.errors as any} className="text-[10px] uppercase tracking-wider font-bold" />
                    </Field>
                  )}
                />

                <form.Field
                  name="projectTypeId"
                  children={(field) => (
                    <Field data-invalid={field.state.meta.errors.length > 0}>
                      <FieldLabel htmlFor={field.name} className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Project Type</FieldLabel>
                      <Select
                        value={field.state.value}
                        onValueChange={(value) => field.handleChange(value)}
                      >
                        <SelectTrigger id={field.name} className="bg-zinc-950/30 border-white/5 focus:ring-primary/20 h-11 rounded-xl text-sm transition-all text-white/90">
                          <SelectValue placeholder="Select type..." />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-950 border-white/10 rounded-xl">
                          {projectTypes.map((type: { _id: string; name: string }) => (
                            <SelectItem key={type._id} value={type._id} className="focus:bg-primary/20 focus:text-primary rounded-lg mx-1 my-0.5 cursor-pointer">
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldError errors={field.state.meta.errors as any} className="text-[10px] uppercase tracking-wider font-bold" />
                    </Field>
                  )}
                />

                <form.Field
                  name="variant"
                  children={(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name} className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Variant (Optional)</FieldLabel>
                      <Input
                        id={field.name}
                        placeholder="e.g. Candid/Traditional"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="bg-zinc-950/30 border-white/5 focus:border-primary/50 focus:ring-primary/20 h-11 rounded-xl text-sm transition-all text-white/90 placeholder:text-white/20"
                      />
                    </Field>
                  )}
                />

                <form.Field
                  name="description"
                  children={(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name} className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Description</FieldLabel>
                      <Textarea
                        id={field.name}
                        placeholder="Briefly describe this template..."
                        className="bg-zinc-950/30 border-white/5 focus:border-primary/50 focus:ring-primary/20 resize-none h-11 min-h-[44px] rounded-xl text-sm transition-all p-3 text-white/90 placeholder:text-white/20"
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </Field>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Bottom Section: Structure Builder */}
        <section className="space-y-6">
           <div className="flex items-center gap-3 ml-1">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <FolderTree className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-white/90">Directory Structure</h2>
              <p className="text-[10px] text-white/30 font-medium mt-0.5">Design the folder hierarchy for this template</p>
            </div>
          </div>

          <Card className="relative overflow-hidden min-h-[600px] bg-zinc-900/40 border-white/5 p-1 rounded-3xl glass">
            <div className="absolute -bottom-48 -left-48 w-[700px] h-[700px] bg-primary/5 blur-[180px] rounded-full" />
            <CardContent className="relative z-10 p-8 lg:p-12">
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/2 p-8 lg:p-12 min-h-[500px]">
                <FolderTreeComponent
                  folders={folders}
                  onAddRoot={addRootFolder}
                  onAddChild={addChildFolder}
                  onEdit={(path, folder) => {
                    setEditingPath(path);
                    setEditingFolder(folder);
                  }}
                  onDelete={(path) => setDeletePath(path)}
                />
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      <FolderEditorDrawer
        folder={editingFolder}
        isOpen={!!editingFolder}
        onClose={() => {
          setEditingPath(null);
          setEditingFolder(null);
        }}
        onSave={updateFolder}
      />

      <AlertDialog open={!!deletePath} onOpenChange={(open) => !open && setDeletePath(null)}>
        <AlertDialogContent className="bg-zinc-950 border-white/10 rounded-3xl p-8 glass overflow-hidden max-w-md">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-500/10 blur-[80px] rounded-full" />
          
          <AlertDialogHeader className="space-y-4 relative z-10">
            <div className="mx-auto p-4 rounded-full bg-red-500/10 border border-red-500/20 w-fit mb-2 shadow-xl shadow-red-500/5">
              <Trash2 className="h-6 w-6 text-red-500" />
            </div>
            <AlertDialogTitle className="text-2xl font-black uppercase tracking-tight text-white text-center font-sentient">
              Delete Folder
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/50 text-xs font-medium text-center leading-relaxed px-4">
              Are you sure you want to delete this folder? This action cannot be undone and will remove all subfolders.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 gap-3 relative z-10 w-full">
            <AlertDialogCancel className="h-11 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-wider text-[10px] w-full">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteFolder}
              className="h-11 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold uppercase tracking-wider text-[10px] w-full shadow-lg shadow-red-500/20"
            >
              Delete Folder
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}



