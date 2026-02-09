"use client";

import { api } from "@convex/_generated/api";
import { useMutation } from "convex/react";
import { Pencil, Power, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
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
import type { AdminProjectType } from "./types";
import type { Id } from "@convex/_generated/dataModel";

interface ProjectActionsProps {
  type: AdminProjectType;
  onEdit: (type: AdminProjectType) => void;
}

export function ProjectActions({ type, onEdit }: ProjectActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const toggleStatusMutation = useMutation(
    api.functions.projectTypes.mutations.toggleProjectTypeActive,
  );
  const deleteMutation = useMutation(
    api.functions.projectTypes.mutations.deleteProjectType,
  );

  const handleToggleActive = async () => {
    setIsLoading(true);
    try {
      await toggleStatusMutation({
        id: type._id,
        isActive: !type.isActive,
      });
      toast.success(
        `Project type ${!type.isActive ? "activated" : "deactivated"}`,
      );
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deleteMutation({ id: type._id });
      toast.success("Project type deleted permanently");
      setShowDeleteDialog(false);
    } catch (error) {
      toast.error("Failed to delete project type");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={() => onEdit(type)}
          className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors"
          title="Edit Project Type"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={handleToggleActive}
          disabled={isLoading}
          className={cn(
            "p-2 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50",
            type.isActive
              ? "text-green-500/40 hover:text-red-400"
              : "text-white/20 hover:text-green-400",
          )}
          title={
            type.isActive ? "Deactivate Project Type" : "Activate Project Type"
          }
        >
          <Power className="h-4 w-4" />
        </button>
        <button
          onClick={() => setShowDeleteDialog(true)}
          disabled={isLoading}
          className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-red-400 transition-colors disabled:opacity-50"
          title="Delete Project Type"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-zinc-950 border-white/10 rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black text-white uppercase tracking-tighter">
              Verify Deletion
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/40 font-bold uppercase tracking-widest text-[10px]">
              Are you sure you want to remove{" "}
              <span className="text-white">"{type.name}"</span>? This will also
              impact any service packages using this project type.
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
