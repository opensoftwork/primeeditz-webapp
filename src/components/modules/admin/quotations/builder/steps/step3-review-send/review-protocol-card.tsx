"use client";

import { motion } from "motion/react";
import { ShieldAlert, Loader2, Send, FileText, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReviewProtocolCardProps {
  grandTotal: number;
  onSendToStudio: () => void;
  onSaveAsDraft: () => void;
  isLoading: boolean;
  isSavingForSend: boolean;
}

// Currency formatter
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export function ReviewProtocolCard({
  grandTotal,
  onSendToStudio,
  onSaveAsDraft,
  isLoading,
  isSavingForSend,
}: ReviewProtocolCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-6 rounded-[2rem] bg-amber-400/5 border border-amber-400/10 space-y-6 overflow-hidden relative"
    >
      {/* Background Decor */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex items-center gap-3 relative z-10">
        <div className="h-10 w-10 rounded-2xl bg-amber-400/10 flex items-center justify-center text-amber-400 border border-amber-400/20">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-tight text-white">
            Final Review
          </h3>
          <p className="text-[10px] font-bold text-amber-400/50 uppercase tracking-widest">
            Protocol Gate
          </p>
        </div>
      </div>

      {/* Prominent High-Value Total */}
      <div className="bg-amber-400/5 p-4 rounded-2xl border border-amber-400/10 relative z-10">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400/40">
            Total Payable
          </span>
          <IndianRupee className="h-3 w-3 text-amber-400/20" />
        </div>
        <div className="text-2xl font-black text-white tracking-tight">
          {formatCurrency(grandTotal)}
        </div>
        <div className="h-1 w-full bg-amber-400/10 rounded-full mt-3 overflow-hidden">
          <motion.div 
             initial={{ width: 0 }}
             animate={{ width: "100%" }}
             transition={{ duration: 1, delay: 0.2 }}
             className="h-full bg-amber-400" 
          />
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        <p className="text-[10px] text-white/40 leading-relaxed font-medium">
          Verify all line items, tax implications, and operational terms. Once approved,
          this document becomes a binding commercial proposal.
        </p>

        {/* Quick Actions */}
        <div className="space-y-2">
          {/* Send to Studio Button */}
          <Button
            onClick={onSendToStudio}
            disabled={isLoading || isSavingForSend}
            className="w-full justify-start h-12 rounded-xl bg-primary text-black font-black uppercase tracking-widest text-[10px] hover:bg-primary/90 transition-all shadow-[0_4px_12px_rgba(var(--primary),0.2)]"
          >
            {isSavingForSend ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Preparing Delivery...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send to Studio
              </>
            )}
          </Button>

          {/* Save as Draft Button */}
          <Button
            onClick={onSaveAsDraft}
            disabled={isLoading || isSavingForSend}
            variant="outline"
            className="w-full justify-start h-12 rounded-xl bg-white/5 border-white/10 text-white font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all"
          >
            {isLoading && !isSavingForSend ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Finalizing...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2 text-white/40" />
                Finalize & Close
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
