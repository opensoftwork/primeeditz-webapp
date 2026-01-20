---
stepsCompleted: ["step-01-validate-prerequisites", "step-02-design-epics"]
inputDocuments:
  - "_bmad-output/planning-artifacts/prd.md"
  - "_bmad-output/planning-artifacts/architecture/"
  - "_bmad-output/planning-artifacts/ux-design-specification.md"
  - "_bmad-output/implementation-artifacts/references/status-workflow.md"
relatedEpics:
  - "05-asset-upload.md"
  - "06-deliverables-qc.md"
  - "07-status-tracking.md"
priority: HIGH
estimatedDuration: "2-3 weeks"
---

# Epic 5A: Project Status Workflow System

**User Outcome:** All users have clear visibility into project status through a multi-dimensional status model that accurately reflects who needs to act next, enabling proper gating of actions across portals.

**Problem Solved:** Current status model is too simplistic (6 statuses) to represent the complex 9-stage workflow. Admin can upload when client should be uploading. No concept of "awaiting actor".

**Dependencies:** None (Foundation epic - other epics depend on this)

**Scope:**

- Introduce Phase + ActionState schema model
- Generic status states (project-type agnostic)
- `awaitingActorRole` field for clear actor indication
- Project-type-specific delivery configuration
- Status transition validation
- Upload gating based on status
- Portal-specific status views

**Standalone:** ✅ Complete status infrastructure that other epics consume.

---

## Requirements Inventory

### Functional Requirements (Status-Related)

FR-S1: System must track project lifecycle through 6 distinct phases: setup, onboarding, production, review, delivery, completed
FR-S2: System must track granular action states within each phase (17+ states)
FR-S3: System must indicate which actor role (client/admin/employee) needs to act next
FR-S4: System must gate actions based on current status (e.g., uploads only after storage allocated)
FR-S5: System must support project-type-specific delivery configurations
FR-S6: System must maintain complete status history for audit trail
FR-S7: System must display portal-specific status views (simplified for clients)
FR-S8: Draft status must persist for incomplete project wizard submissions

### Non-Functional Requirements

NFR-S1: Status updates must propagate in real-time via Convex subscriptions
NFR-S2: Status transitions must be validated server-side (no invalid transitions)
NFR-S3: Status queries must be indexed for performance (<100ms response)

### Additional Requirements (from Architecture)

AR-S1: Schema changes must be backward-compatible during migration
AR-S2: Status validators must be exported from schema for type safety
AR-S3: Status transition logic must be centralized in utility functions
AR-S4: Portal-specific status mapping must be handled at presentation layer

---

## Project Phases

| Phase        | Description                    | Entry Condition    |
| ------------ | ------------------------------ | ------------------ |
| `setup`      | Project creation and quotation | Project created    |
| `onboarding` | Asset upload and preparation   | Quotation approved |
| `production` | Employee work on deliverables  | Assets uploaded    |
| `review`     | Client/Admin review cycle      | Deliverables ready |
| `delivery`   | Final delivery preparation     | Review approved    |
| `completed`  | Project finished               | Delivered          |
| `archived`   | Historical record              | Manual archive     |

---

## Action States

### Setup Phase

| State                | Actor     | Description              |
| -------------------- | --------- | ------------------------ |
| `draft`              | 🟢 Client | Wizard incomplete        |
| `awaiting_quotation` | 🔵 Admin  | Request submitted        |
| `quotation_sent`     | 🟢 Client | Reviewing quotation      |
| `quotation_approved` | 🔵 Admin  | Need to allocate storage |
| `storage_allocated`  | 🔵 Admin  | Ready to enable uploads  |

### Onboarding Phase

| State                 | Actor     | Description      |
| --------------------- | --------- | ---------------- |
| `awaiting_uploads`    | 🟢 Client | Upload files     |
| `uploads_complete`    | 🔵 Admin  | Assign employee  |
| `awaiting_assignment` | 🔵 Admin  | Finding employee |

### Production Phase

| State                | Actor       | Description |
| -------------------- | ----------- | ----------- |
| `assigned`           | 🟠 Employee | Start work  |
| `work_in_progress`   | 🟠 Employee | Working     |
| `deliverables_ready` | 🔵 Admin    | QC review   |

### Review Phase

| State                 | Actor       | Description         |
| --------------------- | ----------- | ------------------- |
| `awaiting_review`     | 🟢 Client   | Review deliverables |
| `revisions_requested` | 🟠 Employee | Make corrections    |
| `review_approved`     | 🔵 Admin    | Prepare delivery    |

### Delivery Phase

| State                | Actor    | Description                               |
| -------------------- | -------- | ----------------------------------------- |
| `preparing_delivery` | 🔵/🟠    | Final preparation (project-type specific) |
| `ready_for_delivery` | 🔵 Admin | Hand over                                 |

### Terminal States

