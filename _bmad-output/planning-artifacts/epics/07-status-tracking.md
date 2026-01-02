# Epic 7: Status Tracking & Dashboards

**User Outcome:** All users have clear visibility into project status through polished dashboards with real-time updates.

**FRs covered:** FR9 (Status Tracking), NFR1 (Performance)

**Scope:**

- Client dashboard enhancements (project status, next actions)
- Admin dashboard enhancements (pending reviews, alerts)
- Real-time status updates via Convex subscriptions
- Status history tracking
- Dashboard loading states and skeletons
- Quick action buttons

**Standalone:** ✅ Enhanced dashboards that work with existing data.

---

### Story 7.1: Client Dashboard Enhancements

**As a** Client,
**I want** an enhanced dashboard with clear next actions,
**So that** I always know what to do next.

**Acceptance Criteria:**

- **Given** I am on `/client/dashboard`
- **When** the page loads
- **Then** I must see a "Next Actions" section showing: Quotations to approve, Uploads to complete, Deliverables to review.
- **And** project cards must show a progress indicator (e.g., 3/5 stages complete).
- **And** real-time subscriptions must update the dashboard without refresh.

### Story 7.2: Admin Dashboard Enhancements

**As an** Admin,
**I want** an enhanced dashboard with alerts and key metrics,
**So that** I can prioritize my work effectively.

**Acceptance Criteria:**

- **Given** I am on `/admin/dashboard`
- **When** the page loads
- **Then** I must see: Pending Reviews (count + list), Active Projects (count), Quotations Pending Approval (count).
- **And** alerts must surface:
  - **Overdue projects:** Projects where `preferredDeliveryDate < today` AND status ≠ `completed`
  - Revision requests awaiting action
  - Projects with storage usage > 90%
- **And** Quick Actions must include links to common tasks.

### Story 7.3: Real-time Status Updates

**As a** User (Client or Admin),
**I want** to see status changes in real-time,
**So that** I don't have to refresh the page to get updates.

**Acceptance Criteria:**

- **Given** I am on any project detail page
- **When** another user (e.g., Admin updates status while Client is viewing)
- **Then** the status badge must update automatically via Convex subscription.
- **And** a subtle animation or toast must indicate the change.

### Story 7.4: Status History & Audit Trail

**As an** Admin,
**I want** to view the complete status history of a project,
**So that** I can understand the project timeline and troubleshoot issues.

**Acceptance Criteria:**

- **Given** I am on a project detail page
- **When** I expand the "History" section
- **Then** I must see all status transitions with: Previous Status, New Status, Timestamp, Actor.
- **And** history must be sorted from newest to oldest.

### Story 7.5: Client Download Final Deliverables

**As a** Client,
**I want** to download my approved final deliverables,
**So that** I can access my completed project files.

**Acceptance Criteria:**

- **Given** my project has status `completed`
- **When** I navigate to the project's Deliverables section
- **Then** I must see a "Download All" button for bulk download.
- **And** I must be able to download individual deliverables.
- **And** downloads must use signed URLs with reasonable expiration (e.g., 1 hour).
- **And** a download progress indicator must be shown for large files.

**Note:** ZIP packaging for bulk downloads is Phase 2. MVP uses individual file downloads.
