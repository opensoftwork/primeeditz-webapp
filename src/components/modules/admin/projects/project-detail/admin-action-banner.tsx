"use client";

import { api } from "@convex/_generated/api";
import { useMutation } from "convex/react";
import {
  type AlertCircle,
  Archive,
  ArrowRight,
  CheckCircle,
  FileText,
  FolderPlus,
  Package,
  Upload,
  Users,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { getDeliveryPhaseLabel } from "@/lib/status-display";
import type { AdminProjectDetail } from "./types";

interface AdminActionBannerProps {
  project: AdminProjectDetail;
  onSetIsFolderSetupOpen: (open: boolean) => void;
  onViewFolders: () => void;
  onOpenAssignEmployee?: () => void;
}

export function AdminActionBanner({
  project,
  onSetIsFolderSetupOpen,
  onViewFolders,
  onOpenAssignEmployee,
}: AdminActionBannerProps) {
  const router = useRouter();
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    action: () => void;
  } | null>(null);

  const transitionProject = useMutation(
    api.functions.projects.mutations.transitionProject,
  );
  const { awaitingActorRole, actionState } = project;

  // Get delivery label for project-specific messaging
  const deliveryLabel = getDeliveryPhaseLabel(project.deliveryConfig);

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
      toast.success(`Project transitioned to ${newState.replace(/_/g, " ")}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Transition failed");
    }
  };

  const confirmTransition = (
    newState: string,
    title: string,
    description: string,
    notes?: string,
  ) => {
    setConfirmDialog({
      open: true,
      title,
      description,
      action: () => {
        handleTransition(newState, notes);
        setConfirmDialog(null);
      },
    });
  };

  const action = getAdminAction(actionState, {
    project,
    deliveryLabel,
    onSetIsFolderSetupOpen,
    onViewFolders,
    onOpenAssignEmployee,
    handleTransition,
    confirmTransition,
    router,
  });

  if (!action) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-5 rounded-2xl bg-primary/10 border border-primary/20 mb-10 overflow-hidden relative group"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -translate-y-32 translate-x-32" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative">
          <div className="flex items-start gap-4 text-center sm:text-left">
            <div className="p-3 rounded-2xl bg-primary/20 animate-pulse">
              <action.icon className="h-6 w-6 text-primary" />
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

      {/* Confirmation Dialog */}
      <AlertDialog
        open={confirmDialog?.open ?? false}
        onOpenChange={(open) => !open && setConfirmDialog(null)}
      >
        <AlertDialogContent className="bg-zinc-950 border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white font-black uppercase tracking-tight">
              {confirmDialog?.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              {confirmDialog?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDialog?.action}
              className="bg-primary text-black hover:bg-primary/90 font-black uppercase"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

interface ActionHandlers {
  project: AdminProjectDetail;
  deliveryLabel: string;
  onSetIsFolderSetupOpen: (open: boolean) => void;
  onViewFolders: () => void;
  onOpenAssignEmployee?: () => void;
  handleTransition: (newState: string, notes?: string) => Promise<void>;
  confirmTransition: (
    newState: string,
    title: string,
    description: string,
    notes?: string,
  ) => void;
  router: ReturnType<typeof useRouter>;
}

function getAdminAction(state: string, handlers: ActionHandlers) {
  const { project, deliveryLabel, router } = handlers;

  const actions: Record<
    string,
    {
      message: string;
      buttonLabel: string;
      icon: typeof AlertCircle;
      onClick: () => void;
    }
  > = {
    // Setup Phase
    awaiting_quotation: {
      message:
        "Client has requested a project. You need to prepare and send a quotation.",
      buttonLabel: "Build Quotation",
      icon: FileText,
      onClick: () => {
        // Navigate to quotation builder with project context
        router.push(`/quotations/new?projectId=${project._id}`);
      },
    },
    quotation_approved: {
      message:
        "Client approved the quotation. Ready to allocate storage and setup folders.",
      buttonLabel: "Setup Project Storage",
      icon: FolderPlus,
      onClick: () => handlers.onSetIsFolderSetupOpen(true),
    },
    storage_allocated: {
      message:
        "Storage is ready. Enable uploads to let the client start uploading files.",
      buttonLabel: "Enable Client Uploads",
      icon: Upload,
      onClick: () =>
        handlers.confirmTransition(
          "awaiting_uploads",
          "Enable Client Uploads?",
          "This will notify the client that they can start uploading files to their project folders.",
          "Admin enabled client uploads",
        ),
    },

    // Onboarding Phase
    uploads_complete: {
      message:
        "Client marked uploads as complete. Review materials and assign to an employee.",
      buttonLabel: "Assign Employee",
      icon: Users,
      onClick: () => {
        if (handlers.onOpenAssignEmployee) {
          handlers.onOpenAssignEmployee();
        } else {
          // Scroll to system controls if no drawer handler
          const el = document.getElementById("system-controls-section");
          el?.scrollIntoView({ behavior: "smooth" });
          toast.info("Employee assignment coming soon. Check System Controls.");
        }
      },
    },
    awaiting_assignment: {
      message:
        "Project is queued for assignment. Select an employee to begin work.",
      buttonLabel: "Assign Employee",
      icon: Users,
      onClick: () => {
        if (handlers.onOpenAssignEmployee) {
          handlers.onOpenAssignEmployee();
        } else {
          toast.info("Employee assignment feature coming soon.");
        }
      },
    },

    // Production Phase - Admin QC
    deliverables_ready: {
      message:
        "Deliverables are ready for QC. Review and approve to send to the client.",
      buttonLabel: "Review Deliverables",
      icon: CheckCircle,
      onClick: () => handlers.onViewFolders(),
    },

    // Review Phase
    review_approved: {
      message: `Review approved. Prepare ${deliveryLabel.toLowerCase()} for the client.`,
      buttonLabel: `Start ${deliveryLabel}`,
      icon: Package,
      onClick: () =>
        handlers.confirmTransition(
          "preparing_delivery",
          `Begin ${deliveryLabel}?`,
          `This will move the project into the delivery preparation phase. Ensure all final files are ready.`,
        ),
    },

    // Delivery Phase
    preparing_delivery: {
      message: `Currently preparing ${deliveryLabel.toLowerCase()}. Mark as ready when complete.`,
      buttonLabel: "Mark Ready for Delivery",
      icon: Package,
      onClick: () =>
        handlers.confirmTransition(
          "ready_for_delivery",
          "Mark Ready for Delivery?",
          "This indicates all deliverables are packaged and ready for the client.",
        ),
    },
    ready_for_delivery: {
      message:
        "Project is ready for delivery. Mark as delivered once client receives access.",
      buttonLabel: "Mark Delivered",
      icon: CheckCircle,
      onClick: () =>
        handlers.confirmTransition(
          "delivered",
          "Confirm Delivery?",
          "This will notify the client that their project has been delivered and is awaiting their confirmation.",
        ),
    },

    // Terminal States
    completed: {
      message:
        "Project is complete. You can archive it to move it out of active projects.",
      buttonLabel: "Archive Project",
      icon: Archive,
      onClick: () =>
        handlers.confirmTransition(
          "archived",
          "Archive Project?",
          "Archived projects are moved out of active view but remain accessible for reference.",
        ),
    },
    quotation_rejected: {
      message:
        "Client has rejected the quotation. You can revise and resend a new quotation.",
      buttonLabel: "Revise Quotation",
      icon: FileText,
      onClick: () => {
        // Navigate to quotation builder with project context
        router.push(`/quotations/new?projectId=${project._id}`);
      },
    },
    cancelled: {
      message: "This project has been cancelled.",
      buttonLabel: "View Details",
      icon: XCircle,
      onClick: () => {}, // No action, just informational
    },
  };

  return actions[state] || null;
}
