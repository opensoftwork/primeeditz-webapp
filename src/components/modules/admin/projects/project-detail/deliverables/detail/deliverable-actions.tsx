"use client";

import { CheckCircle, Loader2, RotateCcw, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DeliverableActionsProps {
  canApprove: boolean;
  canRequestVersion: boolean;
  canSendToStudio: boolean;
  isSubmitting: boolean;
  status?: string;
  onApprove: () => void;
  onRequestVersion: () => void;
  onSendToStudio: () => void;
}

export function DeliverableActions({
  canApprove,
  canRequestVersion,
  canSendToStudio,
  isSubmitting,
  status,
  onApprove,
  onRequestVersion,
  onSendToStudio,
}: DeliverableActionsProps) {
  const showVersions = canRequestVersion && status !== "approved";

  return (
    <div className="pt-6 border-t border-white/5 space-y-3">
      {/* Send to Studio */}
      {canSendToStudio && (
        <Button
          className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-600/20 gap-2"
          onClick={onSendToStudio}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          Send To Studio
        </Button>
      )}

      {/* Approve / Versions */}
      <div
        className={cn(
          "grid gap-3",
          showVersions ? "grid-cols-2" : "grid-cols-1",
        )}
      >
        {canApprove && (
          <Button
            variant="outline"
            className="rounded-xl border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 font-bold uppercase tracking-wider text-[10px] h-10"
            onClick={onApprove}
            disabled={!canApprove || isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                Approve
              </>
            )}
          </Button>
        )}

        {showVersions && (
          <Button
            variant="outline"
            className="rounded-xl border-red-500/20 text-red-400 hover:bg-red-500/10 font-bold uppercase tracking-wider text-[10px] h-10"
            onClick={onRequestVersion}
            disabled={!canRequestVersion || isSubmitting}
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            Versions
          </Button>
        )}
      </div>
    </div>
  );
}
