# Epic 7: Status Tracking & Dashboards

## Epic Overview

- **ID**: 07-status-tracking
- **Status**: backlog
- **Priority**: high
- **Estimated Points**: 21
- **Depends On**: Epic 5A (Project Status Workflow System)

## Business Value

All users have clear visibility into project status through polished dashboards with real-time updates. The new multi-dimensional status model enables "who needs to act" indicators.

**FRs covered:** FR9 (Status Tracking), NFR1 (Performance)

## Scope

- Client dashboard enhancements (project status, next actions)
- Admin dashboard enhancements (pending reviews, alerts, actor indicators)
- Employee dashboard (future - assigned projects)
- Real-time status updates via Convex subscriptions
- Status history tracking with enhanced detail
- Dashboard loading states and skeletons
- Quick action buttons

**Standalone:** ✅ Enhanced dashboards that work with new status model.

---

## Status Workflow Integration (Epic 5A)

This epic consumes the Phase + ActionState model to display:

### Multi-Dimensional Status Display

| Portal   | Shows             | Details                                      |
| -------- | ----------------- | -------------------------------------------- |
| Client   | Simplified status | Friendly labels via `getClientStatusLabel()` |
| Admin    | Full status       | Phase + ActionState + awaitingActorRole      |
| Employee | Task-focused      | Assigned projects, work required             |

### Actor Indicators

- 🟢 "Your Action Needed" - When `awaitingActorRole` matches viewer role
- 🔵 "Waiting for Admin" - For clients/employees
- 🟠 "Waiting for [Employee Name]" - For admin view
- 🟢 "Waiting for Client" - For admin view

---

## Stories

### Story 7.1: Client Dashboard Enhancements

**As a** Client,
**I want** an enhanced dashboard with clear next actions,
**So that** I always know what to do next.

**Acceptance Criteria:**

**Given** I am on `/client/dashboard`
**When** the page loads
**Then** I must see a "Your Action Needed" section showing projects where `awaitingActorRole === 'client'`:

- Quotations to approve (actionState: `quotation_sent`)
- Uploads to complete (actionState: `awaiting_uploads`)
- Deliverables to review (actionState: `awaiting_review`)
  **And** project cards must show:
- Phase progress indicator (e.g., 3/6 phases complete)
- Friendly status label from `getClientStatusLabel()`
- CTA button when action is needed
  **And** real-time subscriptions must update the dashboard without refresh.

---

### Story 7.2: Admin Dashboard Enhancements

**As an** Admin,
**I want** an enhanced dashboard with alerts and actor indicators,
**So that** I can prioritize my work effectively.

**Acceptance Criteria:**

**Given** I am on `/admin/dashboard`
**When** the page loads
**Then** I must see sections organized by `awaitingActorRole`:

**"Awaiting Your Action" (awaitingActorRole: 'admin'):**

- Projects needing quotation (`awaiting_quotation`)
- Projects needing storage allocation (`quotation_approved`)
- Projects needing employee assignment (`uploads_complete`, `awaiting_assignment`)
- Deliverables needing QC review (`deliverables_ready`)
- Projects ready for delivery prep (`review_approved`)

**"Awaiting Client" (awaitingActorRole: 'client'):**

- Quotations pending review
- Uploads pending
- Deliverable reviews pending

**"Awaiting Employee" (awaitingActorRole: 'employee'):**

- Assigned but not started
- Work in progress
- Revisions requested

**And** alerts must surface:

- **Overdue projects:** Projects where `preferredDeliveryDate < today` AND phase !== `completed`
- Revision requests awaiting action
- Projects with storage usage > 90%
  **And** Quick Actions must include links to common tasks.

---

### Story 7.3: Real-time Status Updates

**As a** User (Client or Admin),
**I want** to see status changes in real-time,
**So that** I don't have to refresh the page to get updates.

**Acceptance Criteria:**

**Given** I am on any project detail page
**When** another user triggers a status transition (e.g., Admin approves while Client is viewing)
**Then** the phase badge must update automatically via Convex subscription.
**And** the actionState must update automatically.
**And** the `awaitingActorRole` indicator must update.
**And** a subtle animation or toast must indicate the change.
**And** any action buttons must enable/disable based on new state.

---

### Story 7.4: Status History & Audit Trail (Enhanced)

**As an** Admin,
**I want** to view the complete status history of a project,
**So that** I can understand the project timeline and troubleshoot issues.

**Acceptance Criteria:**

**Given** I am on a project detail page
**When** I expand the "History" section
**Then** I must see all status transitions with:

- Previous Phase → New Phase (if changed)
- Previous ActionState → New ActionState
- Previous Actor → New Actor
- Timestamp
- Actor who triggered the change
- Notes (if any)
  **And** history must be sorted from newest to oldest.
  **And** timeline visualization must show phase progression.
  **And** clicking an entry shows detailed information.

---

### Story 7.5: Client Download Final Deliverables

**As a** Client,
**I want** to download my approved final deliverables,
**So that** I can access my completed project files.

**Acceptance Criteria:**

**Given** my project has `phase: 'completed'`
**When** I navigate to the project's Deliverables section
**Then** I must see a "Download All" button for bulk download.
**And** I must be able to download individual deliverables.
**And** downloads must use signed URLs with reasonable expiration (e.g., 1 hour).
**And** a download progress indicator must be shown for large files.

**Note:** ZIP packaging for bulk downloads is Phase 2. MVP uses individual file downloads.

---

### Story 7.6: Employee Dashboard (Foundation)

**As an** Employee,
**I want** a dashboard showing my assigned projects,
**So that** I can see what work needs my attention.

**Acceptance Criteria:**

**Given** I am on `/employee/dashboard`
**When** the page loads
**Then** I must see sections:

**"Action Needed" (awaitingActorRole: 'employee'):**

- Projects where I'm assigned and actionState in [`assigned`, `work_in_progress`, `revisions_requested`]

**"Recently Completed":**

- My projects that moved to `deliverables_ready` or later

**And** each project card shows:

- Project name and type
- Current actionState with friendly label
- Time since assignment
- CTA to open project
  **And** real-time updates via Convex subscription.

---

## Dependencies

| Dependency                       | Status   | Notes                      |
| -------------------------------- | -------- | -------------------------- |
| Epic 5A: Project Status Workflow | Required | Status model and utilities |
| Epic 2: Client Portal            | Required | Dashboard layout           |
| Epic 3: Admin Portal             | Required | Dashboard layout           |

---

## Technical Notes

- Use `getClientStatusLabel()` and `getClientCTA()` from Epic 5A
- Query projects by `awaitingActorRole` for efficient filtering
- Use Convex subscriptions for real-time updates
- Implement skeleton loading states for all dashboard sections
- Phase progress calculated from phase enum position
