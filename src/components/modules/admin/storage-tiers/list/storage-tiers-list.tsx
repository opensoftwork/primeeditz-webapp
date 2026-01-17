"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  StorageTierDrawer,
  type StorageTierFormValues,
} from "./storage-tier-drawer";
import { StorageTierCard } from "./storage-tier-card";
import { ListHeader } from "./list-header";
import { ListEmpty } from "./list-empty";
import { ListAlerts } from "./list-alerts";
import type { Id } from "@convex/_generated/dataModel";

interface StorageTier {
  _id: string;
  name: string;
  sizeGB: number;
  priceINR: number;
  isActive: boolean;
}

export function StorageTiersList() {
  const storageTiers = useQuery(
    api.functions.storageTiers.queries.listStorageTiers
  );
  const createStorageTier = useMutation(
    api.functions.storageTiers.mutations.createStorageTier
  );
  const updateStorageTier = useMutation(
    api.functions.storageTiers.mutations.updateStorageTier
  );
  const toggleStatusMutation = useMutation(
    api.functions.storageTiers.mutations.toggleStorageTierActive
  );
  const deleteMutation = useMutation(
    api.functions.storageTiers.mutations.deleteStorageTier
  );

  // State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<StorageTier | null>(null);
  const [tierToToggle, setTierToToggle] = useState<{
    id: string;
    current: boolean;
    name: string;
  } | null>(null);
  const [tierToDelete, setTierToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Handlers
  const handleCreate = () => {
    setEditingTier(null);
    setIsDrawerOpen(true);
  };

  const handleEdit = (tier: StorageTier) => {
    setEditingTier(tier);
    setIsDrawerOpen(true);
  };

  const handleSave = async (values: StorageTierFormValues) => {
    try {
      if (editingTier) {
        await updateStorageTier({
          id: editingTier._id as Id<"storageTiers">,
          name: values.name,
          sizeGB: values.sizeGB,
          priceINR: values.priceINR,
          isActive: values.isActive,
        });
        toast.success("Storage tier updated successfully");
      } else {
        await createStorageTier({
          name: values.name,
          sizeGB: values.sizeGB,
          priceINR: values.priceINR,
          isActive: values.isActive,
        });
        toast.success("New storage tier created");
      }
      setIsDrawerOpen(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An error occurred while saving";
      toast.error(message);
    }
  };

  const handleToggleStatusConfirm = async () => {
    if (!tierToToggle) return;
    try {
      await toggleStatusMutation({
        id: tierToToggle.id as Id<"storageTiers">,
        isActive: !tierToToggle.current,
      });
      toast.success(
        `Storage tier ${!tierToToggle.current ? "activated" : "deactivated"}`
      );
      setTierToToggle(null);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!tierToDelete) return;
    try {
      await deleteMutation({ id: tierToDelete.id as Id<"storageTiers"> });
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

  const onToggleRequest = (id: string, current: boolean, name: string) => {
    if (current) {
      // Deactivating requires confirmation
      setTierToToggle({ id, current, name });
    } else {
      // Activating can happen immediately
      toggleStatusMutation({ id: id as Id<"storageTiers">, isActive: true });
      toast.success("Storage tier activated");
    }
  };

  // Loading State
  if (storageTiers === undefined) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-8 md:p-12">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton
            key={i}
            className="h-48 w-full bg-white/5 rounded-xl"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 p-8 md:p-12">
      <ListHeader onCreate={handleCreate} tierCount={storageTiers.length} />

      {storageTiers.length === 0 ? (
        <ListEmpty onCreate={handleCreate} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {storageTiers.map((tier) => (
            <StorageTierCard
              key={tier._id}
              tier={tier}
              onEdit={handleEdit}
              onToggleStatus={onToggleRequest}
              onDelete={(id, name) => setTierToDelete({ id, name })}
            />
          ))}
        </div>
      )}

      <StorageTierDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        onSave={handleSave}
        initialData={editingTier}
      />

      <ListAlerts
        tierToToggle={tierToToggle}
        setTierToToggle={setTierToToggle}
        tierToDelete={tierToDelete}
        setTierToDelete={setTierToDelete}
        onToggleStatus={handleToggleStatusConfirm}
        onDelete={handleDeleteConfirm}
      />
    </div>
  );
}
