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
import type { AdminClient } from "./types";
import { ClientEditDrawer } from "../client-edit-drawer";

interface ClientActionsProps {
  client: AdminClient;
}

export function ClientActions({ client }: ClientActionsProps) {
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const updateClient = useMutation(api.functions.profiles.mutations.updateClientProfile);
  const deactivateClient = useMutation(api.functions.profiles.mutations.deactivateClient);
  const reactivateClient = useMutation(api.functions.profiles.mutations.reactivateClient);

  const handleSave = async (values: any) => {
    setIsLoading(true);
    try {
      await updateClient({
        profileId: client._id,
        ...values,
      });
      toast.success(`Client ${client.name} updated successfully.`);
      setShowEditDrawer(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update client");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivate = async () => {
    setIsLoading(true);
    try {
      await deactivateClient({ profileId: client._id });
      toast.success(`Client ${client.name} has been deactivated.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to deactivate client");
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const handleReactivate = async () => {
    setIsLoading(true);
    try {
      await reactivateClient({ profileId: client._id });
      toast.success(`Client ${client.name} has been reactivated.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reactivate client");
    } finally {
      setIsLoading(false);
    }
  };

  const isDeactivated = !!client.deactivatedAt;

  const actions: RowAction<AdminClient>[] = [
    {
      label: "View Profile",
      icon: Eye,
      href: `/clients/${client._id}`,
    },
    {
      label: "Edit Client",
      icon: Pencil,
      onClick: () => setShowEditDrawer(true),
    },
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
      <DataTableRowActions row={client} actions={actions} />

      <ClientEditDrawer
        open={showEditDrawer}
        onOpenChange={setShowEditDrawer}
        onSave={handleSave}
        client={client}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-zinc-950 border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-black uppercase tracking-tight text-red-400">
              Deactivate Client
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Are you sure you want to deactivate <strong className="text-primary">{client.name}</strong>?
              <br /><br />
              The client will no longer be able to log in, but their project history and records will be preserved.
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
              {isLoading ? "Deactivating..." : "Deactivate Client"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
