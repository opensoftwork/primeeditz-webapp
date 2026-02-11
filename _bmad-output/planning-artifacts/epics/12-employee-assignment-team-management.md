# Epic 12: Employee Assignment & Team Management

**Priority:** High  
**Dependencies:** Epic 1 (Auth), Epic 3 (Admin Portal), Epic 5 (Asset Upload)  
**Status:** Ready for Development  
**Created:** 2026-01-24  
**Source:** Brainstorming Session — Employee Assignment and Project Team Management UI/UX

---

## Epic Goal

Enable Admins to efficiently assign employees to projects through a high-density "Command Center" interface, manage ephemeral project squads, and provide employees with a dedicated "War Room" for collaborative production delivery.

---

## User Outcome

After this epic is complete:

1. **Admins** can navigate to a dedicated assignment page, view employee workloads at a glance (heat-bars), and build project squads with confidence.
2. **Employees** can view their assigned projects in a dedicated "War Room" workspace, see their squad teammates, and manage handoffs through a workflow-gated baton pass system.
3. **Clients** can see a "Meet Your Team" section on their project dashboard, providing transparency into who is working on their project.

---

## Themes from Brainstorming

| Theme                                    | Focus                                                                      | Key Concepts                                                                                   |
| ---------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **Visual Resource Intelligence**         | Empowering the Admin to make split-second, accurate scheduling decisions   | Workload Heat-Bar, Availability Ribbon, Auto-Conflict Validation                               |
| **Agile Team Lifecycle**                 | Managing the birth, balance, and retirement of project teams automatically | Ephemeral Project Squads, Floating Squad Builder Bar, Dynamic Squad Permissions                |
| **Collaborative Trust & Accountability** | Building transparency for clients and shared ownership for employees       | Multi-Persona Status Timeline, "Meet Your Team" Intro, Project "War Room", Workflow Baton Pass |

---

## Functional Requirements Covered

| Requirement ID | Description                                               |
| -------------- | --------------------------------------------------------- |
| FR4-E1         | Dedicated `/assign` route for employee selection          |
| FR4-E2         | High-density employee data table with heat-bar indicators |
| FR4-E3         | Floating selection bar for squad building                 |
| FR4-E4         | Ephemeral squad creation and management                   |
| FR4-E5         | Workflow-gated status transitions (Baton Pass)            |
| FR4-E6         | Employee "War Room" project view                          |
| FR4-E7         | Client-facing "Meet Your Team" section                    |
| FR4-E8         | Handoff logging for audit trail                           |

---

## Stories

### Story 12.1: Admin Assignment Page Infrastructure

**As an** Admin,  
**I want** a dedicated `/assign` route for a specific project,  
**So that** I can focus on team building without clutter from the project detail view.

**Acceptance Criteria:**

- [ ] Route `/projects/[projectId]/assign` exists and is protected for admins only.
- [ ] Page loads project context (name, type, timeline).
- [ ] Includes a "Back to Project" navigation.
- [ ] Displays an empty state if no employees are assigned yet.

**Technical Notes:**

- Next.js dynamic route under `@admin/projects/[projectId]/assign/page.tsx`.
- Uses existing `getAdminProject` query for context.

---

### Story 12.2: Employee Listing Table with Workload Heat-Bars

**As an** Admin,  
**I want** to see a high-density table of all available employees with workload indicators,  
**So that** I can quickly identify who has capacity for the new project.

**Acceptance Criteria:**

- [ ] Table displays: Employee Name, Role(s), Current Project Count, Workload Heat-Bar (0-100%).
- [ ] Heat-bar is color-coded (Green: 0-50%, Amber: 51-75%, Red: 76-100%).
- [ ] Supports search/filter by name or role.
- [ ] Clicking a row selects the employee (checkbox or highlight).

**Technical Notes:**

- New Convex query `getEmployeesWithWorkload` that joins `profiles` with `squadMembers` count.
- Reusable `<EmployeeDataTable>` component.

---

### Story 12.3: Floating Squad Builder Bar

**As an** Admin,  
**I want** a floating action bar that appears when I select employees,  
**So that** I can see my current selections and confirm the squad in one action.

**Acceptance Criteria:**

- [ ] Bar appears at the bottom of the viewport when one or more employees are selected.
- [ ] Shows: [X] employees selected | "Assign to Project" button | "Clear Selection" button.
- [ ] Displays a mini avatar stack of selected employees.
- [ ] Smooth entry/exit animation.

**Technical Notes:**

- Uses local React state for selection management.
- Integrates with `createProjectSquad` mutation on confirm.

---

### Story 12.4: Project Squad Creation Mutation

**As a** Backend System,  
**I want** a mutation to create a project squad,  
**So that** the selected employees are formally linked to the project.

**Acceptance Criteria:**

- [ ] `createProjectSquad` mutation accepts `projectId` and array of `{ employeeId, role }`.
- [ ] Creates entries in the `squadMembers` table.
- [ ] Updates project `actionState` to `assigned` if transitioning from `uploads_complete`.
- [ ] Records entry in `statusHistory` for audit.

