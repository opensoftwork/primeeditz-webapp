# Epic 6: Deliverables & QC Workflow

## Epic Overview

- **ID**: 06-deliverables-qc
- **Status**: in_progress
- **Priority**: high
- **Estimated Points**: 34 (revised from 21)
- **Depends On**: Epic 5A (Project Status Workflow System)

## Business Value

Editors can submit deliverables, QC can review and approve/reject, and clients can review approved deliverables and request revisions. This enables a professional quality control process.

**FRs covered:** FR12 (Deliverables - NEW), NFR6 (Security - QC Gate)

## Scope

- Deliverable upload by editors (per stage)
- Deliverable versioning (v1, v2, v3...)
- QC review workflow (approve/reject with notes)
- QC Gate: Clients only see QC-approved deliverables
- Client review page (view deliverables)
- Client approve/request revision flow
- Revision tracking with limits
- **NEW**: Real-time UI reactions for role-based visibility
- **NEW**: Component architecture refactoring (list/detail/create/edit pattern)

**Standalone:** ✅ Complete deliverables and QC workflow.

---

## Status Workflow Integration (Epic 5A)

This epic uses the new Phase + ActionState model:

| Action                        | Triggers Status Transition                             |
| ----------------------------- | ------------------------------------------------------ |
| Employee starts work          | `assigned` → `work_in_progress`                        |
| Employee uploads deliverables | `work_in_progress` → `deliverables_ready`              |
| Admin QC approves             | `deliverables_ready` → `awaiting_review`               |
| Admin QC rejects              | `deliverables_ready` → `work_in_progress` (with notes) |
| Client approves deliverables  | `awaiting_review` → `review_approved`                  |
| Client requests revision      | `awaiting_review` → `revisions_requested`              |
| Employee completes revisions  | `revisions_requested` → `deliverables_ready`           |

**Actor Responsibility Changes:**

- `deliverables_ready` → 🔵 Admin (QC review)
- `awaiting_review` → 🟢 Client (review deliverables)
- `revisions_requested` → 🟠 Employee (make corrections)

---

## Implementation Status

| Story                        | Status     | Notes                                                   |
| ---------------------------- | ---------- | ------------------------------------------------------- |
| 6.1 Upload Deliverables      | ✅ Done    | `uploadDeliverable` mutation with auto-versioning       |
| 6.2 QC Review & Approval     | ✅ Done    | `approveDeliverable`, `requestRevision`, `sendToStudio` |
| 6.3 Client View Deliverables | 🔄 Partial | Query exists, UI needs refinement                       |
| 6.4 Client Approve/Revise    | 📋 Backlog | Waiting for client portal work                          |
| 6.5 UI Reactions (NEW)       | 📋 Backlog | Real-time feedback on approve/revise                    |
| 6.6 Component Refactor (NEW) | 📋 Backlog | Restructure to list/detail/create/edit pattern          |

---

## Stories

### Story 6.1: Upload Deliverables (Admin/Employee) ✅ DONE

**As an** Admin or Employee,
**I want** to upload final deliverables for a project,
**So that** they can be reviewed before showing to the client.

**Acceptance Criteria:**

**Given** a project with `actionState: 'assigned'` or `work_in_progress`
**When** I navigate to the Deliverables section from the Admin or Employee portal
**Then** I must be able to upload files (albums, videos, etc.) via signed URLs.
**And** each upload must be recorded with version number (v1, v2...).
**And** uploaded deliverables must have status `pending_qc`.
**And** if this is the first deliverable upload, project `actionState` must transition to `work_in_progress` (if not already).
**And** if a previous version was rejected, the rejection notes must be displayed clearly.

**Implementation Notes:**

- ✅ `convex/functions/deliverables/mutations.ts::uploadDeliverable`
- ✅ Auto-versioning implemented (queries existing, increments)
- ✅ Initial status set to `pending_qc`

---

### Story 6.2: QC Review & Approval ✅ DONE

**As an** Admin (QC role),
**I want** to review and approve/reject deliverables,
**So that** only quality work is shown to clients.

**Acceptance Criteria:**

**Given** a project with `actionState: 'deliverables_ready'`
**And** a deliverable with status `pending_qc`
**When** I click "Review"
**Then** I must be able to preview the deliverable.
**And** I can "Approve" (deliverable status → `approved`, project → `awaiting_review`) or "Reject" with notes (deliverable status → `revision_requested`, project → `work_in_progress`).
**And** approved deliverables become visible to the client.
**And** the `awaitingActorRole` must update accordingly:

- Approve → `studio`
- Reject → `employee`

**Implementation Notes:**

- ✅ `approveDeliverable` mutation - sets status to `approved`, transitions project
- ✅ `requestRevision` mutation - sets status to `revision_requested`, records handoff log
- ✅ `sendToStudio` mutation - transitions project to `awaiting_review` with actor `studio`
- ✅ Handoff logging implemented for audit trail

---

### Story 6.3: Client View Approved Deliverables 🔄 PARTIAL

**As a** Client,
**I want** to view deliverables that have been approved by QC,
**So that** I can review the final work.

**Acceptance Criteria:**

**Given** a project with `actionState: 'awaiting_review'`
**And** approved deliverables exist
**When** I navigate to the Deliverables tab
**Then** I must only see deliverables with status `approved` (QC Gate).
**And** `pending_qc` or `revision_requested` deliverables must NOT be visible.
**And** I can preview each deliverable.
**And** an info banner must show: "Review your deliverables and approve or request changes"

**Implementation Notes:**

- ✅ Backend query filters by status
- 🔄 UI components need Studio portal integration

