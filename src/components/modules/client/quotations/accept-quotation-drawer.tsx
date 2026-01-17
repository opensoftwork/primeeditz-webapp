"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CheckCircle2, ShieldCheck, X, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface AcceptQuotationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  quotation: {
    _id: Id<"quotations">;
    code: string;
    total: number;
    validUntil?: number;
  };
}

export function AcceptQuotationDrawer({
  isOpen,
  onClose,
  quotation,
}: AcceptQuotationDrawerProps) {
  const [agreed, setAgreed] = useState(false);
  const [signature, setSignature] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const acceptQuotation = useMutation(
    api.functions.quotations.mutations.acceptQuotation,
  );

  const handleConfirm = async () => {
    if (!agreed) {
      toast.error("Please agree to the terms and conditions");
      return;
    }

    try {
      setIsSubmitting(true);
      await acceptQuotation({
        quotationId: quotation._id,
        clientSignature: signature || undefined,
      });
      toast.success("Quotation accepted successfully!");
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to accept quotation",
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
              <div className="h-12 w-12 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shadow-lg shadow-green-500/5">
                <CheckCircle2 className="h-6 w-6 text-green-400" />
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
                Accept Quotation
              </SheetTitle>
              <SheetDescription className="text-sm font-bold text-white/30 uppercase tracking-widest">
                Confirm your agreement to proceed
              </SheetDescription>
            </div>
          </SheetHeader>

          {/* Quotation Summary Card */}
          <div className="rounded-[2rem] border border-white/5 bg-white/2 p-6 space-y-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
              <ShieldCheck className="h-24 w-24 rotate-12" />
            </div>
            <div className="flex justify-between items-start relative z-10">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">
                  Reference No.
                </span>
                <p className="text-lg font-black text-white tracking-tight">
                  {quotation.code}
                </p>
              </div>
              <div className="text-right space-y-1">
                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">
                  Total Amount
                </span>
                <p className="text-lg font-black text-primary tracking-tight">
                  ₹{quotation.total.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>

          {/* Terms & Conditions Agreement */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">
                Confirmation Details
              </h4>

              <div
                onClick={() => setAgreed(!agreed)}
                className={cn(
                  "flex items-start gap-3 p-4 rounded-2xl border transition-all cursor-pointer",
                  agreed
                    ? "bg-green-500/5 border-green-500/20"
                    : "bg-white/2 border-white/5 hover:bg-white/4",
                )}
              >
                <Checkbox
                  id="terms"
                  checked={agreed}
                  onCheckedChange={(checked) => setAgreed(checked as boolean)}
                  className="mt-0.5 border-white/20 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                />
                <div className="space-y-1">
                  <Label
                    htmlFor="terms"
                    className="text-xs font-bold text-white/80 cursor-pointer"
                  >
                    I agree to the Terms and Conditions
                  </Label>
                  <p className="text-[9px] font-medium text-white/30 leading-relaxed uppercase tracking-widest">
                    Acknowledging scope, pricing, and project timeline as stated
                    in proposal.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="signature"
                className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]"
              >
                Digital Signature (Optional)
              </Label>
              <Input
                id="signature"
                placeholder="Type your full name"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                className="h-12 bg-white/2 border-white/5 rounded-2xl text-sm font-bold text-white focus:bg-white/5 focus:border-primary/20 transition-all placeholder:text-white/10"
              />
              <p className="text-[8px] font-medium text-white/20 uppercase tracking-widest px-1">
                Typed name acts as a digital signature for this acceptance.
              </p>
            </div>
          </div>
        </div>

        <SheetFooter className="p-8 pt-4 border-t border-white/5 bg-zinc-950/80 backdrop-blur-xl">
          <div className="flex flex-col w-full gap-4">
            <Button
              onClick={handleConfirm}
              disabled={!agreed || isSubmitting}
              className={cn(
                "w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-2xl",
                agreed
                  ? "bg-primary hover:bg-primary/90 text-zinc-950 shadow-primary/20 hover:scale-[1.02] active:scale-95"
                  : "bg-white/5 border border-white/10 text-white/20",
              )}
            >
              {isSubmitting ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              {isSubmitting ? "Processing..." : "Confirm Acceptance"}
            </Button>
            <p className="text-[8px] font-black text-center text-white/10 uppercase tracking-widest leading-relaxed">
              Confirming will lock this quotation and notify the studio
            </p>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