**Technical Notes:**

- Located in `convex/functions/admin/squads.ts`.
- Uses `canTransition` from status machine for validation.

---

### Story 12.5: Employee War Room View

**As an** Employee,  
**I want** a dedicated "War Room" view for each project I'm assigned to,  
**So that** I can see my squad, project specs, and manage my handoffs in one place.

**Acceptance Criteria:**

- [ ] Route `/assigned-work/[projectId]` displays the War Room.
- [ ] Shows: Project Header (name, code, role badge), Squad Members sidebar, Production Feed.
- [ ] Includes "Finalize Work" button to trigger deliverable submission.
- [ ] Includes "Open Assets" navigation to folder view.

**Technical Notes:**

- Uses `getEmployeeProject` query for data.
- `SquadMemberCard` component for teammate display.

---

### Story 12.6: Handoff Panel (Baton Pass)

**As an** Employee,  
**I want** a clear "Handoff Panel" within my project view,  
**So that** I can transition the project to the next stage and optionally delegate to a teammate.

**Acceptance Criteria:**

- [ ] Panel displays available transitions based on current `actionState`.
- [ ] Allows optional selection of "Next Assignee" from squad.
- [ ] Supports adding "Handoff Notes".
- [ ] On confirm, calls `recordHandoff` mutation and updates project state.

**Technical Notes:**

- `HandoffPanel` component in `employee/assigned-work/[projectId]`.
- Mutation ensures status machine rules are followed.

---

### Story 12.7: Finalize Production Drawer

**As an** Employee,  
**I want** a dedicated drawer to upload my final deliverables and mark production as complete,  
**So that** the project can move to Quality Control.

**Acceptance Criteria:**

- [ ] Drawer opens from "Finalize Work" button.
- [ ] Includes file drop zone for final deliverable upload.
- [ ] Shows upload progress.
- [ ] On success, transitions project to `deliverables_ready` state.

**Technical Notes:**

- `FinalizeWorkDrawer` component.
- Uses existing `generateUploadUrl` action with `folderId = null` for deliverables path.
- Creates record in `deliverables` table.

---

### Story 12.8: Client "Meet Your Team" Section

**As a** Client,  
**I want** to see a "Meet Your Team" section on my project dashboard,  
**So that** I know who is responsible for my project.

**Acceptance Criteria:**

- [ ] Section appears on Client Project Detail page once a squad is assigned.
- [ ] Displays: Employee Name, Role, Avatar.
- [ ] Shows a brief intro like "Your creative team for [Project Name]".
- [ ] Does not reveal internal employee contact info.

**Technical Notes:**

- New query `getProjectTeamForClient` that returns limited profile fields.
- Component `<ClientTeamIntro>`.

---

### Story 12.9: Availability Ribbon (Phase 2 - Design Only)

**As an** Admin,  
**I want** to see a 30-day availability timeline for each employee,  
**So that** I can check for scheduling conflicts before assigning.

**Acceptance Criteria (Design Only):**

- [ ] Document the data model for tracking employee availability (linked to project dates).
- [ ] Create a static mockup of the "Availability Ribbon" UI.
- [ ] Mark for implementation in a future sprint.

**Technical Notes:**

- Deferred to Phase 2 per brainstorming prioritization.

---

## FR Coverage Map Update

| Requirement                 | Epic    | Stories    |
| --------------------------- | ------- | ---------- |
| FR4-E1: Assign Route        | Epic 12 | 12.1       |
| FR4-E2: Workload Table      | Epic 12 | 12.2       |
| FR4-E3: Squad Builder       | Epic 12 | 12.3       |
| FR4-E4: Squad Mutation      | Epic 12 | 12.4       |
| FR4-E5: Baton Pass          | Epic 12 | 12.6       |
| FR4-E6: War Room            | Epic 12 | 12.5       |
| FR4-E7: Meet Your Team      | Epic 12 | 12.8       |
| FR4-E8: Handoff Logs        | Epic 12 | 12.4, 12.6 |
| FR12-D1: Deliverable Upload | Epic 12 | 12.7       |

---

## Dependencies

```
Epic 1: Auth & Onboarding
    ↓
Epic 3: Admin Portal
    ↓
Epic 5: Asset Upload (for folder/storage patterns)
    ↓
Epic 12: Employee Assignment & Team Management (This Epic)
    ↓
Epic 6: Deliverables & QC Workflow (enabled by 12.7)
```

---

## Implementation Notes

- **Backend:** Squads are "ephemeral" — they are project-scoped and dissolve when a project is archived. No separate "Team" entity is needed.
- **UI:** The Admin Assignment page should feel like a "Command Center" with high information density. Prioritize data tables over cards for this view.
- **Security:** Employee folder access should be automatically granted via squad membership (handled in existing folder permission logic).

---

<!-- End of Epic 12 -->
