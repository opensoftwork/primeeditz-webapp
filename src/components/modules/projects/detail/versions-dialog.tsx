"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface ClientVersionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (notes: string) => Promise<void>;
}

export function ClientVersionDialog({
  open,
  onOpenChange,
  onSubmit,
}: ClientVersionDialogProps) {
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!notes.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit(notes);
      setNotes("");
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-zinc-950 border-white/10 rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase tracking-tight text-white">
            Request Version
          </DialogTitle>
          <DialogDescription className="text-xs font-bold text-white/40 uppercase tracking-widest">
            Please describe the changes you'd like to see. Our team will review
            your feedback and update the deliverables.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="E.g. The color grading in the intro needs to be warmer..."
            className="min-h-[150px] bg-white/5 border-white/10 rounded-2xl focus:ring-amber-500/20 focus:border-amber-500/50 text-white placeholder:text-white/20"
          />
        </div>

        <DialogFooter className="gap-3 sm:justify-end">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="rounded-xl text-white/40 hover:text-white hover:bg-white/5 font-black uppercase tracking-widest text-[10px]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!notes.trim() || isSubmitting}
            className="rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black uppercase tracking-widest text-[10px] px-8 shadow-lg shadow-amber-600/20"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Version Request"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
