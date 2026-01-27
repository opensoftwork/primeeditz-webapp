"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { AlertCircle, RefreshCw, X, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { QUOTATION_REJECTION_REASONS } from "@/lib/constants/quotation-rejection-reasons";
import { cn } from "@/lib/utils";

interface RejectQuotationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  quotation: {
    _id: Id<"quotations">;
    code: string;
  };
}

export function RejectQuotationDrawer({
  isOpen,
  onClose,
  quotation,
}: RejectQuotationDrawerProps) {
  const [reason, setReason] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const rejectQuotation = useMutation(
    api.functions.quotations.mutations.rejectQuotation,
  );

  const isValid =
    reason.length > 0 && (reason !== "other" || notes.trim().length > 0);

  const handleSubmit = async () => {
    if (!reason) {
      toast.error("Please select a reason for rejection");
      return;
    }

    if (reason === "other" && notes.trim().length === 0) {
      toast.error("Please provide details for 'Other' reason");
      return;
    }

    try {
      setIsSubmitting(true);
      await rejectQuotation({
        quotationId: quotation._id,
        reason:
          QUOTATION_REJECTION_REASONS.find((r) => r.id === reason)?.label ||
          reason,
        notes: notes.trim() || undefined,
      });
      toast.success("Quotation declined");
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to decline quotation",
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
              <div className="h-12 w-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shadow-lg shadow-red-500/5">
                <XCircle className="h-6 w-6 text-red-500" />
              </div>
            </div>
            <div className="space-y-1">
              <SheetTitle className="text-2xl font-black text-white uppercase tracking-tighter">
                Decline Proposal
              </SheetTitle>
              <SheetDescription className="text-sm font-bold text-white/70 uppercase tracking-widest">
                We're sorry to see you go. Help us improve.
              </SheetDescription>
            </div>
          </SheetHeader>

          <div className="space-y-6">
            <div className="space-y-4">
              <Label className="text-[10px] font-black text-white/70 uppercase tracking-[0.3em]">
                Reason for declining
              </Label>
              <RadioGroup
                value={reason}
                onValueChange={setReason}
                className="space-y-3"
              >
                {QUOTATION_REJECTION_REASONS.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => setReason(r.id)}
                    className={cn(
                      "flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer group",
                      reason === r.id
                        ? "bg-red-500/5 border-red-500/20"
                        : "bg-white/2 border-white/5 hover:bg-white/4",
                    )}
                  >
                    <RadioGroupItem
                      value={r.id}
                      className="mt-1 border-white/20 text-red-500"
                    />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-white group-hover:text-white transition-colors">
                        {r.label}
                      </p>
                      <p className="text-[9px] font-medium text-white/50 leading-relaxed uppercase tracking-widest">
                        {r.description}
                      </p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <Label
                  htmlFor="notes"
                  className="text-[10px] font-black text-white/70 uppercase tracking-[0.3em]"
                >
                  Additional Comments
                </Label>
                <span
                  className={cn(
                    "text-[8px] font-black uppercase tracking-widest text-white/20",
                  )}
                >
                  {notes.length} / 300
                </span>
              </div>
              <Textarea
                id="notes"
                placeholder="Optional feedback..."
                value={notes}
                onChange={(e) => setNotes(e.target.value.slice(0, 300))}
                className="min-h-[100px] bg-white/2 border-white/5 rounded-2xl text-sm font-bold text-white focus:bg-white/5 focus:border-red-500/20 transition-all placeholder:text-white/40 resize-none p-4"
              />
              {reason === "other" && notes.length === 0 && (
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
                "w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-2xl",
                isValid
                  ? "bg-red-600 hover:bg-red-700 text-white hover:scale-[1.02] active:scale-95 shadow-red-500/20"
                  : "bg-white/5 border border-white/10 text-white/20",
              )}
            >
              {isSubmitting ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              {isSubmitting ? "Declining..." : "Decline Proposal"}
            </Button>
            <p className="text-[8px] font-black text-center text-white/10 uppercase tracking-widest leading-relaxed">
              This action cannot be undone. Public share links will be
              deactivated.
            </p>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
