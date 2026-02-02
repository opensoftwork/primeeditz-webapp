"use client";

import { useEffect, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import * as z from "zod";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Save,
  ArrowLeft,
  FolderTree,
  Trash2,
  FolderOpen,
  ChevronRight,
  CheckCircle2,
  LayoutTemplate,
  Pencil,
  Tag,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Link from "next/link";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { FolderTree as FolderTreeComponent } from "./folder-tree";
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
  projectTypeId?: Id<"projectTypes">;
}

export function FolderTemplateBuilder({
  templateId,
  projectTypeId: propProjectTypeId,
}: FolderTemplateBuilderProps) {
  const router = useRouter();

  // Determine if we're in project type context
  const isProjectTypeContext = !!propProjectTypeId;

  // Convex Hooks
  const projectTypes = useQuery(api.functions.projectTypes.queries.list) || [];
  const existingTemplate = useQuery(
    api.functions.folderTemplates.queries.get,
    templateId ? { id: templateId } : "skip",
  );
  const parentProjectType = useQuery(
    api.functions.projectTypes.queries.getById,
    propProjectTypeId ? { id: propProjectTypeId } : "skip",
  );

  const createTemplate = useMutation(
    api.functions.folderTemplates.mutations.createFolderTemplate,
  );
  const updateTemplate = useMutation(
    api.functions.folderTemplates.mutations.updateFolderTemplate,
  );

  // Local state for folder tree
  const [folders, setFolders] = useState<FolderLevel1[]>([]);
  const [deletePath, setDeletePath] = useState<string | null>(null);
  const [deletePaths, setDeletePaths] = useState<string[] | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [initialName, setInitialName] = useState("");
  const [showNameConfirm, setShowNameConfirm] = useState(false);

  // Sync with existing template
  useEffect(() => {
    if (existingTemplate) {
      setFolders(existingTemplate.folders);
    }
  }, [existingTemplate]);

  // Compute the back URL based on context
  // Note: Standalone folder templates route is deprecated, so fallback goes to project-types
  const backUrl = isProjectTypeContext
    ? `/settings/project-types/${propProjectTypeId}/folder-templates`
    : "/settings/project-types";

  // Form setup
  const form = useForm({
    defaultValues: {
      name: (existingTemplate?.name || "") as string,
      projectTypeId: ((propProjectTypeId as string) ||
        (existingTemplate?.projectTypeId as string) ||
        "") as string,
      variant: (existingTemplate?.variant || "") as string,
      description: (existingTemplate?.description || "") as string,
    } as FormValues,
    validators: {
      onChange: templateSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        // Validation
        if (!value.name || value.name.trim() === "") {
          toast.error("Template name is required");
          return;
        }

        if (folders.length === 0) {
          toast.error("At least one folder is required");
          return;
        }

        const effectiveProjectTypeId =
          propProjectTypeId || (value.projectTypeId as Id<"projectTypes">);

        if (!effectiveProjectTypeId) {
          toast.error("Project type is required");
          return;
        }

        const data = {
          ...value,
          projectTypeId: effectiveProjectTypeId,
          folders,
          isActive: existingTemplate?.isActive ?? true,
        };

        if (templateId) {
          await updateTemplate({ id: templateId, ...data });
          toast.success("Template updated successfully");
        } else {
          await createTemplate(data);
          toast.success("Template created successfully");
        }

        // Navigate back to appropriate location
        router.push(backUrl);
      } catch (error) {
        console.error("Save error:", error);
        toast.error("Failed to save template");
      }
    },
  });

  // Folder Operations
  const addRootFolder = () => {
    if (folders.length >= 10) {
      toast.error("Maximum 10 root folders allowed");
      return;
    }
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

    if (parts.length === 1) {
      // Adding to Level 1
      const l1Idx = parseInt(parts[0]);
      const l1 = newFolders[l1Idx];
      if (!l1.children) l1.children = [];

      if (l1.children.length >= 10) {
        toast.error("Maximum 10 folders allowed per directory");
        return;
      }

      l1.children.push({
        name: "New Child Folder",
        path: `${l1.path}/new-child`,
        isRequired: false,
      });
    } else if (parts.length === 3) {
      // Adding to Level 2
      const l1Idx = parseInt(parts[0]);
      const l2Idx = parseInt(parts[2]);
      const l2 = newFolders[l1Idx].children![l2Idx];
      if (!l2.children) l2.children = [];

      if (l2.children.length >= 10) {
        toast.error("Maximum 10 folders allowed per directory");
        return;
      }

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

    if (parts.length === 1) {
      // Delete Level 1
      newFolders.splice(parseInt(parts[0]), 1);
    } else if (parts.length === 3) {
      // Delete Level 2
      newFolders[parseInt(parts[0])].children!.splice(parseInt(parts[2]), 1);
    } else if (parts.length === 5) {
      // Delete Level 3
      newFolders[parseInt(parts[0])].children![
        parseInt(parts[2])
      ].children!.splice(parseInt(parts[4]), 1);
    }
    setFolders(newFolders);
    setDeletePath(null);
    toast.success("Folder deleted");
  };

  const confirmDeleteBulk = () => {
    if (!deletePaths || deletePaths.length === 0) return;

    const newFolders = [...folders];

    // Sort paths by depth (deepest first) and then by index (highest first)
    const sortedPaths = [...deletePaths].sort((a, b) => {
      const aParts = a.split(".");
      const bParts = b.split(".");
      if (aParts.length !== bParts.length) return bParts.length - aParts.length;
      return (
        parseInt(bParts[bParts.length - 1]) -
        parseInt(aParts[aParts.length - 1])
      );
    });

    sortedPaths.forEach((path) => {
      const parts = path.split(".");
      if (parts.length === 1) {
        newFolders.splice(parseInt(parts[0]), 1);
      } else if (parts.length === 3) {
        newFolders[parseInt(parts[0])].children!.splice(parseInt(parts[2]), 1);
      } else if (parts.length === 5) {
        newFolders[parseInt(parts[0])].children![
          parseInt(parts[2])
        ].children!.splice(parseInt(parts[4]), 1);
      }
    });

    setFolders(newFolders);
    setDeletePaths(null);
    toast.success(`${deletePaths.length} folders deleted`);
  };

  const updateFolder = (
    path: string,
    updated: FolderLevel1 | FolderLevel2 | FolderLevel3,
  ) => {
    const newFolders = [...folders];
    const parts = path.split(".");

    if (parts.length === 1) {
      newFolders[parseInt(parts[0])] = {
        ...newFolders[parseInt(parts[0])],
        ...updated,
      } as FolderLevel1;
    } else if (parts.length === 3) {
      const l1Idx = parseInt(parts[0]);
      const l2Idx = parseInt(parts[2]);
      newFolders[l1Idx].children![l2Idx] = {
        ...newFolders[l1Idx].children![l2Idx],
        ...updated,
      } as FolderLevel2;
    } else if (parts.length === 5) {
      const l1Idx = parseInt(parts[0]);
      const l2Idx = parseInt(parts[2]);
      const l3Idx = parseInt(parts[4]);
      newFolders[l1Idx].children![l2Idx].children![l3Idx] = {
        ...newFolders[l1Idx].children![l2Idx].children![l3Idx],
        ...updated,
      } as FolderLevel3;
    }

    setFolders(newFolders);
  };

  if (templateId && existingTemplate === undefined) {
    return <FolderTemplateBuilderLoading />;
  }

  if (templateId && existingTemplate === null) {
    return <FolderTemplateBuilderError error="Folder template not found" />;
  }

  // Wait for parent project type in context mode
  if (isProjectTypeContext && parentProjectType === undefined) {
    return <FolderTemplateBuilderLoading />;
  }

  if (isProjectTypeContext && parentProjectType === null) {
    return <FolderTemplateBuilderError error="Project type not found" />;
  }

  return (
    <div className="w-full space-y-12 pb-32 font-geist px-10 pt-16">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-8 border-b border-white/5">
        <div className="flex items-center gap-5 flex-1 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="shrink-0 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all h-11 w-11"
          >
            <Link href={backUrl}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1 min-w-0 flex items-center">
            <form.Field
              name="name"
              children={(field) => (
                <div className="flex flex-col w-full h-full justify-center">
                  {isEditingName ? (
                    <input
                      autoFocus
                      placeholder="Enter template name..."
                      value={field.state.value}
                      onBlur={() => {
                        field.handleBlur();
                      }}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const currentName = field.state.value;
                          if (currentName !== initialName) {
                            setShowNameConfirm(true);
                          } else {
                            setIsEditingName(false);
                          }
                        }
                        if (e.key === "Escape") {
                          field.handleChange(initialName);
                          setIsEditingName(false);
                        }
                      }}
                      onFocus={(e) => e.currentTarget.select()}
                      className="bg-transparent border-none outline-none p-0 w-full text-3xl font-black uppercase tracking-tight text-white font-sentient leading-none placeholder:text-white/10"
                    />
                  ) : (
                    <h1
                      onClick={() => {
                        setInitialName(field.state.value);
                        setIsEditingName(true);
                      }}
                      className="text-3xl font-black tracking-tight text-white uppercase font-sentient leading-none cursor-text hover:text-white/80 transition-colors"
                    >
                      {field.state.value ||
                        (templateId ? "Edit Template" : "New Template")}
                    </h1>
                  )}
                </div>
              )}
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => {
              if (isEditingName) {
                const currentName = form.getFieldValue("name");
                if (currentName !== initialName) {
                  setShowNameConfirm(true);
                } else {
                  setIsEditingName(false);
                }
              } else {
                setInitialName(form.getFieldValue("name"));
                setIsEditingName(true);
              }
            }}
            className={cn(
              "gap-2 bg-white/5 border border-white/5 hover:bg-white/10 text-white/40 hover:text-white font-bold uppercase tracking-widest text-[10px] h-12 px-6 rounded-xl transition-all",
              isEditingName &&
                "bg-primary/20 text-primary border-primary/20 hover:bg-primary/30",
            )}
          >
            {isEditingName ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                Done Editing
              </>
            ) : (
              <>
                <Pencil className="h-3.5 w-3.5" />
                Edit Template Name
              </>
            )}
          </Button>
          <Button
            onClick={() => form.handleSubmit()}
            className="gap-3 bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest text-[10px] h-12 px-8 rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Show locked project type info when in context */}
        {isProjectTypeContext && parentProjectType && (
          <div className="flex items-center gap-4 p-5 rounded-2xl bg-primary/5 border border-primary/20">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
              <Tag className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40">
                Project Type (Locked)
              </p>
              <p className="text-sm font-bold text-white">
                {parentProjectType.name}
              </p>
            </div>
          </div>
        )}

        {/* Variant Field */}

        {/* Main Workspace */}
        <div className="space-y-8">
          <section className="space-y-4">
            <div className="flex items-center gap-3 ml-1">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <FolderOpen className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-white/90">
                  Folder Hierarchy
                </h2>
                <p className="text-[10px] text-white/30 font-medium mt-0.5">
                  Design the directory structure for this template
                </p>
              </div>
            </div>

            <Card className="relative overflow-hidden bg-zinc-900/40 border-white/5 p-1 rounded-[2.5rem] glass-subtle min-h-[600px]">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
              <CardContent className="relative z-10 p-10">
                <FolderTreeComponent
                  folders={folders}
                  onAddRoot={addRootFolder}
                  onAddChild={addChildFolder}
                  onEdit={updateFolder}
                  onDelete={(path) => setDeletePath(path)}
                  onDeleteBulk={(paths) => setDeletePaths(paths)}
                  renderHeader={
                    // Only show project type selector when NOT in project type context
                    !isProjectTypeContext ? (
                      <form.Field
                        name="projectTypeId"
                        children={(field) => {
                          const selectedType = projectTypes.find(
                            (t) => t._id === field.state.value,
                          );
                          return (
                            <Sheet>
                              <SheetTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="h-9 bg-zinc-950/40 border-white/5 hover:bg-zinc-950/60 transition-all rounded-xl px-4 flex items-center gap-3 group"
                                >
                                  <div className="flex flex-col items-start">
                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20 group-hover:text-primary/50 transition-colors">
                                      Project Type
                                    </span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">
                                      {selectedType?.name || "Select Type"}
                                    </span>
                                  </div>
                                  <div className="h-4 w-px bg-white/5 mx-1" />
                                  <ChevronRight className="h-3 w-3 text-white/20 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                                </Button>
                              </SheetTrigger>
                              <SheetContent
                                side="right"
                                className="w-[400px] bg-zinc-950 border-l border-white/5 p-0 overflow-hidden"
                              >
                                <div className="absolute top-0 right-0 w-full h-[300px] bg-primary/5 blur-[100px] rounded-full -translate-y-1/2" />

                                <SheetHeader className="p-8 border-b border-white/5 relative z-10">
                                  <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
                                      <LayoutTemplate className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                      <SheetTitle className="text-xl font-black uppercase tracking-tight text-white font-sentient">
                                        Project Types
                                      </SheetTitle>
                                      <SheetDescription className="text-white/40 text-[10px] font-bold uppercase tracking-widest">
                                        Select a category for this template
                                      </SheetDescription>
                                    </div>
                                  </div>
                                </SheetHeader>

                                <ScrollArea className="h-[calc(100vh-120px)] relative z-10">
                                  <div className="p-6 space-y-3">
                                    {projectTypes.map((type: any) => (
                                      <button
                                        key={type._id}
                                        onClick={() =>
                                          field.handleChange(type._id)
                                        }
                                        className={cn(
                                          "w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group",
                                          field.state.value === type._id
                                            ? "bg-primary/10 border-primary/30 ring-1 ring-primary/20"
                                            : "bg-white/2 border-white/5 hover:bg-white/5 hover:border-white/10",
                                        )}
                                      >
                                        <div
                                          className={cn(
                                            "h-12 w-12 rounded-xl flex items-center justify-center transition-all",
                                            field.state.value === type._id
                                              ? "bg-primary text-white"
                                              : "bg-white/5 text-white/40 group-hover:text-white/60",
                                          )}
                                        >
                                          <FolderTree className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                          <p
                                            className={cn(
                                              "text-xs font-black uppercase tracking-widest transition-colors",
                                              field.state.value === type._id
                                                ? "text-primary"
                                                : "text-white/80",
                                            )}
                                          >
                                            {type.name}
                                          </p>
                                          {type.description ? (
                                            <p className="text-[10px] text-white/30 font-medium line-clamp-1">
                                              {type.description}
                                            </p>
                                          ) : (
                                            <p className="text-[10px] text-white/20 italic">
                                              No description provided
                                            </p>
                                          )}
                                        </div>
                                        {field.state.value === type._id && (
                                          <CheckCircle2 className="h-4 w-4 text-primary" />
                                        )}
                                      </button>
                                    ))}
                                  </div>
                                </ScrollArea>
                              </SheetContent>
                            </Sheet>
                          );
                        }}
                      />
                    ) : null
                  }
                />
              </CardContent>
            </Card>
          </section>
        </div>
      </div>

      <AlertDialog
        open={!!deletePath}
        onOpenChange={(open) => !open && setDeletePath(null)}
      >
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
              Are you sure you want to delete this folder? This action cannot be
              undone and will remove all subfolders.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 gap-3 relative z-10 flex flex-row items-center">
            <AlertDialogCancel className="h-11 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-wider text-[10px] flex-1 mt-0">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteFolder}
              className="h-11 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold uppercase tracking-wider text-[10px] flex-1 shadow-lg shadow-red-500/20"
            >
              Delete Folder
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog
        open={!!deletePaths && deletePaths.length > 0}
        onOpenChange={(open) => !open && setDeletePaths(null)}
      >
        <AlertDialogContent className="bg-zinc-950 border-white/10 rounded-3xl p-8 glass overflow-hidden max-w-md">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-500/10 blur-[80px] rounded-full" />

          <AlertDialogHeader className="space-y-4 relative z-10">
            <div className="mx-auto p-4 rounded-full bg-red-500/10 border border-red-500/20 w-fit mb-2 shadow-xl shadow-red-500/5">
              <Trash2 className="h-6 w-6 text-red-500" />
            </div>
            <AlertDialogTitle className="text-2xl font-black uppercase tracking-tight text-white text-center font-sentient">
              Delete Folders
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/50 text-xs font-medium text-center leading-relaxed px-4">
              Are you sure you want to delete {deletePaths?.length} selected
              folders? This action cannot be undone and will remove all their
              subfolders.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 gap-3 relative z-10 flex flex-row items-center">
            <AlertDialogCancel className="h-11 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-wider text-[10px] flex-1 mt-0">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteBulk}
              className="h-11 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold uppercase tracking-wider text-[10px] flex-1 shadow-lg shadow-red-500/20"
            >
              Delete Selected
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Confirmation Dialog for Name Change */}
      <AlertDialog open={showNameConfirm} onOpenChange={setShowNameConfirm}>
        <AlertDialogContent className="bg-zinc-950 border-white/10 rounded-2xl glass">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black uppercase tracking-tight text-white font-sentient">
              Change Template Name?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-white/50 font-medium">
              Are you sure you want to change the template name to{" "}
              <span className="text-primary font-bold">
                "{form.getFieldValue("name")}"
              </span>
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              onClick={() => {
                form.setFieldValue("name", initialName);
                setIsEditingName(false);
              }}
              className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white uppercase tracking-widest text-[10px] font-bold h-10 px-6 transition-all"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setIsEditingName(false);
                setShowNameConfirm(false);
              }}
              className="rounded-xl bg-primary hover:bg-primary/90 text-white uppercase tracking-widest text-[10px] font-bold h-10 px-8 transition-all shadow-lg shadow-primary/20"
            >
              Confirm Change
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
