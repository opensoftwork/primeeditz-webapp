"use client";

import { api } from "@convex/_generated/api";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Boxes } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useBreadcrumbStore } from "@/store/breadcrumb-store";
import { DeliveryConfigForm } from "./delivery-config-form";
import type { FieldFormValues } from "./field-drawer";
import {
  DetailAlerts,
  DetailHeader,
  DetailStats,
  FieldDrawer,
  FieldList,
} from "./index";

export function ProjectTypeDetail() {
  const params = useParams();
  const id = params.id as Id<"projectTypes">;

  // Queries & Mutations
  const projectType = useQuery(
    api.functions.projectTypes.queries.getProjectTypeWithFields,
    { projectTypeId: id },
  );
  const createField = useMutation(
    api.functions.projectTypeFields.mutations.createField,
  );
  const updateField = useMutation(
    api.functions.projectTypeFields.mutations.updateField,
  );
  const reorderFields = useMutation(
    api.functions.projectTypeFields.mutations.reorderFields,
  );
  const toggleFieldStatus = useMutation(
    api.functions.projectTypeFields.mutations.toggleFieldActive,
  );
  const hardDeleteField = useMutation(
    api.functions.projectTypeFields.mutations.hardDeleteField,
  );

  // State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingField, setEditingField] =
    useState<Doc<"projectTypeFields"> | null>(null);
  const [localFields, setLocalFields] = useState<Doc<"projectTypeFields">[]>(
    [],
  );
  const [fieldToDeactivate, setFieldToDeactivate] = useState<string | null>(
    null,
  );
  const [fieldToReactivate, setFieldToReactivate] = useState<string | null>(
    null,
  );
  const [fieldToHardDelete, setFieldToHardDelete] = useState<string | null>(
    null,
  );
  const isSyncingOrder = useRef(false);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { setOverride } = useBreadcrumbStore();

  // Sync breadcrumbs and local fields
  useEffect(() => {
    if (projectType?.fields) {
      if (isSyncingOrder.current) {
        // Check if server state matches local order
        const isMatch =
          projectType.fields.length === localFields.length &&
          projectType.fields.every((f, i) => f._id === localFields[i]?._id);
        if (isMatch) {
          isSyncingOrder.current = false;
        }
      } else {
        setLocalFields(projectType.fields);
      }
    }
    if (projectType?.name) setOverride(id, projectType.name);
  }, [id, projectType, localFields, setOverride]);

  // Handlers
  const handleAddField = () => {
    setEditingField(null);
    setIsDrawerOpen(true);
  };

  const handleEditField = (field: Doc<"projectTypeFields">) => {
    setEditingField(field);
    setIsDrawerOpen(true);
  };

  const handleSaveField = async (values: FieldFormValues) => {
    try {
      if (editingField) {
        await updateField({ id: editingField._id, ...values });
        toast.success("Field updated");
      } else {
        await createField({
          projectTypeId: id,
          ...values,
          displayOrder: localFields.length,
        });
        toast.success("Field added");
      }
      setIsDrawerOpen(false);
    } catch (error) {
      toast.error("An error occurred while saving the field");
    }
  };

  const handleReorder = (fields: Doc<"projectTypeFields">[]) => {
    // 1. Update UI immediately
    setLocalFields(fields);
    isSyncingOrder.current = true;

    // 2. Debounce server sync
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);

    syncTimeoutRef.current = setTimeout(async () => {
      try {
        await reorderFields({
          fields: fields.map((f, i) => ({ id: f._id, displayOrder: i })),
        });
      } catch (error) {
        toast.error("Failed to save field order");
        // Revert to server state on error
        if (projectType?.fields) setLocalFields(projectType.fields);
        isSyncingOrder.current = false;
      }
    }, 500);
  };

  const handleToggleStatusRequest = async (id: string, current: boolean) => {
    if (current) setFieldToDeactivate(id);
    else setFieldToReactivate(id);
  };

  const confirmToggleStatus = async () => {
    const fieldId = fieldToDeactivate || fieldToReactivate;
    const isActivating = !!fieldToReactivate;
    if (!fieldId) return;

    try {
      await toggleFieldStatus({
        id: fieldId as Id<"projectTypeFields">,
        isActive: isActivating,
      });
      toast.success(isActivating ? "Field reactivated" : "Field deactivated");
      setFieldToDeactivate(null);
      setFieldToReactivate(null);
    } catch (error) {
      toast.error("Failed to update field status");
    }
  };

  const confirmHardDelete = async () => {
    if (!fieldToHardDelete) return;
    try {
      await hardDeleteField({
        id: fieldToHardDelete as Id<"projectTypeFields">,
      });
      toast.success("Field permanently removed");
      setFieldToHardDelete(null);
    } catch (error) {
      toast.error("Failed to delete field");
    }
  };

  // Loading & Error States
  if (projectType === undefined) {
    return (
      <div className="space-y-8 animate-pulse p-8 md:p-12">
        <Skeleton className="h-10 w-1/3 bg-white/5" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="h-64 bg-white/5 rounded-3xl" />
          <Skeleton className="lg:col-span-2 h-[600px] bg-white/5 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!projectType) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4 p-6">
        <Boxes className="h-12 w-12 text-white/10" />
        <p className="text-white/40 font-medium text-lg">
          Project Type not found
        </p>
        <Button variant="link" asChild className="text-primary">
          <Link href="/settings/project-types">Back to Project Types</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 p-8 md:p-12">
      <DetailHeader
        id={id}
        projectType={projectType}
        onAddField={handleAddField}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <DetailStats
            projectType={projectType}
            fieldCount={localFields.length}
          />
          <DeliveryConfigForm
            projectTypeId={id}
            initialConfig={projectType.deliveryConfig}
          />
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.2em]">
              Form Structure
            </h3>
            <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
              Drag cards to reorder
            </span>
          </div>

          <FieldList
            fields={localFields}
            onEdit={handleEditField}
            onDelete={setFieldToHardDelete}
            onToggleStatus={handleToggleStatusRequest}
            onReorder={handleReorder}
          />
        </div>
      </div>

      <FieldDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        onSave={handleSaveField}
        initialData={editingField}
        projectTypeId={id}
        nextDisplayOrder={localFields.length}
      />

      <DetailAlerts
        fieldToDeactivate={fieldToDeactivate}
        setFieldToDeactivate={setFieldToDeactivate}
        fieldToReactivate={fieldToReactivate}
        setFieldToReactivate={setFieldToReactivate}
        fieldToHardDelete={fieldToHardDelete}
        setFieldToHardDelete={setFieldToHardDelete}
        onConfirmToggleStatus={confirmToggleStatus}
        onConfirmHardDelete={confirmHardDelete}
      />
    </div>
  );
}
