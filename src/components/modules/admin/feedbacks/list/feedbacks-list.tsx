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
import { FeedbackCard } from "./feedback-card";

export function FeedbacksList() {
  const router = useRouter();
  const feedbacks = useQuery(api.functions.feedbacks.queries.listFeedbacks);
  const deleteMutation = useMutation(
    api.functions.feedbacks.mutations.deleteFeedback,
  );

  const [itemToDelete, setItemToDelete] = useState<{
    id: Id<"feedbacks">;
    name: string;
  } | null>(null);

  const handleView = (id: string) => {
    router.push(`/feedbacks/${id}`);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteMutation({ id: itemToDelete.id });
      toast.success("Feedback deleted successfully");
      setItemToDelete(null);
    } catch (error) {
      toast.error("Failed to delete feedback");
    }
  };

  if (feedbacks === undefined) {
    return (
      <div className="w-full px-6 pt-6">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 bg-white/5" />
            <Skeleton className="h-12 w-64 bg-white/5" />
          </div>
        </div>
        <DataTableSkeleton rows={6} columns={4} viewMode="cards" />
      </div>
    );
  }

  return (
    <div className="w-full px-6 pt-6">
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
            Feedbacks
          </h1>
        </div>
      </motion.div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={feedbacks}
        emptyTitle="No feedbacks found"
        emptyDescription="Feedback submissions from external forms will appear here."
        renderCard={(item) => (
          <FeedbackCard
            key={item._id}
            item={item}
            onView={() => handleView(item._id)}
            onDelete={() => setItemToDelete({ id: item._id, name: item.name })}
          />
        )}
        defaultView="cards"
        showViewToggle={true}
        toolbar={{
          search: {
            column: "name",
            placeholder: "Search feedbacks...",
          },
          filters: [
            {
              column: "rating",
              title: "Rating",
              options: [
                { label: "5 Stars", value: "5" },
                { label: "4 Stars", value: "4" },
                { label: "3 Stars", value: "3" },
                { label: "2 Stars", value: "2" },
                { label: "1 Star", value: "1" },
              ],
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
            <AlertDialogTitle>Delete Feedback</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the feedback from{" "}
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
