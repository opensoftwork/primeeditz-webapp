"use client";

import { useMutation } from "convex/react";
import { Receipt, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { DashboardSection } from "./dashboard-section";
import { ShareLinkSection } from "./share-link-section";
import { ValiditySelector } from "./validity-selector";

interface SendQuotationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  quotation: {
    _id: Id<"quotations">;
    code: string;
    total: number;
    studioId?: string;
    studioName?: string;
    status: string;
    shareToken?: string;
  };
}

export function SendQuotationDrawer({
  isOpen,
  onClose,
  quotation,
}: SendQuotationDrawerProps) {
  const [validity, setValidity] = useState("30");
  const [isSending, setIsSending] = useState(false);
  const sendQuotation = useMutation(
    api.functions.quotations.mutations.sendQuotation,
  );

  const handleSend = async () => {
    try {
      setIsSending(true);
      await sendQuotation({
        quotationId: quotation._id,
        validityDays: parseInt(validity),
      });
      toast.success("Quotation marked as sent!");
      // We don't necessarily close here if they want to copy the link too
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send quotation",
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md bg-zinc-950 border-white/5 p-0 overflow-hidden flex flex-col">
        <div className="p-8 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
          <SheetHeader className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-lg shadow-primary/5">
                <Send className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="space-y-1">
              <SheetTitle className="text-2xl font-black text-white uppercase tracking-tighter">
                Send Quotation
              </SheetTitle>
              <SheetDescription className="text-sm font-bold text-white/30 uppercase tracking-widest">
                Deliver to client via dashboard or share link
              </SheetDescription>
            </div>
          </SheetHeader>

          {/* Quotation Summary */}
          <div className="rounded-4xl border border-white/5 bg-white/2 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Receipt className="h-5 w-5 text-white/20" />
                <span className="text-sm font-bold text-white/70">
                  {quotation.code}
                </span>
              </div>
              <span className="text-lg font-black text-white px-3 py-1 bg-white/5 rounded-xl border border-white/5">
                ₹{quotation.total.toLocaleString("en-IN")}
              </span>
            </div>
            {quotation.studioName && (
              <div className="flex items-center gap-2 px-1">
                <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                  Client:
                </span>
                <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">
                  {quotation.studioName}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <ValiditySelector value={validity} onValueChange={setValidity} />

            <div className="space-y-4">
              <DashboardSection
                studioId={quotation.studioId}
                isSent={quotation.status !== "draft"}
                isSending={isSending}
                onSend={handleSend}
              />

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/5" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-[0.3em]">
                  <span className="bg-zinc-950 px-4 text-white/10 italic">
                    OR
                  </span>
                </div>
              </div>

              <ShareLinkSection
                shareToken={quotation.shareToken}
                isGenerating={isSending}
                onGenerate={handleSend}
              />
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="p-8 pt-0 mt-auto">
          <div className="rounded-2xl bg-orange-500/5 border border-orange-500/10 p-4">
            <p className="text-[10px] font-bold text-orange-400/60 leading-relaxed uppercase tracking-widest text-center">
              ⚠️ Sending will lock this quotation for editing
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
