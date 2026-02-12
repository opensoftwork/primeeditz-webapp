"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

import { api } from "@convex/_generated/api";
import { useAction, useMutation } from "convex/react";
import { Archive, ArchiveRestore, Eye, Pencil, Trash2 } from "lucide-react";
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
import type { AdminProject } from "./types";

interface ProjectActionsProps {
  project: AdminProject;
}

export function ProjectActions({ project }: ProjectActionsProps) {
  const router = useRouter();
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const archiveProject = useMutation(
    api.functions.projects.mutations.archiveProject,
  );
  const unarchiveProject = useMutation(
    api.functions.projects.mutations.unarchiveProject,
  );
  const softDeleteProject = useMutation(
    api.functions.projects.mutations.softDeleteProject,
  );
  const restoreProject = useMutation(
    api.functions.projects.mutations.restoreProject,
  );
  const permanentlyDeleteProject = useMutation(
    api.functions.projects.mutations.permanentlyDeleteProject,
  );
  const cleanupStorage = useAction(
    api.functions.storage.cleanup.cleanupProjectStorage,
  );

  const handleArchive = async () => {
    setIsLoading(true);
    try {
      await archiveProject({ projectId: project._id });
      toast.success(`Project ${project.code} has been archived successfully.`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to archive project",
      );
    } finally {
      setIsLoading(false);
      setShowArchiveDialog(false);
    }
  };

  const handleUnarchive = async () => {
    setIsLoading(true);
    try {
      await unarchiveProject({ projectId: project._id });
      toast.success(`Project ${project.code} has been restored successfully.`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to restore project",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSoftDelete = async () => {
    setIsLoading(true);
    try {
      await softDeleteProject({ projectId: project._id });
      toast.success(`Project ${project.code} has been moved to trash.`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete project",
      );
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const handleRestore = async () => {
    setIsLoading(true);
    try {
      await restoreProject({ projectId: project._id });
      toast.success(`Project ${project.code} has been restored from trash.`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to restore project",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePermanentDelete = async () => {
    setIsLoading(true);
    try {
      const { fileKeys } = await permanentlyDeleteProject({
        projectId: project._id,
      });

      // Queue storage cleanup in background - don't block UI for this
      if (fileKeys && fileKeys.length > 0) {
        cleanupStorage({ fileKeys })
          .then(
            (res: {
              success: boolean;
              deletedCount?: number;
              error?: string;
            }) => {
              if (res.success) {
                console.log(`Cleaned up ${res.deletedCount} files from MinIO.`);
              } else {
                console.error("Storage cleanup failed:", res.error);
              }
            },
          )
          .catch((err: Error) => {
            console.error("Storage cleanup error:", err);
          });
      }

      toast.success(`Project ${project.code} has been permanently deleted.`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to permanently delete project",
      );
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const isArchived = project.phase === "archived";

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        <button
          onClick={() => router.push(`/projects/${project._id}`)}
          className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors"
          title="View Details"
        >
          <Eye className="h-4 w-4" />
        </button>

        <button
          onClick={() => {
            // TODO: Implement edit or navigate
            toast.info("Edit feature coming soon");
          }}
          className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors"
          title="Edit Project"
        >
          <Pencil className="h-4 w-4" />
        </button>

        <button
          onClick={() => {
            if (isArchived) {
              handleUnarchive();
            } else {
              setShowArchiveDialog(true);
            }
          }}
          disabled={isLoading}
          className={cn(
            "p-2 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50",
            isArchived
              ? "text-amber-500/40 hover:text-amber-400"
              : "text-white/40 hover:text-amber-400",
          )}
          title={isArchived ? "Restore from Archive" : "Archive Project"}
        >
          {isArchived ? (
            <ArchiveRestore className="h-4 w-4" />
          ) : (
            <Archive className="h-4 w-4" />
          )}
        </button>

        <button
          onClick={() => {
            if (project.deletedAt) {
              handleRestore();
            } else {
              setShowDeleteDialog(true);
            }
          }}
          disabled={isLoading}
          className={cn(
            "p-2 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50",
            project.deletedAt
              ? "text-red-500/40 hover:text-green-400"
              : "text-white/40 hover:text-red-400",
          )}
          title={project.deletedAt ? "Restore from Trash" : "Move to Trash"}
        >
          {project.deletedAt ? (
            <ArchiveRestore className="h-4 w-4" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </button>

        {project.deletedAt && (
          <button
            onClick={() => setShowDeleteDialog(true)}
            disabled={isLoading}
            className="p-2 rounded-lg hover:bg-white/5 text-red-500/40 hover:text-red-500 transition-colors disabled:opacity-50"
            title="Delete Permanently"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <AlertDialogContent className="bg-zinc-950 border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white font-black uppercase tracking-tight">
              Archive Project
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Are you sure you want to archive project{" "}
              <strong className="text-primary">{project.code}</strong>?
              <br />
              <br />
              The project data will be preserved but it will no longer be
              accessible to clients or employees. You can restore it later if
              needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white"
              disabled={isLoading}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleArchive}
              disabled={isLoading}
              className="bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30"
            >
              {isLoading ? "Archiving..." : "Archive Project"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-zinc-950 border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-black uppercase tracking-tight text-red-400">
              {project.deletedAt
                ? "Delete Project Permanently"
                : "Move to Trash"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              {project.deletedAt ? (
                <>
                  Are you sure you want to{" "}
                  <strong className="text-red-400">permanently delete</strong>{" "}
                  project{" "}
                  <strong className="text-primary">{project.code}</strong>?
                  <br />
                  <br />
                  <span className="text-red-400/80">
                    ⚠️ This action cannot be undone. All project data, files, and
                    history will be permanently removed.
                  </span>
                </>
              ) : (
                <>
                  Move project{" "}
                  <strong className="text-primary">{project.code}</strong> to
                  trash?
                  <br />
                  <br />
                  This project will be moved to Trash for 30 days. After that,
                  it will be permanently deleted along with all files. You can
                  restore it anytime from the Trash view within this period.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white"
              disabled={isLoading}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={
                project.deletedAt ? handlePermanentDelete : handleSoftDelete
              }
              disabled={isLoading}
              className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
            >
              {isLoading
                ? project.deletedAt
                  ? "Deleting..."
                  : "Moving..."
                : project.deletedAt
                  ? "Delete Permanently"
                  : "Move to Trash"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
