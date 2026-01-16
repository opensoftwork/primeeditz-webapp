"use client";

import { api } from "@convex/_generated/api";
import { useMutation } from "convex/react";
import { Archive, ArchiveRestore, Eye, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
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
import type { AdminProject } from "./types";

interface ProjectActionsProps {
    project: AdminProject;
}

export function ProjectActions({ project }: ProjectActionsProps) {
    const [showArchiveDialog, setShowArchiveDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const archiveProject = useMutation(api.functions.projects.mutations.archiveProject);
    const unarchiveProject = useMutation(api.functions.projects.mutations.unarchiveProject);
    const deleteProject = useMutation(api.functions.projects.mutations.deleteProject);

    const handleArchive = async () => {
        setIsLoading(true);
        try {
            await archiveProject({ projectId: project._id });
            toast.success(`Project ${project.code} has been archived successfully.`);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to archive project");
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
            toast.error(error instanceof Error ? error.message : "Failed to restore project");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            await deleteProject({ projectId: project._id });
            toast.success(`Project ${project.code} has been permanently deleted.`);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to delete project");
        } finally {
            setIsLoading(false);
            setShowDeleteDialog(false);
        }
    };

    const isArchived = project.status === "archived";

    const actions: RowAction<AdminProject>[] = [
        {
            label: "View Details",
            icon: Eye,
            href: `/projects/${project._id}`,
        },
        {
            label: "Edit Project",
            icon: Pencil,
            onClick: () => {
                // TODO: Implement edit - navigate to edit page or open modal
            },
        },
        {
            label: isArchived ? "Restore" : "Archive",
            icon: isArchived ? ArchiveRestore : Archive,
            separator: true,
            onClick: () => {
                if (isArchived) {
                    handleUnarchive();
                } else {
                    setShowArchiveDialog(true);
                }
            },
        },
        {
            label: "Delete",
            icon: Trash2,
            variant: "destructive",
            onClick: () => setShowDeleteDialog(true),
        },
    ];

    return (
        <>
            <DataTableRowActions row={project} actions={actions} />

            {/* Archive Confirmation Dialog */}
            <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
                <AlertDialogContent className="bg-zinc-950 border-white/10">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-white font-black uppercase tracking-tight">
                            Archive Project
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-white/60">
                            Are you sure you want to archive project <strong className="text-primary">{project.code}</strong>?
                            <br /><br />
                            The project data will be preserved but it will no longer be accessible to clients or employees.
                            You can restore it later if needed.
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
                        <AlertDialogTitle className="text-white font-black uppercase tracking-tight text-red-400">
                            Delete Project Permanently
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-white/60">
                            Are you sure you want to <strong className="text-red-400">permanently delete</strong> project <strong className="text-primary">{project.code}</strong>?
                            <br /><br />
                            <span className="text-red-400/80">
                                ⚠️ This action cannot be undone. All project data, files, and history will be permanently removed.
                            </span>
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
                            onClick={handleDelete}
                            disabled={isLoading}
                            className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
                        >
                            {isLoading ? "Deleting..." : "Delete Permanently"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
