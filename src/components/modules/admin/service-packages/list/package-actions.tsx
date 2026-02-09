"use client";

import { api } from "@convex/_generated/api";
import { useMutation } from "convex/react";
import { Copy, Pencil, Power, Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { cn } from "@/lib/utils";
import type { AdminServicePackage } from "./types";

interface PackageActionsProps {
  pkg: AdminServicePackage;
}

export function PackageActions({ pkg }: PackageActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const toggleActive = useMutation(
    api.functions.servicePackages.mutations.toggleActive,
  );
  const duplicatePackage = useMutation(
    api.functions.servicePackages.mutations.duplicate,
  );
  const deletePackage = useMutation(
    api.functions.servicePackages.mutations.deleteServicePackage,
  );

  const handleToggleActive = async () => {
    setIsLoading(true);
    try {
      await toggleActive({ id: pkg._id, isActive: !pkg.isActive });
      toast.success(pkg.isActive ? "Package deactivated" : "Package activated");
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuplicate = async () => {
    setIsLoading(true);
    try {
      const newId = await duplicatePackage({ id: pkg._id });
      toast.success("Package duplicated successfully");
      router.push(`/settings/service-packages/${newId}`);
    } catch (error) {
      toast.error("Failed to duplicate package");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deletePackage({ id: pkg._id });
      toast.success("Package deleted successfully");
      setShowDeleteDialog(false);
    } catch (error) {
      toast.error("Failed to delete package");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={() => router.push(`/settings/service-packages/${pkg._id}`)}
          className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors"
          title="Edit Package"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={handleDuplicate}
          disabled={isLoading}
          className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors disabled:opacity-50"
          title="Duplicate Package"
        >
          <Copy className="h-4 w-4" />
        </button>
        <button
          onClick={handleToggleActive}
          disabled={isLoading}
          className={cn(
            "p-2 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50",
            pkg.isActive
              ? "text-green-500/40 hover:text-red-400"
              : "text-white/20 hover:text-green-400",
          )}
          title={pkg.isActive ? "Deactivate Package" : "Activate Package"}
        >
          <Power className="h-4 w-4" />
        </button>
        <button
          onClick={() => setShowDeleteDialog(true)}
          disabled={isLoading}
          className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-red-400 transition-colors disabled:opacity-50"
          title="Delete Package"
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
              <span className="text-white">"{pkg.name}"</span>? This action is
              permanent and cannot be undone.
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
