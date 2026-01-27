/**
 * Status Machine Utilities
 * 
 * Provides centralized logic for valid project status transitions,
 * phase mappings, and actor assignments.
 */

import { ActionState, ProjectPhase, Role } from "../schema";

// Transition map defining allowed target states for each current state
const VALID_TRANSITIONS: Record<ActionState, ActionState[]> = {
  // Setup Phase
  draft: ["awaiting_quotation", "quotation_sent", "quotation_approved", "cancelled"],
  awaiting_quotation: ["quotation_sent", "cancelled"],
  quotation_sent: ["quotation_approved", "quotation_rejected", "awaiting_quotation", "cancelled"],
  quotation_approved: ["storage_allocated", "cancelled"],
  quotation_rejected: ["awaiting_quotation", "cancelled"],
  storage_allocated: ["awaiting_uploads"],

  // Onboarding Phase
  awaiting_uploads: ["uploads_complete"],
  uploads_complete: ["awaiting_assignment", "assigned"],
  awaiting_assignment: ["assigned"],

  // Production Phase
  assigned: ["work_in_progress"],
  work_in_progress: ["deliverables_ready"],
  deliverables_ready: ["awaiting_review", "work_in_progress"], // QC approve/reject

  // Review Phase
  awaiting_review: ["review_approved", "revisions_requested"],
  revisions_requested: ["deliverables_ready"],
  review_approved: ["preparing_delivery"],

  // Delivery Phase
  preparing_delivery: ["ready_for_delivery"],
  ready_for_delivery: ["delivered"],

  // Terminal States
  delivered: ["completed"],
  completed: ["archived"],
  cancelled: [],
  archived: [],
};

// State to phase mapping for automatic phase updates
const STATE_TO_PHASE: Record<ActionState, ProjectPhase> = {
  draft: "setup",
  awaiting_quotation: "setup",
  quotation_sent: "setup",
  quotation_approved: "setup",
  quotation_rejected: "setup",
  storage_allocated: "setup",
  
  awaiting_uploads: "onboarding",
  uploads_complete: "onboarding",
  awaiting_assignment: "onboarding",
  
  assigned: "production",
  work_in_progress: "production",
  deliverables_ready: "production",
  
  awaiting_review: "review",
  revisions_requested: "review",
  review_approved: "review",
  
  preparing_delivery: "delivery",
  ready_for_delivery: "delivery",
  
  delivered: "completed",
  completed: "completed",
  cancelled: "archived",
  archived: "archived",
};

// Role mapping: who is responsible for the project in this state
const STATE_TO_ACTOR: Record<ActionState, Role> = {
  draft: "studio",
  awaiting_quotation: "admin",
  quotation_sent: "studio",
  quotation_approved: "admin",
  quotation_rejected: "admin",
  storage_allocated: "admin",
  awaiting_uploads: "studio",
  uploads_complete: "admin",
  awaiting_assignment: "admin",
  assigned: "employee",
  work_in_progress: "employee",
  deliverables_ready: "admin",
  awaiting_review: "studio",
  revisions_requested: "employee",
  review_approved: "admin",
  preparing_delivery: "admin",
  ready_for_delivery: "admin",
  delivered: "studio",
  completed: "admin",
  cancelled: "admin",
  archived: "admin",
};

/**
 * Checks if a transition from current state to target state is allowed.
 */
export function canTransition(from: ActionState, to: ActionState): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Gets all valid next states from the current state.
 */
export function getNextStates(current: ActionState): ActionState[] {
  return VALID_TRANSITIONS[current] ?? [];
}

/**
 * Determines the high-level phase for a given granular action state.
 */
export function getPhaseForState(state: ActionState): ProjectPhase {
  return STATE_TO_PHASE[state];
}

/**
 * Determines which role is expected to take action in the given state.
 */
export function getActorForState(state: ActionState): Role {
  return STATE_TO_ACTOR[state];
}
