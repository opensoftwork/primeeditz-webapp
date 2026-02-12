"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { AlertCircle, MessageSquare, RefreshCw, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { QUOTATION_CHANGE_REASONS } from "@/lib/constants/quotation-change-reasons";
import { cn } from "@/lib/utils";

interface RequestChangesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  quotation: {
    _id: Id<"quotations">;
    code: string;
  };
}

export function RequestChangesDrawer({
  isOpen,
  onClose,
  quotation,
}: RequestChangesDrawerProps) {
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const requestChanges = useMutation(
    api.functions.quotations.mutations.requestQuotationChanges,
  );

  const toggleReason = (id: string) => {
    setSelectedReasons((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id],
    );
  };

  const isValid =
    selectedReasons.length > 0 &&
    (!selectedReasons.includes("other") || notes.trim().length > 0);

  const handleSubmit = async () => {
    if (selectedReasons.length === 0) {
      toast.error("Please select at least one reason");
      return;
    }

    if (selectedReasons.includes("other") && notes.trim().length === 0) {
      toast.error("Please provide details for 'Other' reason");
      return;
    }

    try {
      setIsSubmitting(true);
      await requestChanges({
        quotationId: quotation._id,
        reasons: selectedReasons,
        notes: notes.trim() || undefined,
      });
      toast.success("Change request submitted!");
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to submit request",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md bg-zinc-950 border-white/5 p-0 overflow-hidden flex flex-col">
        <div className="p-8 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
          <SheetHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-lg shadow-indigo-500/5">
                <MessageSquare className="h-6 w-6 text-indigo-400" />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-xl bg-white/5 border border-white/5 text-white/40 hover:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-1">
              <SheetTitle className="text-2xl font-black text-white uppercase tracking-tighter">
                Request Changes
              </SheetTitle>
              <SheetDescription className="text-sm font-bold text-white/50 uppercase tracking-widest">
                Tell us what needs adjustment in {quotation.code}
              </SheetDescription>
            </div>
          </SheetHeader>

          <div className="space-y-6">
            <div className="space-y-4">
              <Label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">
                Reason(s) for change
              </Label>
              <div className="space-y-3">
                {QUOTATION_CHANGE_REASONS.map((reason) => (
                  <div
                    key={reason.id}
                    onClick={() => toggleReason(reason.id)}
                    className={cn(
                      "flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer group",
                      selectedReasons.includes(reason.id)
                        ? "bg-indigo-500/5 border-indigo-500/20"
                        : "bg-white/2 border-white/5 hover:bg-white/4",
                    )}
                  >
                    <Checkbox
                      checked={selectedReasons.includes(reason.id)}
                      onCheckedChange={() => toggleReason(reason.id)}
                      className="mt-1 border-white/20 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                    />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-white group-hover:text-white transition-colors">
                        {reason.label}
                      </p>
                      <p className="text-[9px] font-medium text-white/50 leading-relaxed uppercase tracking-widest">
                        {reason.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <Label
                  htmlFor="notes"
                  className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]"
                >
                  Additional Notes
                </Label>
                <span
                  className={cn(
                    "text-[8px] font-black uppercase tracking-widest",
                    notes.length > 450 ? "text-red-400" : "text-white/20",
                  )}
                >
                  {notes.length} / 500
                </span>
              </div>
              <Textarea
                id="notes"
                placeholder="Please describe the changes you'd like to see..."
                value={notes}
                onChange={(e) => setNotes(e.target.value.slice(0, 500))}
                className="min-h-[120px] bg-white/2 border-white/5 rounded-2xl text-sm font-bold text-white focus:bg-white/5 focus:border-primary/20 transition-all placeholder:text-white/10 resize-none p-4"
              />
              {selectedReasons.includes("other") && notes.length === 0 && (
                <div className="flex items-center gap-2 text-red-400/60 mt-2 px-1">
                  <AlertCircle className="h-3 w-3" />
                  <span className="text-[8px] font-black uppercase tracking-widest">
                    Required for 'Other' reason
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <SheetFooter className="p-8 pt-4 border-t border-white/5 bg-zinc-950/80 backdrop-blur-xl">
          <div className="flex flex-col w-full gap-4">
            <Button
              onClick={handleSubmit}
              disabled={!isValid || isSubmitting}
              className={cn(
                "w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-2xl shadow-indigo-500/5",
                isValid
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-[1.02] active:scale-95 shadow-indigo-500/20"
                  : "bg-white/5 border border-white/10 text-white/20",
              )}
            >
              {isSubmitting ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <MessageSquare className="h-4 w-4 mr-2" />
              )}
              {isSubmitting ? "Submitting..." : "Submit Change Request"}
            </Button>
            <p className="text-[8px] font-black text-center text-white/10 uppercase tracking-widest leading-relaxed">
              This will notify the studio. Admin will revise and update the
              proposal.
            </p>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
