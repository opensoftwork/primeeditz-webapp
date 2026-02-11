/**
 * Status Display Utilities
 *
 * Provides human-readable labels and colors for the new multi-dimensional
 * project status model (phase + actionState).
 */

export type ProjectPhase =
  | "setup"
  | "onboarding"
  | "production"
  | "review"
  | "delivery"
  | "completed"
  | "archived";

export type ActionState =
  | "draft"
  | "awaiting_quotation"
  | "quotation_sent"
  | "quotation_approved"
  | "quotation_rejected"
  | "storage_allocated"
  | "awaiting_onboarding"
  | "awaiting_uploads"
  | "uploads_complete"
  | "awaiting_assignment"
  | "assigned"
  | "work_in_progress"
  | "deliverables_ready"
  | "awaiting_review"
  | "revisions_requested"
  | "review_approved"
  | "preparing_delivery"
  | "ready_for_delivery"
  | "delivered"
  | "completed"
  | "cancelled";

export interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
}

export const ACTION_STATE_CONFIG: Record<ActionState, StatusConfig> = {
  // Setup Phase
  draft: {
    label: "Draft",
    color: "text-zinc-400",
    bgColor: "bg-zinc-500/10 border-zinc-500/20",
  },
  awaiting_quotation: {
    label: "Preparing Quote",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10 border-amber-500/20",
  },
  quotation_sent: {
    label: "Quote Sent",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10 border-blue-500/20",
  },
  quotation_approved: {
    label: "Quote Approved",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10 border-emerald-500/20",
  },
  quotation_rejected: {
    label: "Quote Rejected",
    color: "text-red-400",
    bgColor: "bg-red-500/10 border-red-500/20",
  },
  storage_allocated: {
    label: "Preparing",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10 border-blue-500/20",
  },

  // Onboarding Phase
  awaiting_onboarding: {
    label: "Awaiting Onboarding",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10 border-amber-500/20",
  },
  awaiting_uploads: {
    label: "Ready to Upload",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10 border-amber-500/20",
  },
  uploads_complete: {
    label: "Processing",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10 border-blue-500/20",
  },
  awaiting_assignment: {
    label: "Queued",
    color: "text-zinc-400",
    bgColor: "bg-zinc-500/10 border-zinc-500/20",
  },

  // Production Phase
  assigned: {
    label: "Assigned",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10 border-blue-500/20",
  },
  work_in_progress: {
    label: "In Progress",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10 border-blue-500/20",
  },
  deliverables_ready: {
    label: "Quality Check",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10 border-purple-500/20",
  },

  // Review Phase
  awaiting_review: {
    label: "Needs Review",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10 border-amber-500/20",
  },
  revisions_requested: {
    label: "Revisions",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10 border-amber-500/20",
  },
  review_approved: {
    label: "Approved",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10 border-emerald-500/20",
  },

  // Delivery Phase
  preparing_delivery: {
    label: "Preparing Delivery",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10 border-blue-500/20",
  },
  ready_for_delivery: {
    label: "Ready for Delivery",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10 border-emerald-500/20",
  },

  // Terminal States
  delivered: {
    label: "Delivered",
    color: "text-primary",
    bgColor: "bg-primary/10 border-primary/20",
  },
  completed: {
    label: "Completed",
    color: "text-primary",
    bgColor: "bg-primary/10 border-primary/20",
  },
  cancelled: {
    label: "Cancelled",
    color: "text-zinc-500",
    bgColor: "bg-zinc-500/5 border-zinc-500/10",
  },
};

export const PHASE_CONFIG: Record<ProjectPhase, StatusConfig> = {
  setup: {
    label: "Setup",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10 border-blue-500/20",
  },
  onboarding: {
    label: "Onboarding",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10 border-amber-500/20",
  },
  production: {
    label: "Production",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10 border-blue-500/20",
  },
  review: {
    label: "Review",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10 border-purple-500/20",
  },
  delivery: {
    label: "Delivery",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10 border-emerald-500/20",
  },
  completed: {
    label: "Completed",
    color: "text-primary",
    bgColor: "bg-primary/10 border-primary/20",
  },
  archived: {
    label: "Archived",
    color: "text-zinc-500",
    bgColor: "bg-zinc-500/5 border-zinc-500/10",
  },
};

export function getStatusConfig(
  state: string,
  deliveryLabel?: string,
): StatusConfig {
  const config =
    ACTION_STATE_CONFIG[state as ActionState] || ACTION_STATE_CONFIG.draft;

  // Override label for preparing_delivery if project-specific label exists
  if (state === "preparing_delivery" && deliveryLabel) {
    return {
      ...config,
      label: deliveryLabel,
    };
  }

  return config;
}

export interface ClientStatusDisplay {
  label: string;
  description: string;
  color: string;
  isActionNeeded: boolean;
  cta?: {
    label: string;
    href: (projectId: string) => string;
  };
}

