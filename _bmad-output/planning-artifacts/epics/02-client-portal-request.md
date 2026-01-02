# Epic 2: Client Portal — Project Request

**User Outcome:** Clients can submit project requests to the studio, upload reference files, and view their submitted projects.

**FRs covered:** FR3 (Project Creation), FR9 (Status Tracking - partial)

**Scope:**

- Client dashboard with project listing
- Multi-step project request wizard (5 steps)
- Reference file upload with signed URLs
- Project detail view (client perspective)
- Project status display
- Project code generation

**Standalone:** ✅ Clients can create and view projects without admin intervention.

**Reference:** [Notion: Event Request Flow](https://life-design-2025.notion.site/Event-Request-Flow-Client-2d2bd7d9d27180c3a425ff66691558b6)

---

### Story 2.0: Wizard Infrastructure & Draft Project

**As a** Developer,
**I want** to set up the wizard infrastructure with step indicator and form state management,
**So that** the 5-step project request flow works smoothly.

**Acceptance Criteria:**

- **Given** the TanStack Start routing setup
- **When** I implement the wizard at `/client/projects/new`
- **Then** a step indicator must show "Step X of 5" with visual progress.
- **And** clicking "Request New Project" must create a draft project record (status: `draft`) and redirect to the wizard with `projectId` in the URL.
- **And** form state must persist across steps using TanStack Form.
- **And** navigating away must show a confirmation dialog if form has unsaved data.

**Implementation Notes:**

- Follow Clean Architecture: thin route file, components in `components/modules/projects/wizard/`
- Route file: `routes/_authed/client/projects/new.tsx` (config only)
- Container component: `components/modules/projects/wizard/project-wizard.tsx`
- Shared step indicator: `components/shared/wizard/step-indicator.tsx`
- See: `architecture/09-clean-code-standards.md`

**Cleanup Logic:**

- Draft projects older than 7 days must be cleaned up by a scheduled job.

### Story 2.1: Client Dashboard with Project Listing

**As a** Client,
**I want** to see a dashboard with all my submitted projects,
**So that** I can track the status of my work requests at a glance.

**Acceptance Criteria:**

- **Given** I am logged in as a Client
- **When** I navigate to `/client/dashboard`
- **Then** I must see a list of my projects with their current status (Pending, Active, Completed).
- **And** each project card must show: Project Name, Project Type, Submission Date, and Status badge.
- **And** a prominent "Request New Project" button must be visible.
- **And** draft projects must NOT appear in the list (only submitted projects).
- **And** an empty state must show for first-time clients with no projects.

### Story 2.2: Wizard Step 1 — Project Type & Basic Info

**As a** Client,
**I want** to select a project type and enter basic event information,
**So that** the studio knows what kind of work I need done.

**Acceptance Criteria:**

- **Given** I am on Step 1 of the wizard
- **When** I select a Project Type from the dropdown
- **Then** the dropdown must show hardcoded project types:
  - Wedding Album, Pre-Wedding Album, Birthday Album
  - Wedding Photography Edit, Wedding Film
  - YouTube Video, Instagram Reel
  - Corporate Event
- **And** I must enter: End Client Name (required), Event Name (required), Event Date (optional), Venue (optional).
- **And** form validation must prevent proceeding without required fields.

### Story 2.3: Wizard Step 2 — Project-Specific Details (Dynamic)

**As a** Client,
**I want** to provide details specific to my project type,
**So that** the studio has the information needed for estimation and planning.

**Acceptance Criteria:**

- **Given** I have selected a Project Type in Step 1
- **When** I am on Step 2 of the wizard
- **Then** the form fields must change dynamically based on the selected project type:

| Project Type            | Dynamic Fields                                                      |
| ----------------------- | ------------------------------------------------------------------- |
| **Wedding Album**       | Album count, Sheets per album, Size (12x18/16x24), Cover type       |
| **Pre-Wedding Album**   | Album count, Sheets per album, Theme preference                     |
| **Birthday Album**      | Album count, Sheets per album, Theme                                |
| **Wedding Photography** | Estimated photo count, Number of locations, Candid ratio preference |
| **Wedding Film**        | Duration (mins), Highlights needed?, Estimated raw footage size     |
| **YouTube Video**       | Target duration, Thumbnail needed?, B-roll available?, Music source |
| **Instagram Reel**      | Duration (15/30/60s), Platform, Music preference                    |
| **Corporate Event**     | Event type, Number of days, Expected deliverables                   |

- **And** I can navigate back to Step 1 without losing data.
- **And** field values must be stored in `typeSpecificDetails` JSON field.

**Note:** These fields are hardcoded for MVP. Phase 2 will make them admin-configurable.

### Story 2.4: Wizard Step 3 — Reference Files Upload

**As a** Client,
**I want** to upload reference files (mood boards, examples) during my project request,
**So that** the studio has visual context for my expectations.

**Acceptance Criteria:**

- **Given** I am on Step 3 of the wizard
- **When** I drag-and-drop or select files (up to 10 files, 50MB each)
- **Then** the files must be uploaded to MinIO via signed URLs to path `/projects/{projectId}/reference/`.
- **And** a progress indicator must show upload status for each file.
- **And** successfully uploaded files must show a green checkmark.
- **And** I must be able to remove files before submission.
- **And** these files do NOT count against the storage tier (reference files only).

### Story 2.5: Wizard Step 4 — Description & Additional Notes

**As a** Client,
**I want** to add a description and any additional notes,
**So that** I can communicate anything not captured in the structured fields.

**Acceptance Criteria:**

- **Given** I am on Step 4 of the wizard
- **When** I enter text in the form
- **Then** I must be able to enter:
  - Description (multiline, required) — main project description
  - Additional Notes (multiline, optional) — special instructions, preferences
  - Preferred Delivery Date (date picker, optional)
- **And** I can navigate back to previous steps without losing data.

### Story 2.6: Wizard Step 5 — Review & Submit

**As a** Client,
**I want** to review all my project details before final submission,
**So that** I can verify accuracy before the studio receives my request.

**Acceptance Criteria:**

- **Given** I am on Step 5 (final step) of the wizard
- **When** I review the summary
- **Then** I must see a read-only summary of:
  - Project Type & Basic Info (Step 1)
  - Project-Specific Details (Step 2)
  - Uploaded Reference Files with thumbnails (Step 3)
  - Description & Notes (Step 4)
- **And** I must be able to edit any section by clicking "Edit" next to it.
- **And** clicking "Submit Request" must:
  - Update project status from `draft` → `pending_review`
  - Show a success toast
  - Redirect to `/client/projects/{projectId}`

### Story 2.7: Client Project Detail View

**As a** Client,
**I want** to view the full details of a submitted project,
**So that** I can track its progress and see any quotations or updates.

**Acceptance Criteria:**

- **Given** I am on `/client/projects/{projectId}`
- **When** the page loads
- **Then** I must see:
  - Project Header (name, code, status badge)
  - Project-Specific Details section (rendered based on type)
  - Reference Files section with file list
  - Description & Notes section
- **And** if a quotation exists, I must see a "View Quotation" button.
- **And** real-time subscription must update the status if it changes.
- **And** loading state must show skeleton components.
- **And** empty states must be shown for sections with no data.
