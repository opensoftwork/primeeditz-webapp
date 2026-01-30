"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { DataTable, DataTableSkeleton } from "@/components/shared/data-table";
import { ProjectTypeCard } from "./project-type-card";
import { getColumns } from "./columns";
import type { AdminProjectType } from "./types";
import {
  ProjectTypeDrawer,
  type ProjectTypeFormValues,
} from "./project-type-drawer";

export function ProjectTypeList() {
  const router = useRouter();
  const projectTypes = useQuery(
    api.functions.projectTypes.queries.getProjectTypes,
  );
  const categories =
    useQuery(api.functions.projectCategories.queries.getProjectCategories) ||
    [];

  const createProjectType = useMutation(
    api.functions.projectTypes.mutations.createProjectType,
  );
  const updateProjectType = useMutation(
    api.functions.projectTypes.mutations.updateProjectType,
  );
  const toggleStatusMutation = useMutation(
    api.functions.projectTypes.mutations.toggleProjectTypeActive,
  );
  const deleteMutation = useMutation(
    api.functions.projectTypes.mutations.deleteProjectType,
  );

  // State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingType, setEditingType] = useState<AdminProjectType | null>(null);

  // Transform data
  const data: AdminProjectType[] = useMemo(() => {
    if (!projectTypes) return [];
    return projectTypes.map((type) => ({
      ...type,
      categoryName: categories.find((c) => c._id === type.categoryId)?.name,
    }));
  }, [projectTypes, categories]);

  const columns = useMemo(
    () =>
      getColumns((type) => {
        setEditingType(type);
        setIsDrawerOpen(true);
      }),
    [],
  );

  const categoryOptions = useMemo(() => {
    return categories.map((c) => ({
      label: c.name,
      value: c.name,
    }));
  }, [categories]);

  // Handlers
  const handleCreate = () => {
    setEditingType(null);
    setIsDrawerOpen(true);
  };

  const handleSave = async (values: ProjectTypeFormValues) => {
    try {
      if (editingType) {
        await updateProjectType({
          id: editingType._id as Id<"projectTypes">,
          name: values.name,
          description: values.description,
          icon: values.icon,
          categoryId: values.categoryId as Id<"projectCategories">,
          isActive: values.isActive,
        });
        toast.success("Project type updated successfully");
      } else {
        await createProjectType({
          name: values.name,
          description: values.description,
          icon: values.icon,
          categoryId: values.categoryId as Id<"projectCategories">,
          isActive: values.isActive,
        });
        toast.success("New project type created");
      }
      setIsDrawerOpen(false);
    } catch (error) {
      toast.error("An error occurred while saving");
    }
  };

  // Loading State
  if (projectTypes === undefined) {
    return (
      <div className="w-full">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 bg-white/5" />
            <Skeleton className="h-12 w-64 bg-white/5" />
          </div>
          <Skeleton className="h-12 w-48 rounded-xl bg-white/5" />
        </div>
        <DataTableSkeleton rows={6} columns={4} />
      </div>
    );
  }

  return (
    <div className="w-full">
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
            onEdit={(type) => {
              setEditingType(type);
              setIsDrawerOpen(true);
            }}
            onToggleStatus={async (id, current) => {
              await toggleStatusMutation({
                id: id as Id<"projectTypes">,
                isActive: !current,
              });
              toast.success(
                `Project type ${!current ? "activated" : "deactivated"}`,
              );
            }}
            onDelete={async (id) => {
              // Note: handled in project-actions for consistency
            }}
          />
        )}
        defaultView="table"
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

      <ProjectTypeDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        onSave={handleSave}
        initialData={editingType}
      />
    </div>
  );
}
