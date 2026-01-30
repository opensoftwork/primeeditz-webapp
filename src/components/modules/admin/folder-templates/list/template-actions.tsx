"use client";

import { api } from "@convex/_generated/api";
import { useMutation } from "convex/react";
import { Edit3, Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DataTableRowActions,
  type RowAction,
} from "@/components/shared/data-table";
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
import type { AdminFolderTemplate } from "./types";

interface TemplateActionsProps {
  template: AdminFolderTemplate;
}

export function TemplateActions({ template }: TemplateActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const deleteMutation = useMutation(
    api.functions.folderTemplates.mutations.deleteFolderTemplate,
  );

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deleteMutation({ id: template._id });
      toast.success("Template deleted successfully");
      setShowDeleteDialog(false);
    } catch (error) {
      toast.error("Failed to delete template");
    } finally {
      setIsLoading(false);
    }
  };

  const actions: RowAction<AdminFolderTemplate>[] = [
    {
      label: "Edit Template",
      icon: Edit3,
      onClick: () => router.push(`/settings/folder-templates/${template._id}`),
    },
    {
      label: "Delete",
      icon: Trash2,
      variant: "destructive",
      separator: true,
      onClick: () => setShowDeleteDialog(true),
    },
  ];

  return (
    <>
      <DataTableRowActions row={template} actions={actions} />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-zinc-950 border-white/10 rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black text-white uppercase tracking-tighter">
              Verify Deletion
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/40 font-bold uppercase tracking-widest text-[10px]">
              Are you sure you want to remove{" "}
              <span className="text-white">"{template.name}"</span>? This action
              is permanent and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 gap-4">
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white font-black uppercase tracking-widest text-[10px] h-12 px-8 rounded-2xl">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-widest text-[10px] h-12 px-8 rounded-2xl"
            >
              {isLoading ? "Deleting..." : "Delete Permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
