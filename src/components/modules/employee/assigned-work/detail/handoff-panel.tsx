"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation } from "convex/react";
import {
  ArrowRightLeft,
  CheckCircle2,
  Lock,
  Send,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface HandoffPanelProps {
  project: any;
  isLead: boolean;
}

export function HandoffPanel({ project, isLead }: HandoffPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const recordHandoff = useMutation(api.admin.recordHandoff);

  const { squad, actionState } = project;

  // Determine next possible states based on current state
  const getNextStates = () => {
    switch (actionState) {
      case "assigned":
        return [{ value: "work_in_progress", label: "Start Production" }];
      case "work_in_progress":
        return [{ value: "deliverables_ready", label: "Submit for QC" }];
      case "deliverables_ready":
        return [{ value: "awaiting_review", label: "Push to Client Review" }];
      case "versions_requested":
        return [{ value: "work_in_progress", label: "Resume Versions" }];
      default:
        return [];
    }
  };

  const nextStates = getNextStates();

  const handleHandoff = async (toState: string) => {
    setIsSubmitting(true);
    try {
      await recordHandoff({
        projectId: project._id,
        toState: toState as any,
        toProfileId: selectedMember
          ? (selectedMember as Id<"profiles">)
          : undefined,
        notes: notes || `Workflow transitioned by squad member.`,
      });
      toast.success(`Project transitioned to ${toState.replace(/_/g, " ")}`);
      setIsExpanded(false);
      setNotes("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Handoff failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (nextStates.length === 0) {
    return (
      <div className="p-6 rounded-4xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-black uppercase text-emerald-500/80 tracking-tight">
              Active Duty Logged
            </h4>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">
              Current stage is tracking successfully. No handoffs required.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "p-8 rounded-[2.5rem] bg-indigo-500/10 border border-indigo-500/20 transition-all duration-500 relative overflow-hidden",
          isExpanded
            ? "ring-2 ring-indigo-500/30 ring-offset-4 ring-offset-zinc-950"
            : "",
        )}
      >
        <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/5 blur-[80px]" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 animate-pulse">
              <ArrowRightLeft className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-black uppercase text-indigo-400 tracking-tighter">
                Baton Pass System
              </h4>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">
                Formalize the next production stage
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            {nextStates.map((state) => (
              <Button
                key={state.value}
                onClick={() => setIsExpanded(true)}
                className="rounded-2xl h-12 bg-white text-black font-black uppercase tracking-widest gap-2 hover:bg-white/90"
              >
                <Send className="h-3.5 w-3.5" />
                {state.label}
              </Button>
            ))}
          </div>
        </div>

        {isExpanded && (
          <div className="mt-10 pt-10 border-t border-indigo-500/10 space-y-8 animate-in slide-in-from-top-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1 text-[9px] font-black uppercase tracking-widest text-white/40 font-mono">
                  <UserPlus className="h-3 w-3" />
                  <span>Delegate Next Action (Optional)</span>
                </div>
                <Select
                  value={selectedMember}
                  onValueChange={setSelectedMember}
                >
                  <SelectTrigger className="h-12 bg-zinc-950 border-white/10 rounded-xl text-[10px] uppercase font-bold tracking-widest">
                    <SelectValue placeholder="KEEP CURRENT ASSIGNMENT" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-white/10">
                    <SelectItem
                      value="none"
                      className="text-[10px] uppercase font-bold tracking-widest"
                    >
                      Keep current
                    </SelectItem>
                    {squad.map((m: any) => (
                      <SelectItem
                        key={m.profile._id}
                        value={m.profile._id}
                        className="text-[10px] uppercase font-bold tracking-widest"
                      >
                        {m.profile.name} ({m.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1 text-[9px] font-black uppercase tracking-widest text-white/40 font-mono">
                  <Lock className="h-3 w-3" />
                  <span>Handoff Notes & Locking Log</span>
                </div>
                <Textarea
                  placeholder="ENTER PRODUCTION NOTES FOR THE NEXT STAGE..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-zinc-950 border-white/10 rounded-xl min-h-[48px] text-[10px] uppercase font-bold tracking-widest p-4 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="ghost"
                onClick={() => setIsExpanded(false)}
                className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleHandoff(nextStates[0].value)}
                disabled={isSubmitting}
                className="h-12 px-10 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/30"
              >
                {isSubmitting ? "PROCESSING..." : "CONFIRM HANDOFF"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
