"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
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
import { Skeleton } from "@/components/ui/skeleton";
import { TemplateCard } from "./template-card";
import { Plus, ArrowLeft, FolderTree } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface FolderTemplatesListProps {
  projectTypeId: Id<"projectTypes">;
  minimal?: boolean;
}

export function FolderTemplatesList({
  projectTypeId,
  minimal = false,
}: FolderTemplatesListProps) {
  const router = useRouter();

  // Queries
  const projectType = useQuery(api.functions.projectTypes.queries.getById, {
    id: projectTypeId,
  });
  const templates = useQuery(
    api.functions.folderTemplates.queries.listAllByProjectType,
    { projectTypeId },
  );

  // Mutations
  const deleteMutation = useMutation(
    api.functions.folderTemplates.mutations.deleteFolderTemplate,
  );

  // State
  const [templateToDelete, setTemplateToDelete] = useState<{
    id: Id<"folderTemplates">;
    name: string;
  } | null>(null);

  const handleCreate = () => {
    router.push(
      `/settings/project-types/${projectTypeId}/folder-templates/new`,
    );
  };

  const handleView = (id: string) => {
    router.push(
      `/settings/project-types/${projectTypeId}/folder-templates/${id}`,
    );
  };

  const handleEdit = (id: string) => {
    router.push(
      `/settings/project-types/${projectTypeId}/folder-templates/${id}/edit`,
    );
  };

  const handleDelete = async () => {
    if (!templateToDelete) return;
    try {
      await deleteMutation({ id: templateToDelete.id });
      toast.success("Template deleted successfully");
      setTemplateToDelete(null);
    } catch (error) {
      toast.error("Failed to delete template");
    }
  };

  // Derived values
  const defaultTemplateId = projectType?.defaultFolderTemplateId;
  const templateCount = templates?.length ?? 0;

  if (templates === undefined || projectType === undefined) {
    return <FolderTemplatesListLoading />;
  }

  if (projectType === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-white/40">Project type not found</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-full pb-20 font-geist",
        minimal ? "px-8 md:px-12 pt-0" : "px-10 pt-8",
      )}
    >
      {/* Header - Compact in minimal mode */}
      <div className={cn("flex flex-col mb-8", minimal ? "gap-4" : "gap-8")}>
        {!minimal && (
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="shrink-0 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all h-10 w-10"
            >
              <Link href="/settings/project-types">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                {projectType.name} • {templateCount} TEMPLATE
                {templateCount !== 1 ? "S" : ""}
              </span>
              <h1 className="text-4xl font-black uppercase tracking-tighter text-white font-sentient">
                Folder Templates
              </h1>
            </div>
          </div>
        )}

        <div
          className={cn(
            "flex flex-col md:flex-row md:items-center justify-between gap-6 py-6",
            minimal ? "border-b border-white/5" : "border-y border-white/5",
          )}
        >
          <div className="max-w-md">
            {minimal && (
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                  <FolderTree className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-white">
                  Folder Templates
                </h3>
              </div>
            )}
            <p className="text-sm font-medium text-white/40 leading-relaxed">
              Manage {minimal ? "directory" : "multiple directory"} hierarchies
              for this project engine. These templates{" "}
              {minimal ? "are used" : "will be available"} for quick-start
              during project initialization.
            </p>
          </div>

          <Button
            onClick={handleCreate}
            className="h-10 px-6 rounded-lg font-black uppercase tracking-widest text-[10px] bg-primary text-primary-foreground hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20 gap-2"
          >
            <Plus className="h-4 w-4" />
            ADD TEMPLATE
          </Button>
        </div>
      </div>

      {/* Templates Grid */}
      {templates && templates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <TemplateCard
              key={template._id}
              template={template as any}
              isDefault={template._id === defaultTemplateId}
              onView={() => handleView(template._id)}
              onEdit={() => handleEdit(template._id)}
              onDelete={
                template._id !== defaultTemplateId
                  ? () =>
                      setTemplateToDelete({
                        id: template._id as Id<"folderTemplates">,
                        name: template.name,
                      })
                  : undefined
              }
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="p-4 rounded-2xl bg-white/5 mb-6">
            <FolderTree className="h-8 w-8 text-white/20" />
          </div>
          <h3 className="text-lg font-black uppercase tracking-widest text-white mb-2">
            No Additional Templates
          </h3>
          <p className="text-sm text-white/40 mb-6 max-w-md">
            The default template was created with the project type. Add more
            templates for different folder structure variants.
          </p>
          <Button onClick={handleCreate} className="gap-2 rounded-xl">
            <Plus className="h-4 w-4" />
            Add Template
          </Button>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!templateToDelete}
        onOpenChange={(open) => !open && setTemplateToDelete(null)}
      >
        <AlertDialogContent className="bg-zinc-950 border-white/10 rounded-3xl p-8">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black text-white uppercase tracking-tighter">
              Delete Template?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/40 font-bold uppercase tracking-widest text-[10px]">
              Are you sure you want to remove{" "}
              <span className="text-white">"{templateToDelete?.name}"</span>?
              This action is permanent and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 gap-4">
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white font-black uppercase tracking-widest text-[10px] h-12 px-8 rounded-2xl">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-widest text-[10px] h-12 px-8 rounded-2xl"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function FolderTemplatesListLoading() {
  return (
    <div className="w-full px-10 pt-8">
      <div className="flex flex-col gap-8 mb-12">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-xl bg-white/5" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 bg-white/5" />
            <Skeleton className="h-12 w-48 bg-white/5" />
          </div>
        </div>
        <div className="flex items-center justify-between border-y border-white/5 py-8">
          <Skeleton className="h-12 w-64 bg-white/5" />
          <Skeleton className="h-12 w-40 rounded-xl bg-white/5" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 rounded-3xl bg-white/5" />
        ))}
      </div>
    </div>
  );
}
