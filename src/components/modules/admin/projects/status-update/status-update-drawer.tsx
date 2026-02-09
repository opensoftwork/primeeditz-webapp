"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Clock,
  Info,
  Loader2,
  Lock,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { ActionState, getStatusConfig } from "@/lib/status-display";
import { cn } from "@/lib/utils";

interface StatusUpdateDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: Id<"projects">;
  currentStatus: string;
  projectCode: string;
  projectName?: string;
}

export function StatusUpdateDrawer({
  open,
  onOpenChange,
  projectId,
  currentStatus,
  projectCode,
  projectName,
}: StatusUpdateDrawerProps) {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const possibleTransitions = useQuery(
    api.functions.admin.projects.getPossibleTransitions,
    { projectId },
  );

  const transitionProject = useMutation(
    api.functions.projects.mutation.admin.transitionProject,
  );

  const handleUpdate = async () => {
    if (!selectedStatus) return;

    setIsSubmitting(true);
    try {
      await transitionProject({
        projectId,
        newState: selectedStatus as any,
        notes: notes.trim() || undefined,
      });
      toast.success("Project status updated successfully!");
      onOpenChange(false);
      setSelectedStatus(null);
      setNotes("");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update status",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentConfig = getStatusConfig(currentStatus);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="bg-zinc-950/95 border-l border-white/10 w-full sm:max-w-md p-0 overflow-y-auto backdrop-blur-3xl ring-1 ring-white/10"
      >
        <div className="flex flex-col h-full relative z-10">
          {/* Decorative background glow */}
          <div className="absolute top-20 right-0 w-64 h-64 bg-amber-500/10 blur-[100px] pointer-events-none" />

          <SheetHeader className="text-left px-8 pt-12 pb-6 border-b border-white/5 space-y-0">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-inner">
                <Clock className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <SheetTitle className="text-2xl font-black uppercase tracking-tight text-white leading-none">
                  Project Flow
                </SheetTitle>
                <SheetDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mt-2">
                  Transition {projectCode}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 px-8 py-8 space-y-10">
            {/* Project Context */}
            <div className="p-6 rounded-[2rem] bg-gradient-to-br from-white/[0.07] to-white/[0.03] border border-white/10 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

              <div className="relative flex flex-col gap-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.25em]">
                      Active Project
                    </span>
                    <h3 className="text-lg font-bold text-white tracking-tight truncate">
                      {projectName || "Unnamed Project"}
                    </h3>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 shadow-inner shrink-0">
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">
                      {projectCode}
                    </span>
                  </div>
                </div>

                <div className="h-px bg-white/5 w-full" />

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Lock className="h-3 w-3 text-white/20" />
                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.25em]">
                      Current Status
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 px-3 py-1 rounded-full bg-white/[0.03] border border-white/5 shrink-0">
                    <div
                      className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        currentConfig.color.replace("text-", "bg-"),
                      )}
                    />
                    <span
                      className={cn(
                        "text-[10px] font-black uppercase tracking-widest",
                        currentConfig.color,
                      )}
                    >
                      {currentConfig.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Options */}
            <div className="space-y-5">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30 flex items-center gap-2">
                  <Sparkles className="h-3 w-3" />
                  Available Transitions
                </label>
                {possibleTransitions && (
                  <span className="text-[10px] font-bold text-white/20 uppercase">
                    {possibleTransitions.length} Options
                  </span>
                )}
              </div>

              {!possibleTransitions ? (
                <div className="flex items-center justify-center p-12">
                  <Loader2 className="h-6 w-6 text-amber-500 animate-spin opacity-40" />
                </div>
              ) : possibleTransitions.length === 0 ? (
                <div className="p-6 rounded-[2rem] bg-amber-500/5 border border-amber-500/10 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-amber-200 uppercase tracking-tight">
                      Terminal State
                    </p>
                    <p className="text-[10px] text-amber-200/40 uppercase tracking-widest leading-relaxed font-medium">
                      Workflow reached a state with no automated next steps.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-3">
                  {possibleTransitions.map((status: string) => {
                    const config = getStatusConfig(status);
                    const isSelected = selectedStatus === status;

                    return (
                      <button
                        key={status}
                        onClick={() => setSelectedStatus(status)}
                        className={cn(
                          "group relative w-full flex items-center justify-between p-5 rounded-[1.5rem] border transition-all duration-500 overflow-hidden",
                          isSelected
                            ? "bg-white border-white text-black shadow-[0_10px_40px_rgba(255,255,255,0.1)] translate-x-1"
                            : "bg-white/[0.03] border-white/5 text-white/50 hover:border-white/20 hover:bg-white/[0.06] hover:text-white",
                        )}
                      >
                        {isSelected && (
                          <div className="absolute inset-0 bg-white blur-3xl opacity-10 animate-pulse" />
                        )}
                        <div className="relative flex items-center gap-4">
                          <div
                            className={cn(
                              "w-2.5 h-2.5 rounded-full transition-transform duration-500 group-hover:scale-125",
                              isSelected
                                ? "bg-black"
                                : config.color.replace("text-", "bg-"),
                            )}
                          />
                          <span className="text-xs uppercase tracking-[0.15em] font-black">
                            {config.label}
                          </span>
                        </div>
                        <ChevronRight
                          className={cn(
                            "h-5 w-5 transition-all duration-500",
                            isSelected
                              ? "translate-x-0 opacity-100"
                              : "-translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100",
                          )}
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Notes */}
            {selectedStatus && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="flex items-center gap-2 px-1">
                  <MessageSquare className="h-3 w-3 text-white/30" />
                  <label className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30">
                    Transition Notes
                  </label>
                  <span className="text-[10px] font-bold text-white/10 uppercase ml-auto">
                    Optional
                  </span>
                </div>
                <div className="relative group/textarea">
                  <Textarea
                    placeholder="Provide context for this status change..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="bg-white/[0.03] border-white/5 rounded-[1.5rem] text-xs text-white placeholder:text-white/20 focus:border-white/20 focus:bg-white/[0.05] min-h-[140px] transition-all duration-300 resize-none p-5"
                  />
                </div>
                <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-4">
                  <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                  <p className="text-[9px] text-blue-200/40 leading-relaxed uppercase tracking-[0.05em] font-bold">
                    Recorded in status history logs. Internal team visibility
                    only.
                  </p>
                </div>
              </div>
            )}
          </div>

          <SheetFooter className="px-8 py-10 flex-row gap-4 border-t border-white/5 bg-zinc-950/50 backdrop-blur-xl">
            <SheetClose asChild>
              <Button
                variant="ghost"
                className="flex-1 rounded-2xl border border-white/5 h-14 uppercase font-black tracking-[0.2em] text-[10px] hover:bg-white/5 text-white/30 hover:text-white transition-all duration-300"
              >
                Cancel
              </Button>
            </SheetClose>
            <Button
              className={cn(
                "flex-1 rounded-2xl h-14 uppercase font-black tracking-[0.2em] text-[10px] transition-all duration-500 shadow-2xl",
                selectedStatus
                  ? "bg-white text-black hover:bg-zinc-200 shadow-[0_10px_50px_rgba(255,255,255,0.15)]"
                  : "bg-zinc-900 text-zinc-700 cursor-not-allowed border border-white/5",
              )}
              onClick={handleUpdate}
              disabled={!selectedStatus || isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Update Status
                </div>
              )}
            </Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}
