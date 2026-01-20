"use client";

import { motion } from "motion/react";
import { AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminProjectDetail } from "./types";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { toast } from "sonner";

interface AdminActionBannerProps {
  project: AdminProjectDetail;
  onSetIsFolderSetupOpen: (open: boolean) => void;
  onViewFolders: () => void;
}

export function AdminActionBanner({
  project,
  onSetIsFolderSetupOpen,
  onViewFolders,
}: AdminActionBannerProps) {
  const transitionProject = useMutation(
    api.functions.projects.mutations.transitionProject,
  );
  const { awaitingActorRole, actionState } = project;

  if (awaitingActorRole !== "admin") {
    return null;
  }

  const handleTransition = async (newState: string, notes?: string) => {
    try {
      await transitionProject({
        projectId: project._id,
        newState: newState as any,
        notes,
      });
      toast.success(`Project transitioned to ${newState.replace("_", " ")}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Transition failed");
    }
  };

  const action = getAdminAction(actionState, {
    onSetIsFolderSetupOpen,
    onViewFolders,
    handleTransition,
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-5 rounded-2xl bg-primary/10 border border-primary/20 mb-10 overflow-hidden relative group"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -translate-y-32 translate-x-32" />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative">
        <div className="flex items-start gap-4 text-center sm:text-left">
          <div className="p-3 rounded-2xl bg-primary/20 animate-pulse">
            <AlertCircle className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h4 className="text-sm font-black uppercase tracking-tighter text-primary">
              Admin Action Required
            </h4>
            <p className="text-xs font-bold text-white/60 mt-1 uppercase tracking-widest leading-relaxed max-w-md">
              {action.message}
            </p>
          </div>
        </div>

        <Button
          onClick={action.onClick}
          className="rounded-xl bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-widest gap-2 group/btn"
        >
          {action.buttonLabel}
          <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
        </Button>
      </div>
    </motion.div>
  );
}

function getAdminAction(
  state: string,
  handlers: {
    onSetIsFolderSetupOpen: (open: boolean) => void;
    onViewFolders: () => void;
    handleTransition: (newState: string, notes?: string) => Promise<void>;
  },
) {
  const actions: Record<
    string,
    { message: string; buttonLabel: string; onClick: () => void }
  > = {
    awaiting_quotation: {
      message:
        "Client has requested a project. You need to prepare and send a quotation.",
      buttonLabel: "Build Quotation",
      onClick: () => {
        // Redirect or open quotation builder
        toast.info("Quotation builder functionality coming soon in this view");
      },
    },
    quotation_approved: {
      message:
        "Client approved the quotation. Ready to allocate storage and setup folders.",
      buttonLabel: "Setup Project Storage",
      onClick: () => handlers.onSetIsFolderSetupOpen(true),
    },
    storage_allocated: {
      message:
        "Storage is ready. Enable uploads to let the client start uploading files.",
      buttonLabel: "Enable Client Uploads",
      onClick: () =>
        handlers.handleTransition(
          "awaiting_uploads",
          "Admin enabled client uploads",
        ),
    },
    uploads_complete: {
      message:
        "Client marked uploads as complete. Review materials and assign to an employee.",
      buttonLabel: "Assign Employee",
      onClick: () => {
        const el = document.getElementById("system-controls-section");
        el?.scrollIntoView({ behavior: "smooth" });
      },
    },
    deliverables_ready: {
      message:
        "Deliverables are ready for QC. Review and approve to send to the client.",
      buttonLabel: "Review Deliverables",
      onClick: () => handlers.onViewFolders(),
    },
    review_approved: {
      message:
        "Review approved. Prepare final delivery links or physical items.",
      buttonLabel: "Finalize Delivery",
      onClick: () => handlers.handleTransition("preparing_delivery"),
    },
    ready_for_delivery: {
      message:
        "Project is ready for delivery. Mark as delivered once client receives access.",
      buttonLabel: "Mark Delivered",
      onClick: () => handlers.handleTransition("delivered"),
    },
  };

  return (
    actions[state] || {
      message: "Awaiting next administrative step.",
      buttonLabel: "Update Status",
      onClick: () => {},
    }
  );
}
