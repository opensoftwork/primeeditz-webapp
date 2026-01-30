"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Plus } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
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
import { columns } from "./columns";
import { PackageCard } from "./package-card";
import type { AdminServicePackage } from "./types";

export function ServicePackageList() {
  const router = useRouter();

  // Local state for filters and view
  const [_pageSize, _setPageSize] = useState(15);
  const [statusFilter, _setStatusFilter] = useState<string | undefined>(
    undefined,
  );
  const [categoryFilter, _setCategoryFilter] = useState<string | undefined>(
    undefined,
  );
  const [packageToDelete, setPackageToDelete] = useState<{
    id: Id<"servicePackages">;
    name: string;
  } | null>(null);

  // Convex Hooks
  const categories =
    useQuery(api.functions.projectCategories.queries.getProjectCategories) ||
    [];
  const projectTypes = useQuery(api.functions.projectTypes.queries.list) || [];

  const rawPackages = useQuery(api.functions.servicePackages.queries.list, {
    categoryId:
      categoryFilter === "all"
        ? undefined
        : (categoryFilter as Id<"projectCategories">),
    isActive:
      statusFilter === "all"
        ? undefined
        : statusFilter === "active"
          ? true
          : statusFilter === "inactive"
            ? false
            : undefined,
  });

  // Transform data for the table
  const packages: AdminServicePackage[] = useMemo(() => {
    if (!rawPackages) return [];
    return rawPackages.map((pkg) => ({
      ...pkg,
      categoryName: categories.find((c) => c._id === pkg.categoryId)?.name,
      projectTypeName: projectTypes.find((t) => t._id === pkg.projectTypeId)
        ?.name,
    }));
  }, [rawPackages, categories, projectTypes]);

  const statusOptions = [
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
  ];

  const categoryOptions = useMemo(() => {
    return categories.map((c) => ({
      label: c.name,
      value: c.name,
    }));
  }, [categories]);

  const deletePackage = useMutation(
    api.functions.servicePackages.mutations.deleteServicePackage,
  );

  if (rawPackages === undefined) {
    return (
      <div className="w-full">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-10">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 bg-white/5" />
            <Skeleton className="h-12 w-64 bg-white/5" />
          </div>
          <Skeleton className="h-12 w-48 bg-white/5 rounded-xl" />
        </div>
        <DataTableSkeleton rows={6} columns={6} viewMode="cards" />
      </div>
    );
  }

  const handleCreate = () => {
    router.push("/settings/service-packages/new");
  };

  const handleDelete = async () => {
    if (!packageToDelete) return;
    try {
      await deletePackage({ id: packageToDelete.id });
      toast.success("Package deleted successfully");
      setPackageToDelete(null);
    } catch (_error) {
      toast.error("Failed to delete package");
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">
            ADMINISTRATIVE CONTROL
          </span>
          <h1 className="text-4xl xl:text-5xl font-black uppercase tracking-tighter text-white">
            Service Catalog
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Button
            onClick={handleCreate}
            className="h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[11px] bg-primary text-primary-foreground hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20 gap-2"
          >
            <Plus className="h-4 w-4" />
            CREATE NEW PACKAGE
          </Button>
        </motion.div>
      </div>

      <DataTable
        columns={columns}
        data={packages}
        emptyTitle="No packages found"
        emptyDescription="Start by creating your first service package to populate your catalog."
        renderCard={(pkg) => (
          <PackageCard
            key={pkg._id}
            pkg={pkg}
            onEdit={(id) => router.push(`/settings/service-packages/${id}`)}
            onDelete={(id, name) => setPackageToDelete({ id, name })}
            categoryName={pkg.categoryName}
            projectTypeName={pkg.projectTypeName}
          />
        )}
        defaultView="cards"
        showViewToggle={true}
        toolbar={{
          search: {
            column: "name",
            placeholder: "Search packages...",
          },
          filters: [
            {
              column: "isActive",
              title: "Status",
              options: statusOptions,
            },
            ...(categoryOptions.length > 0
              ? [
                  {
                    column: "categoryName",
                    title: "Category",
                    options: categoryOptions,
                  },
                ]
              : []),
          ],
        }}
      />

      <AlertDialog
        open={!!packageToDelete}
        onOpenChange={(open) => !open && setPackageToDelete(null)}
      >
        <AlertDialogContent className="bg-zinc-950 border-white/10 rounded-3xl p-8">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black text-white uppercase tracking-tighter">
              Verify Deletion
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/40 font-bold uppercase tracking-widest text-[10px]">
              Are you sure you want to remove{" "}
              <span className="text-white">"{packageToDelete?.name}"</span>?
              This action is permanent and cannot be undone.
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
