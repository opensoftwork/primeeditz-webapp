"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
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
import { FolderTemplateCard } from "./folder-template-card";
import { ListEmpty } from "./list-empty";
import { ListHeader } from "./list-header";

import type { FolderLevel1 } from "@convex/schema";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface FolderTemplate {
  _id: string;
  _creationTime: number;
  name: string;
  folders: FolderLevel1[];
  projectTypeId: Id<"projectTypes">;
  projectTypeName: string;
  variant?: string;
  description?: string;
  isDefault?: boolean;
  isActive: boolean;
}

export function FolderTemplatesList() {
  const templates = useQuery(
    api.functions.folderTemplates.queries.list,
  );
  const router = useRouter();
  const createMutation = useMutation(
    api.functions.folderTemplates.mutations.createFolderTemplate,
  );
  const updateMutation = useMutation(
    api.functions.folderTemplates.mutations.updateFolderTemplate,
  );
  const deleteMutation = useMutation(
    api.functions.folderTemplates.mutations.deleteFolderTemplate,
  );

  // State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<FolderTemplate | null>(
    null,
  );
  const [templateToDelete, setTemplateToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Handlers
  const handleCreate = () => {
    router.push("/settings/folder-templates/new");
  };

  const handleEdit = (template: FolderTemplate) => {
    router.push(`/settings/folder-templates/${template._id}`);
  };

  const handleDeleteConfirm = async () => {
    if (!templateToDelete) return;
    try {
      await deleteMutation({
        id: templateToDelete.id as Id<"folderTemplates">,
      });
      toast.success("Template deleted permanently");
      setTemplateToDelete(null);
    } catch (error) {
      toast.error("Failed to delete template");
    }
  };

  if (templates === undefined) {
    return (
      <div className="p-8 md:p-12 space-y-8">
        <Skeleton className="h-20 w-1/3 bg-white/5 rounded-3xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              className="h-64 w-full bg-white/5 rounded-[32px]"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24 p-8 md:p-12">
      <ListHeader onCreate={handleCreate} templateCount={templates.length} />

      {templates.length === 0 ? (
        <ListEmpty onCreate={handleCreate} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {templates.map((template) => (
            <FolderTemplateCard
              key={template._id}
              template={template as any}
              onEdit={handleEdit}
              onDelete={(id, name) => setTemplateToDelete({ id, name })}
            />
          ))}
        </div>
      )}

      <AlertDialog
        open={!!templateToDelete}
        onOpenChange={() => setTemplateToDelete(null)}
      >
        <AlertDialogContent className="bg-zinc-950 border-white/10 rounded-[32px] p-8">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black text-white uppercase tracking-tighter">
              Verify Deletion
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
            <Button
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-widest text-[10px] h-12 px-8 rounded-2xl"
            >
              Delete Permanently
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
