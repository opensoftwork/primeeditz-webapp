"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

import { DataTable, DataTableSkeleton } from "@/components/shared/data-table";
import { Skeleton } from "@/components/ui/skeleton";
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

import { columns } from "./columns";
import { SurveyCard } from "./survey-card";

export function SurveysList() {
  const router = useRouter();
  const surveys = useQuery(api.functions.surveys.queries.listSurveys);
  const deleteMutation = useMutation(
    api.functions.surveys.mutations.deleteSurvey,
  );

  const [itemToDelete, setItemToDelete] = useState<{
    id: Id<"surveys">;
    name: string;
  } | null>(null);

  const handleView = (id: string) => {
    router.push(`/surveys/${id}`);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteMutation({ id: itemToDelete.id });
      toast.success("Survey deleted successfully");
      setItemToDelete(null);
    } catch (error) {
      toast.error("Failed to delete survey");
    }
  };

  if (surveys === undefined) {
    return (
      <div className="w-full px-6 pt-6">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 bg-white/5" />
            <Skeleton className="h-12 w-64 bg-white/5" />
          </div>
        </div>
        <DataTableSkeleton rows={6} columns={5} viewMode="table" />
      </div>
    );
  }

  return (
    <div className="w-full px-6 pt-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      >
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">
            FORM SUBMISSIONS
          </span>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-white xl:text-5xl">
            Surveys
          </h1>
        </div>
      </motion.div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={surveys}
        emptyTitle="No surveys found"
        emptyDescription="Survey submissions from external forms will appear here."
        renderCard={(item) => (
          <SurveyCard
            key={item._id}
            item={item}
            onView={() => handleView(item._id)}
            onDelete={() => setItemToDelete({ id: item._id, name: item.name })}
          />
        )}
        defaultView="table"
        showViewToggle={true}
        toolbar={{
          search: {
            column: "name",
            placeholder: "Search surveys...",
          },
          filters: [
            {
              column: "q1_role",
              title: "Role",
              options: [], // Auto-populated
            },
          ],
        }}
      />

      {/* Delete Dialog */}
      <AlertDialog
        open={!!itemToDelete}
        onOpenChange={(open) => !open && setItemToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Survey</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the survey from{" "}
              <strong>{itemToDelete?.name}</strong>? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
