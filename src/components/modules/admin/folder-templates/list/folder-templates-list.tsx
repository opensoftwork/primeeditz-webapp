"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useState, useMemo } from "react";
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
import { DataTable, DataTableSkeleton } from "@/components/shared/data-table";
import { getColumns } from "./columns";
import { motion } from "motion/react";
import { Plus } from "lucide-react";

import type { AdminFolderTemplate } from "./types";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function FolderTemplatesList() {
  const router = useRouter();
  const templates = useQuery(api.functions.folderTemplates.queries.list);
  const deleteMutation = useMutation(
    api.functions.folderTemplates.mutations.deleteFolderTemplate,
  );

  // State
  const [templateToDelete, setTemplateToDelete] = useState<{
    id: Id<"folderTemplates">;
    name: string;
  } | null>(null);

  const handleCreate = () => {
    router.push("/settings/folder-templates/new");
  };

  const handleEdit = (id: string) => {
    router.push(`/settings/folder-templates/${id}`);
  };

  const columns = useMemo(
    () =>
      getColumns(
        (t) => handleEdit(t._id),
        (id, name) => {
          setTemplateToDelete({
            id: id as Id<"folderTemplates">,
            name,
          });
        },
      ),
    [handleEdit],
  );

  const handleDelete = async () => {
    if (!templateToDelete) return;
    try {
      await deleteMutation({ id: templateToDelete.id });
      toast.success("Template deleted successfully");
      setTemplateToDelete(null);
    } catch (error) {
      toast.error("Failed to delete template");
    }
  };

  if (templates === undefined) {
    return (
      <div className="flex min-h-[calc(100vh-120px)] w-full flex-col px-8 pt-10 pb-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-12">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 bg-white/5" />
            <Skeleton className="h-12 w-64 bg-white/5" />
          </div>
          <Skeleton className="h-12 w-48 bg-white/5 rounded-xl" />
        </div>
        <DataTableSkeleton
          rows={6}
          columns={4}
          viewMode="cards"
          renderCardSkeleton={() => (
            <div className="bg-white/2 border border-white/5 p-6 rounded-3xl space-y-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-xl bg-white/5" />
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-20 bg-white/5" />
                    <Skeleton className="h-3 w-12 bg-white/5" />
                  </div>
                </div>
                <Skeleton className="h-8 w-8 rounded-lg bg-white/5" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-6 w-3/4 bg-white/5" />
                <Skeleton className="h-3 w-1/2 bg-white/5" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-2 w-20 bg-white/5" />
                  <Skeleton className="h-2 w-12 bg-white/5" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-20 rounded-xl bg-white/5" />
                  <Skeleton className="h-8 w-24 rounded-xl bg-white/5" />
                  <Skeleton className="h-8 w-16 rounded-xl bg-white/5" />
                </div>
              </div>
              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <Skeleton className="h-4 w-24 bg-white/5" />
                <Skeleton className="h-8 w-24 rounded-lg bg-white/5" />
              </div>
            </div>
          )}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-120px)] w-full flex-col px-8 pt-10 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-12">
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
        className="flex-1"
        columns={columns}
        data={(templates as any) || []}
        emptyTitle="No folder templates found"
        emptyDescription="Define your folder structures once and reuse them across all projects."
        renderCard={(template) => (
          <FolderTemplateCard
            key={template._id}
            template={template as any}
            onView={(t) => handleEdit(t._id)}
            onConfigure={(t) => handleEdit(t._id)}
            onDelete={(id, name) => {
              setTemplateToDelete({
                id: id as Id<"folderTemplates">,
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

      <AlertDialog
        open={!!templateToDelete}
        onOpenChange={(open) => !open && setTemplateToDelete(null)}
      >
        <AlertDialogContent className="bg-zinc-950 border-white/10 rounded-3xl p-8">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black text-white uppercase tracking-tighter">
              Verify Deletion
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/40 font-bold uppercase tracking-widest text-[10px]">
              Are you sure you want to remove{" "}
              <span className="text-white">"{templateToDelete?.name}"</span>?
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
