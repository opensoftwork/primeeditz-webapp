# Epic 6: Deliverables & QC Workflow

**User Outcome:** Editors can submit deliverables, QC can review and approve/reject, and clients can review approved deliverables and request revisions.

**FRs covered:** FR12 (Deliverables - NEW), NFR6 (Security - QC Gate)

**Scope:**

- Deliverable upload by editors (per stage)
- Deliverable versioning (v1, v2, v3...)
- QC review workflow (approve/reject with notes)
- QC Gate: Clients only see QC-approved deliverables
- Client review page (view deliverables)
- Client approve/request revision flow
- Revision tracking with limits

**Standalone:** ✅ Complete deliverables and QC workflow.

---

### Story 6.1: Upload Deliverables (Admin/Employee)

**As an** Admin or Employee,
**I want** to upload final deliverables for a project,
**So that** they can be reviewed before showing to the client.

**Acceptance Criteria:**

- **Given** a project with status `in_progress`
- **When** I navigate to the Deliverables section from the Admin or Employee portal
- **Then** I must be able to upload files (albums, videos, etc.) via signed URLs.
- **And** each upload must be recorded with version number (v1, v2...).
- **And** uploaded deliverables must have status `pending_qc`.
- **And** if a previous version was rejected, the rejection notes must be displayed clearly.

**Employee Portal Note:** Employees see only their assigned projects. MVP includes basic Employee portal for smooth Phase 2 transition.

### Story 6.2: QC Review & Approval

**As an** Admin (QC role),
**I want** to review and approve/reject deliverables,
**So that** only quality work is shown to clients.

**Acceptance Criteria:**

- **Given** a deliverable with status `pending_qc`
- **When** I click "Review"
- **Then** I must be able to preview the deliverable.
- **And** I can "Approve" (status → `approved`) or "Reject" with notes (status → `revision_needed`).
- **And** approved deliverables become visible to the client.
- **And** when rejected, the uploader must be able to see rejection notes in Story 6.1 to upload v2.

### Story 6.3: Client View Approved Deliverables

**As a** Client,
**I want** to view deliverables that have been approved by QC,
**So that** I can review the final work.

**Acceptance Criteria:**

- **Given** a project with approved deliverables
- **When** I navigate to the Deliverables tab
- **Then** I must only see deliverables with status `approved` (QC Gate).
- **And** `pending_qc` or `revision_needed` deliverables must NOT be visible.
- **And** I can preview each deliverable.

### Story 6.4: Client Approve or Request Revision

**As a** Client,
**I want** to approve deliverables or request revisions,
**So that** I can ensure the final work meets my expectations.

**Acceptance Criteria:**

- **Given** I am viewing approved deliverables
- **When** I click "Approve Final"
- **Then** the project status must change to `completed`.
- **And** download links must become active.
- **When** I click "Request Revision" with notes
- **Then** a revision request must be created for the admin.
- **And** the deliverable status must change to `revision_requested`.
- **And** revision count must increment.
- **And** if revision count >= 3, show warning: "Additional revisions may incur extra charges."

**MVP Note:** Revision limit is tracked but not hard-blocked. Payment for extra revisions is Phase 2.
