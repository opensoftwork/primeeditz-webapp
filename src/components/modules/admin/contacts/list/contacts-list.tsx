"use client";

import { useMemo, useState } from "react";
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
import { ContactCard } from "./contact-card";

export function ContactsList() {
  const router = useRouter();
  // @ts-ignore
  const contacts = useQuery(api.functions.contacts.queries.listContacts);
  const deleteMutation = useMutation(
    api.functions.contacts.mutations.deleteContact,
  );

  const [itemToDelete, setItemToDelete] = useState<{
    id: Id<"contacts">;
    name: string;
  } | null>(null);

  const handleView = (id: string) => {
    router.push(`/contacts/${id}`);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteMutation({ id: itemToDelete.id });
      toast.success("Contact deleted successfully");
      setItemToDelete(null);
    } catch (error) {
      toast.error("Failed to delete contact");
    }
  };

  if (contacts === undefined) {
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
            Contacts
          </h1>
        </div>
      </motion.div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={contacts}
        emptyTitle="No contacts found"
        emptyDescription="Contact submissions from external forms will appear here."
        renderCard={(item) => (
          <ContactCard
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
            placeholder: "Search contacts...",
          },
          filters: [
            {
              column: "service",
              title: "Service",
              options: [], // Will be auto-populated from data
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
            <AlertDialogTitle>Delete Contact</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the submission from{" "}
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
