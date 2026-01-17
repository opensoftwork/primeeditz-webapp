"use client";

import { LayoutDashboard, CheckCircle2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DashboardSectionProps {
  clientId?: string;
  isSent: boolean;
  isSending: boolean;
  onSend: () => void;
}

export function DashboardSection({
  clientId,
  isSent,
  isSending,
  onSend,
}: DashboardSectionProps) {
  return (
    <div className="space-y-4 rounded-[2rem] border border-white/5 bg-white/2 p-6 transition-all hover:bg-white/4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <LayoutDashboard className="h-5 w-5 text-blue-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">
              Client Dashboard
            </span>
            <span className="text-sm font-bold text-white/70">
              Primary delivery channel
            </span>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <div className="rounded-2xl bg-blue-500/5 border border-blue-500/10 p-4 mb-4">
          <p className="text-xs font-bold text-blue-400/80 leading-relaxed">
            {clientId
              ? "This quotation will automatically appear in the client's dashboard for review and approval."
              : "Warning: No client linked to this quotation. It will not appear in any dashboard."}
          </p>
        </div>

        <Button
          onClick={onSend}
          disabled={isSending || !clientId}
          className={cn(
            "w-full h-12 rounded-2xl font-black uppercase tracking-widest transition-all",
            isSent
              ? "bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20"
              : "bg-blue-600 hover:bg-blue-700 text-white",
          )}
        >
          {isSending ? (
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          ) : isSent ? (
            <CheckCircle2 className="h-4 w-4 mr-2" />
          ) : null}
          {isSent ? "Resend to Dashboard" : "Mark as Sent to Dashboard"}
        </Button>
      </div>
    </div>
  );
}
