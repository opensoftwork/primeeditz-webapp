"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface RevisionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  revisionNotes: string;
  onNotesChange: (notes: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function RevisionDialog({
  open,
  onOpenChange,
  revisionNotes,
  onNotesChange,
  onSubmit,
  isSubmitting,
}: RevisionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white">Request Revision</DialogTitle>
          <DialogDescription className="text-white/60">
            Provide feedback for the employee. They will be notified and
            assigned to rework this deliverable.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            placeholder="Describe what needs to be changed..."
            value={revisionNotes}
            onChange={(e) => onNotesChange(e.target.value)}
            className="min-h-[120px] bg-white/5 border-white/10 text-white placeholder:text-white/30"
          />
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isSubmitting || !revisionNotes.trim()}
            className="bg-red-600 hover:bg-red-500"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Request Revision
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
