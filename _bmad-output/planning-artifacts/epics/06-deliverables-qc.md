# Epic 6: Deliverables & QC Workflow

## Epic Overview

- **ID**: 06-deliverables-qc
- **Status**: backlog
- **Priority**: high
- **Estimated Points**: 21
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

## Stories

### Story 6.1: Upload Deliverables (Admin/Employee)

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

**Status Integration:**

- Uses `canUploadDeliverable(projectId, role)` from Epic 5A
- Triggers `transitionProject()` when applicable

---

### Story 6.2: QC Review & Approval

**As an** Admin (QC role),
**I want** to review and approve/reject deliverables,
**So that** only quality work is shown to clients.

**Acceptance Criteria:**

**Given** a project with `actionState: 'deliverables_ready'`
**And** a deliverable with status `pending_qc`
**When** I click "Review"
**Then** I must be able to preview the deliverable.
**And** I can "Approve" (deliverable status → `approved`, project → `awaiting_review`) or "Reject" with notes (deliverable status → `revision_needed`, project → `work_in_progress`).
**And** approved deliverables become visible to the client.
**And** the `awaitingActorRole` must update accordingly:

- Approve → `client`
- Reject → `employee`

---

### Story 6.3: Client View Approved Deliverables

**As a** Client,
**I want** to view deliverables that have been approved by QC,
**So that** I can review the final work.

**Acceptance Criteria:**

**Given** a project with `actionState: 'awaiting_review'`
**And** approved deliverables exist
**When** I navigate to the Deliverables tab
**Then** I must only see deliverables with status `approved` (QC Gate).
**And** `pending_qc` or `revision_needed` deliverables must NOT be visible.
**And** I can preview each deliverable.
**And** an info banner must show: "Review your deliverables and approve or request changes"

---

### Story 6.4: Client Approve or Request Revision

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

## Dependencies

| Dependency                       | Status   | Notes                  |
| -------------------------------- | -------- | ---------------------- |
| Epic 5A: Project Status Workflow | Required | Status transitions     |
| Epic 5: Asset Upload             | Required | Upload patterns reused |
| MinIO Configuration              | ✅ Done  | S3-compatible storage  |

---

## Technical Notes

- Reuse upload patterns from Epic 5
- All status transitions go through `transitionProject()` utility
- QC Gate implemented via query filter on `deliverable.status`
- Revision notes stored in `statusHistory` with notes field
