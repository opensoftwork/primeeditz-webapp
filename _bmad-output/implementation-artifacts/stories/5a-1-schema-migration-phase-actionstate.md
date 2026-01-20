---
id: 5a-1
title: Schema Migration - Phase + ActionState Model
epic: 05a-project-status-workflow
status: done
priority: critical
points: 8
assignee: null
dependencies: []
created: 2026-01-19
updated: 2026-01-19
---

# Story 5A.1: Schema Migration - Phase + ActionState Model

## User Story

**As a** System,
**I want** the projects table to have distinct `phase` and `actionState` fields with proper validators,
**So that** the system can track both the high-level project stage and the granular workflow state.

## Background

The current project status model uses a single `status` field with 6 values:

- `draft`, `pending_review`, `active`, `in_progress`, `completed`, `archived`

This is insufficient to represent the complex 9-stage business workflow and doesn't indicate WHO needs to act next.

## Acceptance Criteria

### AC-1: Schema Fields Added

**Given** the current `projects` table with a single `status` field
**When** the schema migration is applied
**Then** the following fields must be added to the `projects` table:

```typescript
// New fields
phase: projectPhaseValidator,           // Required
actionState: projectActionStateValidator, // Required
awaitingActorRole: v.optional(roleValidator), // client | admin | employee
awaitingActorId: v.optional(v.id('profiles')), // Specific person
```

### AC-2: Phase Validator

**Given** the need for high-level project phases
**When** the schema is defined
**Then** `projectPhaseValidator` must include:

```typescript
export const projectPhaseValidator = v.union(
  v.literal("setup"), // Project creation and quotation
  v.literal("onboarding"), // Asset upload and preparation
  v.literal("production"), // Employee work on deliverables
  v.literal("review"), // Client/Admin review cycle
  v.literal("delivery"), // Final delivery preparation
  v.literal("completed"), // Project finished
  v.literal("archived"), // Historical record
);
```

### AC-3: ActionState Validator

**Given** the need for granular workflow states
**When** the schema is defined
**Then** `projectActionStateValidator` must include all 18 states:

```typescript
export const projectActionStateValidator = v.union(
  // Setup Phase
  v.literal("draft"),
  v.literal("awaiting_quotation"),
  v.literal("quotation_sent"),
  v.literal("quotation_approved"),
  v.literal("storage_allocated"),

  // Onboarding Phase
  v.literal("awaiting_uploads"),
  v.literal("uploads_complete"),
  v.literal("awaiting_assignment"),

  // Production Phase
  v.literal("assigned"),
  v.literal("work_in_progress"),
  v.literal("deliverables_ready"),

  // Review Phase
  v.literal("awaiting_review"),
  v.literal("revisions_requested"),
  v.literal("review_approved"),

  // Delivery Phase
  v.literal("preparing_delivery"),
  v.literal("ready_for_delivery"),

  // Terminal States
  v.literal("delivered"),
  v.literal("completed"),
  v.literal("cancelled"),
);
```

### AC-4: Legacy Status Field Removed

**Given** we are in development with no production data
**When** the schema is updated
**Then** the legacy `status` field must be removed from projects table.
**And** all references to `projectStatusValidator` must be updated.

### AC-5: Indexes Created

**Given** performance requirements for status queries
**When** the schema is defined
**Then** indexes must be created:

- `by_phase` - for phase-based queries
- `by_actionState` - for action state queries
- `by_awaitingActorRole` - for actor-based filtering

### AC-6: TypeScript Types Exported

**Given** the need for type safety across the codebase
**When** the schema is updated
**Then** validators must be exported from `convex/schema.ts`
**And** corresponding TypeScript types must be inferable.

## Technical Design

### Files to Modify

```
convex/
├── schema.ts                    # Add new validators, remove old status
├── lib/validators.ts            # Export validators for reuse
└── functions/
    └── projects/
        ├── queries.ts           # Update status references
        └── mutations.ts         # Update status transitions
```

### Schema Changes

```typescript
// convex/schema.ts

// Remove this:
export const projectStatusValidator = v.union(
  v.literal("draft"),
  v.literal("pending_review"),
  // ... old statuses
);

// Add these:
export const projectPhaseValidator = v.union(/* ... */);
export const projectActionStateValidator = v.union(/* ... */);

// Update projects table:
projects: defineTable({
  // ... existing fields ...

  // REMOVE: status: projectStatusValidator,

  // ADD:
  phase: projectPhaseValidator,
  actionState: projectActionStateValidator,
  awaitingActorRole: v.optional(roleValidator),
  awaitingActorId: v.optional(v.id("profiles")),

  // Timestamps for key transitions
  quotationApprovedAt: v.optional(v.number()),
  storageAllocatedAt: v.optional(v.number()),
  uploadsCompletedAt: v.optional(v.number()),
  assignedAt: v.optional(v.number()),
})
  .index("by_phase", ["phase"])
  .index("by_actionState", ["actionState"])
  .index("by_awaitingActorRole", ["awaitingActorRole"]);
// ... existing indexes
```

### Migration Notes

Since we're in development:

1. Update schema in single commit
2. Fix all TypeScript errors from removed `status` field
3. Update existing project creation to use new fields
4. Update all queries/mutations that reference `status`

## Definition of Done

- [ ] Schema updated with new validators
- [ ] Old `status` field removed
- [ ] Indexes created
- [ ] TypeScript compiles without errors
- [ ] All existing tests pass (or updated)
- [ ] Convex dev server runs without errors
- [ ] Existing project creation wizard works with new fields

## Estimated Effort

- Schema changes: 1 hour
- Query/mutation updates: 2-3 hours
- Testing and fixes: 2 hours
- **Total: ~6 hours (1 day)**

## Notes

- This is a breaking change but we have no production data
- All subsequent Epic 5A stories depend on this
- Consider creating a mapping from old statuses if needed for debugging