---

### Story 6.4: Client Approve or Request Revision 📋 BACKLOG

**As a** Client,
**I want** to approve deliverables or request revisions,
**So that** I can ensure the final work meets my expectations.

**Acceptance Criteria:**

**Given** I am viewing approved deliverables on a project with `actionState: 'awaiting_review'`
**When** I click "Approve All"
**Then** the project `actionState` must transition to `review_approved`.
**And** the `phase` must transition to `delivery`.
**And** the `awaitingActorRole` must become `admin`.
**And** download links must become active (or prepared in next phase).

**When** I click "Request Revision" with notes
**Then** the project `actionState` must transition to `revisions_requested`.
**And** the `awaitingActorRole` must become `employee`.
**And** revision count must increment.
**And** if revision count >= 3, show warning: "Additional revisions may incur extra charges."

**MVP Note:** Revision limit is tracked but not hard-blocked. Payment for extra revisions is Phase 2.

---

### Story 6.5: UI Reactions for Approve/Revise Actions 📋 NEW

**As a** User (Studio, Employee, or Admin),
**I want** to see real-time feedback when deliverables are approved or revised,
**So that** I understand the current state without refreshing.

**Acceptance Criteria:**

#### Admin Approves Deliverable:

**Given** Admin clicks "Approve" on a deliverable
**When** the mutation succeeds
**Then** Admin sees success toast: "Deliverable approved successfully!"
**And** Studio portal (if online) sees the deliverable appear in their view (real-time via Convex subscription)
**And** Employee portal (if online) sees success banner: "Your deliverable has been approved! 🎉"

#### Admin Revises Deliverable:

**Given** Admin clicks "Revise" on a deliverable with notes
**When** the mutation succeeds
**Then** Admin sees success toast: "Revision requested! Employee will be notified."
**And** The current version is archived (stays as v1)
**And** Employee portal (if online) sees warning banner: "Revision requested on [Deliverable Name]. Please review the feedback and upload a new version."
**And** The revision notes are displayed prominently on employee's view

#### Real-time Updates:

**Given** Any role is viewing a deliverable detail page
**When** Another user changes the deliverable status
**Then** The UI updates automatically without manual refresh (Convex subscription)

**Implementation Notes:**

- Leverage Convex real-time subscriptions (already built-in)
- Add toast notifications on mutation success
- Add status banners in Studio and Employee portals
- Deliverable version history already preserves old versions

---

### Story 6.6: Component Architecture Refactor 📋 NEW

**As a** Developer,
**I want** the Deliverables components to follow the `list/detail/create/edit` pattern,
**So that** the codebase is maintainable and consistent.

**Acceptance Criteria:**

**Given** the existing monolithic `individual-delivrable.tsx` (432 lines)
**When** I refactor following the established pattern
**Then** the folder structure must be:

```
src/components/modules/admin/projects/project-detail/deliverables/
├── list/
│   ├── index.ts                    # Barrel export
│   ├── deliverables-list.tsx       # Main list component
│   ├── deliverable-card.tsx        # Individual card in list
│   └── deliverables-empty.tsx      # Empty state
├── detail/
│   ├── index.ts                    # Barrel export
│   ├── deliverable-detail-view.tsx # Main container
│   ├── deliverable-header.tsx      # Back button, title, version info
│   ├── deliverable-preview.tsx     # File preview section
│   ├── deliverable-actions.tsx     # Approve/Revise buttons
│   ├── deliverable-meta-card.tsx   # Status, submitter, QC info
│   ├── revision-dialog.tsx         # Revision request modal
│   └── version-history.tsx         # Version history panel
├── create/                         # Future: Upload wizard
│   └── (placeholder)
├── edit/                           # Future: Edit metadata
│   └── (placeholder)
└── index.ts                        # Root barrel export
```

**Pattern Reference:** `src/components/modules/admin/project-types/detail/`

**Sub-component Guidelines:**

- Each sub-component should be < 150 lines
- Props should be explicit (no drilling context)
- Use barrel exports for clean imports
- Shared types in a `types.ts` file if needed

**Files to Refactor:**

1. `individual-delivrable.tsx` → Split into `detail/` components
2. `deliverables-listing.tsx` → Move to `list/` folder
3. `project-deliverables.tsx` → Orchestrator that imports from list/detail

---

## Dependencies

| Dependency                       | Status  | Notes                  |
| -------------------------------- | ------- | ---------------------- |
| Epic 5A: Project Status Workflow | ✅ Done | Status transitions     |
| Epic 5: Asset Upload             | ✅ Done | Upload patterns reused |
| MinIO Configuration              | ✅ Done | S3-compatible storage  |

---

## Technical Notes

### Backend (Completed)

- All mutations in `convex/functions/deliverables/mutations.ts`
- Versioning: Auto-increments on `uploadDeliverable`
- Handoff logging: Records in `handoffLogs` table
- Status history: Records in `statusHistory` table
- Real-time: Convex subscriptions handle automatic UI updates

### Frontend (To Do)

- Refactor monolithic components following list/detail/create/edit
- Add toast notifications using `sonner`
- Add status banners for role-specific feedback
- Ensure all queries use Convex `useQuery` for real-time updates

### Component Pattern (New Standard)

```
modules/{domain}/{entity}/
├── list/       # Listing view components
├── detail/     # Detail view components
├── create/     # Creation form components
├── edit/       # Edit form components
└── index.ts    # Barrel exports
```

This pattern:

- Improves maintainability (smaller files)
- Enables easy handoff to other developers
- Provides consistent structure across the app
- Supports parallel development of list vs detail views
