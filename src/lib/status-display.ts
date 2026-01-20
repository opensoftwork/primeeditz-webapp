/**
 * Status Display Utilities
 * 
 * Provides human-readable labels and colors for the new multi-dimensional
 * project status model (phase + actionState).
 */

export type ProjectPhase = 
  | 'setup' 
  | 'onboarding' 
  | 'production' 
  | 'review' 
  | 'delivery' 
  | 'completed' 
  | 'archived';

export type ActionState = 
  | 'draft'
  | 'awaiting_quotation'
  | 'quotation_sent'
  | 'quotation_approved'
  | 'storage_allocated'
  | 'awaiting_uploads'
  | 'uploads_complete'
  | 'awaiting_assignment'
  | 'assigned'
  | 'work_in_progress'
  | 'deliverables_ready'
  | 'awaiting_review'
  | 'revisions_requested'
  | 'review_approved'
  | 'preparing_delivery'
  | 'ready_for_delivery'
  | 'delivered'
  | 'completed'
  | 'cancelled';

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
    label: "Pending Review",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10 border-amber-500/20",
  },
  quotation_sent: {
    label: "Quote Sent",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10 border-amber-500/20",
  },
  quotation_approved: {
    label: "Quote Approved",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10 border-emerald-500/20",
  },
  storage_allocated: {
    label: "Preparing",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10 border-blue-500/20",
  },
  
  // Onboarding Phase
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
  setup: { label: "Setup", color: "text-blue-400", bgColor: "bg-blue-500/10 border-blue-500/20" },
  onboarding: { label: "Onboarding", color: "text-amber-400", bgColor: "bg-amber-500/10 border-amber-500/20" },
  production: { label: "Production", color: "text-blue-400", bgColor: "bg-blue-500/10 border-blue-500/20" },
  review: { label: "Review", color: "text-purple-400", bgColor: "bg-purple-500/10 border-purple-500/20" },
  delivery: { label: "Delivery", color: "text-emerald-400", bgColor: "bg-emerald-500/10 border-emerald-500/20" },
  completed: { label: "Completed", color: "text-primary", bgColor: "bg-primary/10 border-primary/20" },
  archived: { label: "Archived", color: "text-zinc-500", bgColor: "bg-zinc-500/5 border-zinc-500/10" },
};

export function getStatusConfig(state: string): StatusConfig {
  return ACTION_STATE_CONFIG[state as ActionState] || ACTION_STATE_CONFIG.draft;
}

export function getPhaseConfig(phase: string): StatusConfig {
  return PHASE_CONFIG[phase as ProjectPhase] || PHASE_CONFIG.setup;
}
