"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

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
import { ProjectTypeCard } from "./project-type-card";
import type { AdminProjectType } from "./types";

export function ProjectTypeList() {
  const router = useRouter();
  const projectTypes = useQuery(
    api.functions.projectTypes.queries.getProjectTypes,
  );
  const categories =
    useQuery(api.functions.projectCategories.queries.getProjectCategories) ||
    [];

  const deleteMutation = useMutation(
    api.functions.projectTypes.mutations.deleteProjectType,
  );

  // State
  const [typeToDelete, setTypeToDelete] = useState<{
    id: Id<"projectTypes">;
    name: string;
  } | null>(null);

  // Transform data
  const data: AdminProjectType[] = useMemo(() => {
    if (!projectTypes) return [];
    return projectTypes.map((type) => ({
      ...type,
      categoryName: categories.find((c) => c._id === type.categoryId)?.name,
    }));
  }, [projectTypes, categories]);

  const handleView = (id: string) => {
    router.push(`/settings/project-types/${id}`);
  };

  const handleConfigure = (id: string) => {
    router.push(`/settings/project-types/${id}/edit`);
  };

  const columns = useMemo(
    () =>
      getColumns((type) => {
        handleView(type._id);
      }),
    [router],
  );

  const categoryOptions = useMemo(() => {
    return categories.map((c) => ({
      label: c.name,
      value: c.name,
    }));
  }, [categories]);

  // Handlers
  const handleCreate = () => {
    router.push("/settings/project-types/new");
  };

  const handleDelete = async () => {
    if (!typeToDelete) return;
    try {
      await deleteMutation({ id: typeToDelete.id });
      toast.success("Project type deleted permanently");
      setTypeToDelete(null);
    } catch (_error) {
      toast.error("Failed to delete project type");
    }
  };

  // Loading State
  if (projectTypes === undefined) {
    return (
      <div className="w-full px-6 pt-6">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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
    <div className="w-full px-6 pt-6">
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">
            ADMINISTRATIVE CONTROL
          </span>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-white xl:text-5xl">
            Project Engine
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
            DEFINE PROJECT TYPE
          </Button>
        </motion.div>
      </div>

      <DataTable
        columns={columns}
        data={data}
        emptyTitle="No project types defined"
        emptyDescription="Set up your project types and delivery workflows to get started."
        renderCard={(type) => (
          <ProjectTypeCard
            key={type._id}
            type={type}
            onView={(vType) => handleView(vType._id)}
            onConfigure={(cType) => handleConfigure(cType._id)}
            onDelete={async (id) => {
              setTypeToDelete({
                id: id as Id<"projectTypes">,
                name: type.name,
              });
            }}
          />
        )}
        defaultView="cards"
        showViewToggle={true}
        toolbar={{
          search: {
            column: "name",
            placeholder: "Search project types...",
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
        open={!!typeToDelete}
        onOpenChange={(open) => !open && setTypeToDelete(null)}
      >
        <AlertDialogContent className="bg-zinc-950 border-white/10 rounded-3xl p-8">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black text-white uppercase tracking-tighter">
              Verify Deletion
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/40 font-bold uppercase tracking-widest text-[10px]">
              Are you sure you want to remove{" "}
              <span className="text-white">"{typeToDelete?.name}"</span>? This
              will also impact any service packages using this project type.
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
