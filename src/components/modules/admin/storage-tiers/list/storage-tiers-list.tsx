"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Plus } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DataTable, DataTableSkeleton } from "@/components/shared/data-table";
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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getColumns } from "./columns";
import { StorageTierCard } from "./storage-tier-card";
import {
  StorageTierDrawer,
  type StorageTierFormValues,
} from "./storage-tier-drawer";
import type { StorageTier } from "./types";

export function StorageTiersList() {
  const storageTiers = useQuery(
    api.functions.storageTiers.queries.listStorageTiers,
  );
  const createStorageTier = useMutation(
    api.functions.storageTiers.mutations.createStorageTier,
  );
  const updateStorageTier = useMutation(
    api.functions.storageTiers.mutations.updateStorageTier,
  );
  const deleteMutation = useMutation(
    api.functions.storageTiers.mutations.deleteStorageTier,
  );

  // State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<StorageTier | null>(null);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [tierToDelete, setTierToDelete] = useState<{
    id: Id<"storageTiers">;
    name: string;
  } | null>(null);

  // Transform data for the table
  const data: StorageTier[] = useMemo(() => {
    if (!storageTiers) return [];
    return storageTiers.map((tier) => ({
      ...tier,
    }));
  }, [storageTiers]);

  const handleToggleActive = async (tier: StorageTier) => {
    try {
      await updateStorageTier({
        id: tier._id as Id<"storageTiers">,
        isActive: !tier.isActive,
      });
      toast.success(
        `Storage tier ${tier.isActive ? "deactivated" : "activated"}`,
      );
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const columns = useMemo(
    () =>
      getColumns(
        (tier) => {
          setEditingTier(tier);
          setIsViewOnly(true);
          setIsDrawerOpen(true);
        },
        (tier) => {
          setEditingTier(tier);
          setIsViewOnly(false);
          setIsDrawerOpen(true);
        },
        handleToggleActive,
        (tier) => {
          setTierToDelete({
            id: tier._id as Id<"storageTiers">,
            name: tier.name,
          });
        },
      ),
    [],
  );

  // Handlers
  const handleCreate = () => {
    setEditingTier(null);
    setIsViewOnly(false);
    setIsDrawerOpen(true);
  };

  const handleSave = async (values: StorageTierFormValues) => {
    try {
      if (editingTier) {
        await updateStorageTier({
          id: editingTier._id as Id<"storageTiers">,
          name: values.name,
          sizeGB: values.sizeGB,
          isActive: values.isActive,
        });
        toast.success("Storage tier updated successfully");
      } else {
        await createStorageTier({
          name: values.name,
          sizeGB: values.sizeGB,
          isActive: values.isActive,
        });
        toast.success("New storage tier created");
      }
      setIsDrawerOpen(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "An error occurred while saving";
      toast.error(message);
    }
  };

  const handleDelete = async () => {
    if (!tierToDelete) return;
    try {
      await deleteMutation({ id: tierToDelete.id });
      toast.success("Storage tier deleted permanently");
      setTierToDelete(null);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to delete storage tier";
      toast.error(message);
    }
  };

  // Loading State
  if (storageTiers === undefined) {
    return (
      <div className="flex min-h-[calc(100vh-120px)] w-full flex-col px-8 pt-10 pb-12">
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 bg-white/5" />
            <Skeleton className="h-12 w-64 bg-white/5" />
          </div>
          <Skeleton className="h-12 w-48 rounded-xl bg-white/5" />
        </div>
        <DataTableSkeleton rows={6} columns={4} viewMode="cards" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-120px)] w-full flex-col px-8 pt-10 pb-12">
      <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">
            ADMINISTRATIVE CONTROL
          </span>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-white xl:text-5xl">
            Storage Tiers
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Button
            onClick={handleCreate}
            className="h-12 gap-2 rounded-xl bg-primary px-8 text-[11px] font-black uppercase tracking-widest text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            ADD STORAGE TIER
          </Button>
        </motion.div>
      </div>

      <DataTable
        className="flex-1"
        columns={columns}
        data={data}
        emptyTitle="No storage tiers defined"
        emptyDescription="Set up your storage tiers with capacity to get started."
        renderCard={(tier) => (
          <StorageTierCard
            key={tier._id}
            tier={tier}
            onView={(tier) => {
              setEditingTier(tier);
              setIsViewOnly(true);
              setIsDrawerOpen(true);
            }}
            onEdit={(tier) => {
              setEditingTier(tier);
              setIsViewOnly(false);
              setIsDrawerOpen(true);
            }}
            onDelete={(id, name) => {
              setTierToDelete({
                id: id as Id<"storageTiers">,
                name,
              });
            }}
          />
        )}
        defaultView="cards"
        showViewToggle={true}
        toolbar={{
          search: {
            column: "name",
            placeholder: "Search storage tiers...",
          },
          filters: [
            {
              column: "isActive",
              title: "Status",
              options: [
                { label: "Active", value: "true" },
                { label: "Inactive", value: "false" },
              ],
            },
          ],
        }}
      />

      <StorageTierDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        onSave={handleSave}
        initialData={editingTier}
        isReadOnly={isViewOnly}
      />

      <AlertDialog
        open={!!tierToDelete}
        onOpenChange={(open) => !open && setTierToDelete(null)}
      >
        <AlertDialogContent className="bg-zinc-950 border-white/10 rounded-3xl p-8">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black text-white uppercase tracking-tighter">
              Verify Deletion
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/40 font-bold uppercase tracking-widest text-[10px]">
              Are you sure you want to remove{" "}
              <span className="text-white">"{tierToDelete?.name}"</span>? This
              may impact quotations using this storage tier.
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
