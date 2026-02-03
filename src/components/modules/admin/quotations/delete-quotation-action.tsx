"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { Trash2 } from "lucide-react";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DeleteQuotationActionProps {
  quotationId: Id<"quotations">;
  quotationCode: string;
  className?: string;
  children?: React.ReactNode;
}

export function DeleteQuotationAction({
  quotationId,
  quotationCode,
  className,
  children,
}: DeleteQuotationActionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteQuotation = useMutation(
    api.functions.quotations.mutations.deleteQuotation,
  );

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteQuotation({ quotationId });
      toast.success(`Quotation ${quotationCode} has been deleted.`);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to delete quotation:", error);
      toast.error("Failed to delete quotation. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {children ? (
        <span
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(true);
          }}
          className="cursor-pointer"
        >
          {children}
        </span>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(true);
          }}
          className={cn(
            "h-8 w-8 p-0 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all",
            className,
          )}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent className="bg-zinc-900 border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white font-black uppercase tracking-widest">
              Delete Quotation
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/40 font-medium">
              Are you sure you want to delete quotation{" "}
              <span className="text-white font-bold">{quotationCode}</span>?
              This action will mark the quotation as rejected and log the
              deletion.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={(e) => e.stopPropagation()}
              className="bg-transparent border-white/10 text-white hover:bg-white/5 uppercase text-[10px] font-black tracking-widest"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDelete();
              }}
              disabled={isDeleting}
              className="bg-red-500 text-white hover:bg-red-600 uppercase text-[10px] font-black tracking-widest"
            >
              {isDeleting ? "Deleting..." : "Delete Quotation"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
