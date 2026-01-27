"use client";

import { api } from "@convex/_generated/api";
import { useMutation } from "convex/react";
import { Archive, ArchiveRestore, Eye, LinkIcon, Pencil } from "lucide-react";
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
import { StudioEditDrawer } from "../studio-edit-drawer";
import type { AdminStudio } from "./types";

interface StudioActionsProps {
  studio: AdminStudio;
}

export function StudioActions({ studio }: StudioActionsProps) {
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const updateClient = useMutation(
    api.functions.profiles.mutations.updateStudioProfile,
  );
  const deactivateStudio = useMutation(
    api.functions.profiles.mutations.deactivateStudio,
  );
  const reactivateStudio = useMutation(
    api.functions.profiles.mutations.reactivateStudio,
  );

  const handleSave = async (values: any) => {
    setIsLoading(true);
    try {
      await updateClient({
        profileId: studio._id,
        ...values,
      });
      toast.success(`Studio ${studio.name} updated successfully.`);
      setShowEditDrawer(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update studio",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivate = async () => {
    setIsLoading(true);
    try {
      await deactivateStudio({ profileId: studio._id });
      toast.success(`Studio ${studio.name} has been deactivated.`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to deactivate studio",
      );
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const handleReactivate = async () => {
    setIsLoading(true);
    try {
      await reactivateStudio({ profileId: studio._id });
      toast.success(`Studio ${studio.name} has been reactivated.`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to reactivate studio",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isDeactivated = !!studio.deactivatedAt;

  const actions: RowAction<AdminStudio>[] = [
    {
      label: "View Profile",
      icon: Eye,
      href: `/clients/${studio._id}`,
    },
    {
      label: "Edit Studio",
      icon: Pencil,
      onClick: () => setShowEditDrawer(true),
    },
    ...(!studio.onboardingComplete
      ? [
          {
            label: "Copy Invite Link",
            icon: LinkIcon,
            onClick: () => {
              const url = `${window.location.origin}/onboarding?profileId=${studio._id}`;
              navigator.clipboard.writeText(url);
              toast.success("Invite link copied to clipboard!");
            },
          },
        ]
      : []),
    {
      label: isDeactivated ? "Reactivate" : "Deactivate",
      icon: isDeactivated ? ArchiveRestore : Archive,
      separator: true,
      onClick: () => {
        if (isDeactivated) {
          handleReactivate();
        } else {
          setShowDeleteDialog(true);
        }
      },
    },
  ];

  return (
    <>
      <DataTableRowActions row={studio} actions={actions} />

      <StudioEditDrawer
        open={showEditDrawer}
        onOpenChange={setShowEditDrawer}
        onSave={handleSave}
        studio={studio}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-zinc-950 border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-black uppercase tracking-tight text-red-400">
              Deactivate Studio
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Are you sure you want to deactivate{" "}
              <strong className="text-primary">{studio.name}</strong>?
              <br />
              <br />
              The studio will no longer be able to log in, but their project
              history and records will be preserved.
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
              onClick={handleDeactivate}
              disabled={isLoading}
              className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
            >
              {isLoading ? "Deactivating..." : "Deactivate Studio"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
