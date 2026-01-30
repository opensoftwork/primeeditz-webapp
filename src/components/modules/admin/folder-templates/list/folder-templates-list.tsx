"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { FolderTemplateCard } from "./folder-template-card";
import { ListEmpty } from "./list-empty";
import { ListHeader } from "./list-header";

import type { FolderLevel1 } from "@convex/schema";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface FolderTemplate {
  _id: string;
  _creationTime: number;
  name: string;
  folders: FolderLevel1[];
  projectTypeId: Id<"projectTypes">;
  projectTypeName: string;
  variant?: string;
  description?: string;
  isDefault?: boolean;
  isActive: boolean;
}

export function FolderTemplatesList() {
  const router = useRouter();
  const templates = useQuery(api.functions.folderTemplates.queries.list);

  const handleCreate = () => {
    router.push("/settings/folder-templates/new");
  };

  const handleEdit = (id: string) => {
    router.push(`/settings/folder-templates/${id}`);
  };

  if (templates === undefined) {
    return (
      <div className="w-full">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-10">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 bg-white/5" />
            <Skeleton className="h-12 w-64 bg-white/5" />
          </div>
          <Skeleton className="h-12 w-48 bg-white/5 rounded-xl" />
        </div>
        <DataTableSkeleton rows={6} columns={4} />
      </div>
    );
  }

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
            Template Vault
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
            CREATE NEW TEMPLATE
          </Button>
        </motion.div>
      </div>

      <DataTable
        columns={columns}
        data={(templates as any) || []}
        emptyTitle="No folder templates found"
        emptyDescription="Define your folder structures once and reuse them across all projects."
        renderCard={(template) => (
          <FolderTemplateCard
            key={template._id}
            template={template as any}
            onEdit={(t) => handleEdit(t._id)}
            onDelete={() => {
              // Handled in template-actions
            }}
          />
        )}
        defaultView="table"
        showViewToggle={true}
        toolbar={{
          search: {
            column: "name",
            placeholder: "Search templates...",
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
    </div>
  );
}