| State       | Actor     | Description                |
| ----------- | --------- | -------------------------- |
| `delivered` | 🟢 Client | Confirm receipt (optional) |
| `completed` | ✅        | All done                   |
| `cancelled` | ❌        | Cancelled                  |

---

## FR Coverage Map

| Requirement | Epic | Stories    |
| ----------- | ---- | ---------- |
| FR-S1       | 5A   | 5A.1       |
| FR-S2       | 5A   | 5A.1       |
| FR-S3       | 5A   | 5A.2       |
| FR-S4       | 5A   | 5A.3, 5A.4 |
| FR-S5       | 5A   | 5A.5       |
| FR-S6       | 5A   | 5A.6       |
| FR-S7       | 5A   | 5A.7       |
| FR-S8       | 5A   | 5A.1       |

---

## Epic List

### Epic 5A: Project Status Workflow System (NEW - Foundation)

Complete status infrastructure with Phase + ActionState model, enabling proper workflow progression and action gating across all portals.
**FRs covered:** FR-S1, FR-S2, FR-S3, FR-S4, FR-S5, FR-S6, FR-S7, FR-S8

### Epic 5 Revision: Asset Upload with Status Gating

Update upload flows to use new status model with proper gating based on `awaitingActorRole`.
**Depends on:** Epic 5A

### Epic 6 Revision: Deliverables with Status Integration

Update deliverables workflow to trigger appropriate status transitions.
**Depends on:** Epic 5A

### Epic 7 Revision: Dashboards with Multi-Dimensional Status

Update dashboards to display phase + actionState with actor indicators.
**Depends on:** Epic 5A

---

## Stories

| Story                                                            | Title                                        | Points | Status        | Depends On |
| ---------------------------------------------------------------- | -------------------------------------------- | ------ | ------------- | ---------- |
| [5A.1](../../stories/5a-1-schema-migration-phase-actionstate.md) | Schema Migration - Phase + ActionState Model | 8      | ready-for-dev | -          |
| [5A.2](../../stories/5a-2-status-transition-utilities.md)        | Status Transition Utilities                  | 5      | blocked       | 5A.1       |
| [5A.3](../../stories/5a-3-upload-gating-service.md)              | Upload Gating Service                        | 5      | blocked       | 5A.1, 5A.2 |
| [5A.4](../../stories/5a-4-admin-action-guards.md)                | Admin Action Guards                          | 5      | blocked       | 5A.1, 5A.2 |
| [5A.5](../../stories/5a-5-project-type-delivery-config.md)       | Project Type Delivery Configuration          | 3      | blocked       | 5A.1       |
| [5A.6](../../stories/5a-6-status-history-enhancement.md)         | Status History Enhancement                   | 5      | blocked       | 5A.1       |
| [5A.7](../../stories/5a-7-portal-specific-status-mapping.md)     | Portal-Specific Status Mapping               | 5      | blocked       | 5A.1       |

**Total Points:** 36

---

## Implementation Order

```
┌─────────────────────────────────────────────────────────────────┐
│                    IMPLEMENTATION SEQUENCE                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ PHASE 1: Foundation (Must Complete First)               │    │
│  │                                                          │    │
│  │   Story 5A.1: Schema Migration                           │    │
│  │   - Add phase, actionState, awaitingActorRole           │    │
│  │   - Remove old status field                              │    │
│  │   - Create indexes                                       │    │
│  │   - Fix all TypeScript errors                            │    │
│  │                                                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ PHASE 2: Core Utilities (After 5A.1)                    │    │
│  │                                                          │    │
│  │   Story 5A.2: Status Transition Utilities                │    │
│  │   - State machine implementation                         │    │
│  │   - transitionProject mutation                           │    │
│  │                                                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ PHASE 3: Parallel Implementation (After 5A.2)           │    │
│  │                                                          │    │
│  │   5A.3: Upload Gating      5A.4: Admin Action Guards    │    │
│  │   5A.5: Delivery Config    5A.6: Status History         │    │
│  │   5A.7: Portal Status Mapping                            │    │
│  │                                                          │    │
│  │   (These can be done in parallel)                        │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Key Files Reference

```
convex/
├── schema.ts                    # Phase, ActionState validators
├── lib/
│   ├── status-machine.ts        # State machine utilities (5A.2)
│   ├── upload-gate.ts           # Upload permission logic (5A.3)
│   └── delivery-config.ts       # Delivery config utils (5A.5)
├── functions/
│   └── projects/
│       ├── queries.ts           # Updated for new status model
│       └── mutations.ts         # transitionProject mutation

src/
├── lib/
│   └── status-display.ts        # Portal-specific labels (5A.7)
└── components/
    └── modules/
        ├── projects/
        │   ├── phase-progress.tsx
        │   └── status-badges.tsx
        └── admin/projects/
            └── project-detail/
                ├── awaiting-actor-banner.tsx  # (5A.4)
                └── admin-action-banner.tsx    # (5A.4)
```
