---
id: 5a-2
title: Status Transition Utilities
epic: 05a-project-status-workflow
status: done
priority: high
points: 5
assignee: null
dependencies:
  - 5a-1
created: 2026-01-19
updated: 2026-01-19
---

# Story 5A.2: Status Transition Utilities

## User Story

**As a** Developer,
**I want** centralized utility functions for status transitions,
**So that** all status changes are validated and consistent across the codebase.

## Background

Status transitions must follow a defined state machine. Invalid transitions should be rejected server-side. All transitions should be logged to status history.

## Acceptance Criteria

### AC-1: State Machine Definition

**Given** the project lifecycle
**When** the state machine is defined
**Then** valid transitions must be documented:

```typescript
// Simplified transition map
const VALID_TRANSITIONS: Record<ActionState, ActionState[]> = {
  // Setup Phase
  draft: ["awaiting_quotation", "cancelled"],
  awaiting_quotation: ["quotation_sent", "cancelled"],
  quotation_sent: ["quotation_approved", "awaiting_quotation", "cancelled"],
  quotation_approved: ["storage_allocated", "cancelled"],
  storage_allocated: ["awaiting_uploads"],

  // Onboarding Phase
  awaiting_uploads: ["uploads_complete"],
  uploads_complete: ["awaiting_assignment"],
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

  // Terminal
  delivered: ["completed"],
  completed: ["archived"],
  cancelled: [],
};
```

### AC-2: canTransition Function

**Given** a project in a specific actionState
**When** `canTransition(currentState, targetState)` is called
**Then** it must return `boolean` indicating if transition is valid.

```typescript
// Usage
canTransition("draft", "awaiting_quotation"); // true
canTransition("draft", "work_in_progress"); // false
```

### AC-3: getNextStates Function

**Given** a project in a specific actionState
**When** `getNextStates(currentState)` is called
**Then** it must return an array of valid next states.

```typescript
// Usage
getNextStates("quotation_sent"); // ['quotation_approved', 'awaiting_quotation', 'cancelled']
```

### AC-4: getActorForState Function

**Given** an actionState
**When** `getActorForState(state)` is called
**Then** it must return the role that needs to act.

```typescript
// Usage
getActorForState("draft"); // 'client'
getActorForState("awaiting_quotation"); // 'admin'
getActorForState("assigned"); // 'employee'
```

### AC-5: transitionProject Mutation

**Given** a valid transition request
**When** `transitionProject(projectId, newState, notes?)` is called
**Then**:

- Validate the transition is allowed
- Update `actionState` to new value
- Update `phase` if crossing phase boundary
- Update `awaitingActorRole` based on new state
- Create status history entry
- Return success

**Given** an invalid transition request
**When** `transitionProject()` is called
**Then**:

- Throw error: "Invalid transition from [current] to [target]"
- No changes made to project

### AC-6: Phase Auto-Update

**Given** a state transition
**When** the new state belongs to a different phase
**Then** the `phase` field must automatically update.

```typescript
// Phase mapping
const STATE_TO_PHASE: Record<ActionState, Phase> = {
  draft: "setup",
  awaiting_quotation: "setup",
  quotation_sent: "setup",
  quotation_approved: "setup",
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
};
```

## Technical Design

### Files to Create/Modify

```
convex/
├── lib/
│   └── status-machine.ts        # NEW: State machine utilities
└── functions/
    └── projects/
        └── mutations.ts         # Add transitionProject mutation
```

### status-machine.ts

```typescript
// convex/lib/status-machine.ts

import { ActionState, Phase, Role } from "../schema";

// Transition map
const VALID_TRANSITIONS: Record<ActionState, ActionState[]> = {
  // ... as defined above
};

// State to phase mapping
const STATE_TO_PHASE: Record<ActionState, Phase> = {
  // ... as defined above
};

// State to actor mapping
const STATE_TO_ACTOR: Record<ActionState, Role> = {
  draft: "client",
  awaiting_quotation: "admin",
  quotation_sent: "client",
  quotation_approved: "admin",
  storage_allocated: "admin",
  awaiting_uploads: "client",
  uploads_complete: "admin",
  awaiting_assignment: "admin",
  assigned: "employee",
  work_in_progress: "employee",
  deliverables_ready: "admin",
  awaiting_review: "client",
  revisions_requested: "employee",
  review_approved: "admin",
  preparing_delivery: "admin",
  ready_for_delivery: "admin",
  delivered: "client",
  completed: "admin",
  cancelled: "admin",
};

export function canTransition(from: ActionState, to: ActionState): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function getNextStates(current: ActionState): ActionState[] {
  return VALID_TRANSITIONS[current] ?? [];
}

export function getPhaseForState(state: ActionState): Phase {
  return STATE_TO_PHASE[state];
}

export function getActorForState(state: ActionState): Role {
  return STATE_TO_ACTOR[state];
}
```

### transitionProject Mutation

```typescript
// In convex/functions/projects/mutations.ts

export const transitionProject = mutation({
  args: {
    projectId: v.id('projects'),
    newState: projectActionStateValidator,
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error('Project not found');

    const currentState = project.actionState;

    // Validate transition
    if (!canTransition(currentState, args.newState)) {
      throw new Error(`Invalid transition from ${currentState} to ${args.newState}`);
    }

    // Get new phase and actor
    const newPhase = getPhaseForState(args.newState);
    const newActor = getActorForState(args.newState);

    // Update project
    await ctx.db.patch(args.projectId, {
      actionState: args.newState,
      phase: newPhase,
      awaitingActorRole: newActor,
      updatedAt: Date.now(),
    });

    // Create history entry
    await ctx.db.insert('statusHistory', {
      projectId: args.projectId,
      previousPhase: project.phase,
      newPhase: newPhase,
      previousActionState: currentState,
      newActionState: args.newState,
      previousAwaitingActorRole: project.awaitingActorRole,
      newAwaitingActorRole: newActor,
      changedBy: /* current user profile ID */,
      changedAt: Date.now(),
      notes: args.notes,
    });

    return { success: true };
  },
});
```

## Definition of Done

- [ ] `status-machine.ts` created with all utility functions
- [ ] `transitionProject` mutation implemented
- [ ] Invalid transitions throw errors
- [ ] Status history entries created on transition
- [ ] Phase auto-updates on phase boundary crossings
- [ ] TypeScript compiles without errors
- [ ] Unit tests for state machine logic

## Estimated Effort

- State machine implementation: 2 hours
- Mutation implementation: 2 hours
- Testing: 1 hour
- **Total: ~5 hours**

## Notes

- This is a core utility used by many other stories
- Consider creating convenience mutations for common transitions (e.g., `approveQuotation`, `markUploadsComplete`)
