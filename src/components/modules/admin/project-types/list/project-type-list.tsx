"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { ListAlerts, ListContent, ListEmpty, ListHeader } from "./index";
import {
  ProjectTypeDrawer,
  type ProjectTypeFormValues,
} from "./project-type-drawer";

export function ProjectTypeList() {
  const projectTypes = useQuery(
    api.functions.projectTypes.queries.getProjectTypes,
  );
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
  const [editingType, setEditingType] = useState<any>(null);
  const [typeToToggle, setTypeToToggle] = useState<{
    id: string;
    current: boolean;
  } | null>(null);
  const [typeToDelete, setTypeToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Handlers
  const handleCreate = () => {
    setEditingType(null);
    setIsDrawerOpen(true);
  };

  const handleEdit = (type: any) => {
    setEditingType(type);
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

  const handleToggleStatusConfirm = async () => {
    if (!typeToToggle) return;
    try {
      await toggleStatusMutation({
        id: typeToToggle.id as Id<"projectTypes">,
        isActive: !typeToToggle.current,
      });
      toast.success(
        `Project type ${!typeToToggle.current ? "activated" : "deactivated"}`,
      );
      setTypeToToggle(null);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!typeToDelete) return;
    try {
      await deleteMutation({ id: typeToDelete.id as Id<"projectTypes"> });
      toast.success("Project type deleted permanently");
      setTypeToDelete(null);
    } catch (error) {
      toast.error("Failed to delete project type");
    }
  };

  const onToggleRequest = (id: string, current: boolean) => {
    if (current) {
      setTypeToToggle({ id, current });
    } else {
      toggleStatusMutation({ id: id as Id<"projectTypes">, isActive: true });
      toast.success("Project type activated");
    }
  };

  // Loading State
  if (projectTypes === undefined) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-8 md:p-12">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton
            key={i}
            className="h-40 w-full bg-white/5 rounded-[1.25rem]"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 p-8 md:p-12">
      <ListHeader onCreate={handleCreate} />

      {projectTypes.length === 0 ? (
        <ListEmpty onCreate={handleCreate} />
      ) : (
        <ListContent
          projectTypes={projectTypes}
          onEdit={handleEdit}
          onToggleStatus={onToggleRequest}
          onDeleteRequest={(id, name) => setTypeToDelete({ id, name })}
        />
      )}

      <ProjectTypeDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        onSave={handleSave}
        initialData={editingType}
      />

      <ListAlerts
        typeToToggle={typeToToggle}
        setTypeToToggle={setTypeToToggle}
        typeToDelete={typeToDelete}
        setTypeToDelete={setTypeToDelete}
        onToggleStatus={handleToggleStatusConfirm}
        onDelete={handleDeleteConfirm}
      />
    </div>
  );
}
