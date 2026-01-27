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
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
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
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-zinc-950 border-white/10 max-w-2xl mx-auto">
        <div className="mx-auto w-full max-w-lg">
          <DrawerHeader className="text-left px-6 pt-8">
            <DrawerTitle className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-3">
              <Clock className="h-6 w-6 text-amber-500" />
              Update Project Status
            </DrawerTitle>
            <DrawerDescription className="text-xs font-bold uppercase tracking-widest text-white/40 mt-1">
              Select the next workflow state for {projectCode}
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-6 py-4 space-y-6">
            {/* Project Context */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                  Active Project
                </span>
                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">
                  {projectCode}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white truncate">
                {projectName || "Unnamed Project"}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                  Current Status:
                </span>
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

            {/* Status Options */}
            <div className="space-y-3 font-bold">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2 mb-2">
                Available Transitions
              </label>

              {!possibleTransitions ? (
                <div className="flex items-center justify-center p-8">
                  <Clock className="h-5 w-5 text-white/20 animate-spin" />
                </div>
              ) : possibleTransitions.length === 0 ? (
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-3">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-amber-200">
                      No automatic transitions available.
                    </p>
                    <p className="text-[10px] text-amber-200/60 mt-1 uppercase">
                      This project is in a terminal state or requires manual
                      intervention.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-2">
                  {possibleTransitions.map((status: string) => {
                    const config = getStatusConfig(status);
                    const isSelected = selectedStatus === status;

                    return (
                      <button
                        key={status}
                        onClick={() => setSelectedStatus(status)}
                        className={cn(
                          "w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300",
                          isSelected
                            ? "bg-amber-500 border-amber-400 text-black shadow-lg shadow-amber-500/20"
                            : "bg-white/5 border-white/5 text-white/60 hover:border-white/20 hover:text-white",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "w-2 h-2 rounded-full",
                              isSelected
                                ? "bg-black"
                                : config.color.replace("text-", "bg-"),
                            )}
                          />
                          <span className="text-xs uppercase tracking-widest font-black">
                            {config.label}
                          </span>
                        </div>
                        <ChevronRight
                          className={cn(
                            "h-4 w-4 transition-transform",
                            isSelected ? "rotate-90" : "opacity-0",
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
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                  Audit Log Notes (Optional)
                </label>
                <Textarea
                  placeholder="Reason for status change..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-white/5 border-white/5 rounded-2xl text-xs text-white placeholder:text-white/20 focus:border-amber-500/50 min-h-[100px]"
                />
                <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-3">
                  <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                  <p className="text-[10px] text-blue-200/60 leading-relaxed uppercase tracking-tight font-bold">
                    This note will be recorded in the project's permanent status
                    history and may be visible to clients depending on role
                    settings.
                  </p>
                </div>
              </div>
            )}
          </div>

          <DrawerFooter className="px-6 py-8 flex-row gap-3">
            <DrawerClose asChild>
              <Button
                variant="outline"
                className="flex-1 rounded-2xl border-white/10 h-12 uppercase font-black tracking-widest text-[11px] hover:bg-white/5"
              >
                Cancel
              </Button>
            </DrawerClose>
            <Button
              className="flex-1 rounded-2xl h-12 bg-amber-500 hover:bg-amber-600 text-black uppercase font-black tracking-widest text-[11px] shadow-lg shadow-amber-500/20 disabled:bg-zinc-800 disabled:text-white/20"
              onClick={handleUpdate}
              disabled={!selectedStatus || isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Update Status
                </>
              )}
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function Loader2(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("animate-spin", props.className)}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