export const CLIENT_STATUS_MAP: Record<ActionState, ClientStatusDisplay> = {
  draft: {
    label: "Draft",
    description: "Complete your project request",
    color: "text-zinc-400",
    isActionNeeded: true,
    cta: {
      label: "Continue Request",
      href: (id) => `/projects/wizard?projectId=${id}`,
    },
  },
  awaiting_quotation: {
    label: "Preparing Quote",
    description: "Our team is reviewing your request",
    color: "text-blue-400",
    isActionNeeded: false,
  },
  quotation_sent: {
    label: "Quotation Sent",
    description: "Review and approve your quotation",
    color: "text-blue-400",
    isActionNeeded: true,
    cta: { label: "View Quotation", href: (id) => `/projects/${id}/quotation` },
  },
  quotation_approved: {
    label: "Preparing",
    description: "We're setting up your project",
    color: "text-emerald-400",
    isActionNeeded: false,
  },
  quotation_rejected: {
    label: "Quote Rejected",
    description: "Quotation declined or rejected",
    color: "text-red-400",
    isActionNeeded: true,
  },
  storage_allocated: {
    label: "Preparing",
    description: "Almost ready for your files",
    color: "text-blue-400",
    isActionNeeded: false,
  },
  awaiting_onboarding: {
    label: "Complete Onboarding",
    description: "Complete project setup to begin uploading",
    color: "text-amber-400",
    isActionNeeded: true,
    cta: { label: "Complete Onboarding", href: (id) => `/projects/${id}/onboarding` },
  },
  awaiting_uploads: {
    label: "Upload Files",
    description: "We're ready for your photos/videos",
    color: "text-primary",
    isActionNeeded: true,
    cta: { label: "Upload Files", href: (id) => `/projects/${id}` },
  },
  uploads_complete: {
    label: "Processing",
    description: "We've received your files",
    color: "text-blue-400",
    isActionNeeded: false,
  },
  awaiting_assignment: {
    label: "Processing",
    description: "Assigning your project",
    color: "text-zinc-400",
    isActionNeeded: false,
  },
  assigned: {
    label: "In Production",
    description: "Work has started on your project",
    color: "text-blue-400",
    isActionNeeded: false,
  },
  work_in_progress: {
    label: "In Production",
    description: "Our team is working on your project",
    color: "text-blue-400",
    isActionNeeded: false,
  },
  deliverables_ready: {
    label: "Quality Check",
    description: "Reviewing your deliverables",
    color: "text-purple-400",
    isActionNeeded: false,
  },
  awaiting_review: {
    label: "Review Ready",
    description: "Your deliverables are ready for review",
    color: "text-amber-400",
    isActionNeeded: true,
    cta: {
      label: "Review Deliverables",
      href: (id) => `/projects/${id}/review`,
    }, // Hypothetical review page
  },
  revisions_requested: {
    label: "Making Changes",
    description: "Working on your requested changes",
    color: "text-amber-400",
    isActionNeeded: false,
  },
  review_approved: {
    label: "Approved",
    description: "Preparing for delivery",
    color: "text-emerald-400",
    isActionNeeded: false,
  },
  preparing_delivery: {
    label: "Preparing Delivery",
    description: "Finalizing your files",
    color: "text-blue-400",
    isActionNeeded: false,
  },
  ready_for_delivery: {
    label: "Ready",
    description: "Your project is ready for delivery",
    color: "text-emerald-400",
    isActionNeeded: false,
  },
  delivered: {
    label: "Delivered",
    description: "Confirm receipt of your project",
    color: "text-primary",
    isActionNeeded: true,
  },
  completed: {
    label: "Complete",
    description: "Project completed successfully!",
    color: "text-primary",
    isActionNeeded: false,
  },
  cancelled: {
    label: "Cancelled",
    description: "This project was cancelled",
    color: "text-zinc-500",
    isActionNeeded: false,
  },
};

export function getClientStatusDisplay(state: string): ClientStatusDisplay {
  return (
    CLIENT_STATUS_MAP[state as ActionState] || {
      label: state.replace("_", " "),
      description: "",
      color: "text-zinc-400",
      isActionNeeded: false,
    }
  );
}

export function getPhaseConfig(phase: string): StatusConfig {
  return PHASE_CONFIG[phase as ProjectPhase] || PHASE_CONFIG.setup;
}

export function getDeliveryPhaseLabel(deliveryConfig?: {
  hasPhysicalDelivery: boolean;
  physicalDeliveryLabel?: string;
  hasDigitalDelivery: boolean;
  digitalDeliveryLabel?: string;
}): string {
  if (!deliveryConfig) return "Preparing Delivery";

  const labels: string[] = [];

  if (deliveryConfig.hasPhysicalDelivery) {
    labels.push(deliveryConfig.physicalDeliveryLabel || "Physical Delivery");
  }
  if (deliveryConfig.hasDigitalDelivery) {
    labels.push(deliveryConfig.digitalDeliveryLabel || "Digital Delivery");
  }

  return labels.join(" & ") || "Preparing Delivery";
}
