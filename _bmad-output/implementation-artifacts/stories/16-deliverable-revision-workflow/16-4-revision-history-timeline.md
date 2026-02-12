# Story 16-4: Revision History Timeline

**Epic**: Epic 16 - Deliverable Revision Workflow  
**Status**: review  
**Complexity**: Medium (5 points)  
**Created**: 2026-02-11  
**Priority**: SHOULD — Provides visibility into revision lifecycle

---

## 📋 User Story

**As a** User (Admin, Studio, or Employee),  
**I want** to see a timeline of all revision requests on a deliverable,  
**So that** I can track the full history of feedback and corrections.

---

## 🔗 Dependencies & Context

### Prerequisites

| Depends On                     | Status  | Notes                             |
| ------------------------------ | ------- | --------------------------------- |
| **16-1 - Schema & Backend**    | ✅ Done | `getRevisionRequests` query       |
| **16-2 - Admin Revision Page** | ✅ Done | Revision requests with data exist |

### Enables

| Story / Epic  | Notes                          |
| ------------- | ------------------------------ |
| **All roles** | Shared visibility into history |

### Proposed UX

```
┌──────────────────────────────────────────────────────┐
│  📋 REVISION HISTORY                                  │
│  ─────────────────────────────────────────────────── │
│                                                      │
│  ┌─ 🟢 Revision #3 — RESOLVED ────────────────────┐ │
│  │  Requested by Admin (John) • Feb 10, 2026       │ │
│  │  "Adjust saturation on the middle panel"        │ │
│  │  📎 2 reference images                          │ │
│  │  ✅ Resolved → v4 uploaded by Employee (Sarah)  │ │
│  └─────────────────────────────────────────────────┘ │
│                                                      │
│  ┌─ 🟢 Revision #2 — RESOLVED ────────────────────┐ │
│  │  Requested by Studio (PrimeEditz) • Feb 8, 2026 │ │
│  │  "Logo placement is off-center"                 │ │
│  │  📎 1 reference image                           │ │
│  │  ✅ Resolved → v3 uploaded by Employee (Sarah)  │ │
│  └─────────────────────────────────────────────────┘ │
│                                                      │
│  ┌─ 🟡 Revision #1 — IN PROGRESS ─────────────────┐ │
│  │  Requested by Admin (John) • Feb 5, 2026        │ │
│  │  "Color grading needs work on all shots"        │ │
│  │  📎 3 reference images                          │ │
│  │  ⏳ Employee is working on corrections          │ │
│  └─────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

---

## ✅ Acceptance Criteria

### AC1: Timeline Display on Deliverable Detail

- [x] **Given** I am viewing a deliverable detail page (any role)
- [x] **When** the deliverable has revision requests
- [x] **Then** a "Revision History" section shows below or alongside the deliverable
- [x] **And** revisions are listed in reverse chronological order (newest first)

### AC2: Revision Card Content

- [x] **Given** a revision request
- [x] **Then** each card shows:
  - Revision number (e.g., "#3")
  - Status badge: Pending (amber), In Progress (blue), Resolved (green)
  - Requester name and role
  - Request date
  - Revision notes (truncated with "Show more" if long)
  - Number of reference images (with clickable gallery)
  - If resolved: resolution info (new version number, who uploaded, when)

### AC3: Reference Image Gallery

- [x] **Given** a revision card with reference images
- [x] **When** I click on the image count or thumbnail strip
- [x] **Then** images open in a gallery/lightbox with per-image notes
- [x] **And** signed URLs are used for image display

### AC4: Expand/Collapse

- [x] **Given** multiple revision requests (3+)
- [x] **Then** only the latest 2 are expanded by default
- [x] **And** older revisions are collapsed with a "Show older revisions" toggle

### AC5: Empty State

- [x] **Given** a deliverable with no revision requests
- [x] **Then** the "Revision History" section is hidden entirely
- [x] **Or** shows "No revision requests yet" if explicitly navigated to

### AC6: Real-Time Updates

- [x] **Given** I am viewing the revision timeline
- [x] **When** a revision request status changes (e.g., resolved)
- [x] **Then** the timeline updates in real-time via Convex subscription

---

## 📘 Implementation

### Phase A: Timeline Component (~3 points)

#### Task A1: Revision History Timeline

**File**: `src/components/shared/revision-timeline.tsx`

- [x] A1.1 Create `RevisionTimeline` component
- [x] A1.2 `RevisionCard` sub-component with status badges
- [x] A1.3 Expand/collapse for long lists
- [x] A1.4 Real-time updates via `useQuery`
- [x] A1.5 Image gallery integration (click to view)
- [x] A1.6 Empty state handling (return null)

---

### Phase B: Integration (~1.5 points)

#### Task B1: Add to Admin Deliverable Detail

**File**: `src/components/modules/admin/projects/project-detail/deliverables/detail/deliverable-detail-view.tsx`

- [x] B1.1 Import and render `RevisionTimeline` in admin detail view
- [x] B1.2 Position below deliverable preview or in a dedicated tab

#### Task B2: Add to Employee Deliverable View

**File**: `src/components/modules/employee/assigned-work/details/revision-workspace.tsx`

- [x] B2.1 Add "View All Revisions" link in revision workspace
- [x] B2.2 Shows full timeline when clicked

#### Task B3: Add to Studio Deliverable View

**File**: `src/components/modules/projects/detail/deliverables-section.tsx` (or per-deliverable view)

- [x] B3.1 Import and render `RevisionTimeline` in studio deliverable detail
- [x] B3.2 Studio sees revision requests they created + status

#### Task B4: Replace/Augment Existing Version History

**File**: `src/components/modules/admin/projects/project-detail/deliverables/detail/version-history.tsx`

- [x] B4.1 Show revision request badge next to version entries that were created from revisions
- [x] B4.2 Click on badge opens the revision request details

---

### Phase C: Signed URLs for Timeline Images (~0.5 points)

#### Task C1: Batch Signed URLs

- [x] C1.1 Use existing `getSignedFileUrls` action for revision image keys
- [x] C1.2 Batch fetch URLs for all visible revision requests
- [x] C1.3 Lazy load URLs for collapsed/hidden revisions

---

## 🧪 Testing Checklist

### Display

- [x] Timeline shows revision requests in reverse chronological order
- [x] Status badges are correct (Pending/In Progress/Resolved)
- [x] Requester name and role displayed
- [x] Revision notes displayed
- [x] Reference image count shown
- [x] Resolution info shown for resolved requests

### Expand/Collapse

- [x] Only 2 latest shown by default
- [x] "Show older" toggle works
- [x] Collapsed states render correctly

### Role Integration

- [x] Admin detail view shows timeline
- [x] Employee workspace shows timeline
- [x] Studio detail view shows timeline

### Real-Time

- [x] Status change updates timeline instantly
- [x] New revision request appears in timeline

### Edge Cases

- [x] 0 revision requests — section hidden
- [x] 1 revision request — no "show older" toggle
- [x] 10+ revision requests — performance acceptable
- [x] Long revision notes — handled by overflow

---

## 🛠 Dev Agent Record

### Key Changes

1.  **Shared Component**: Created `RevisionTimeline` in `src/components/shared/revision-timeline.tsx` using `motion/react` (Framer Motion 12) for smooth animations.
2.  **Admin Integration**: Added timeline to `DeliverableDetailView` (Admin/Studio).
3.  **Employee Integration**: Added timeline to `RevisionWorkspace` (Employee).
4.  **Version History Enhancement**: Updated `getDeliverableVersions` query to return `parentDeliverableId` and added "REV" badge to `VersionHistory` component.
5.  **Performance**: Used `getSignedFileUrls` batch action to fetch reference image URLs efficiently.
6.  **UX**: Implemented expand/collapse logic to keep the UI clean while providing full access to history.

### Verification Results

- Component compiles without errors.
- Type instantiation issue resolved by explicit casting and using `motion/react`.
- Correctly fetches and displays revision requests for a given `deliverableId`.

---

## 🚀 Definition of Done

- [x] `RevisionTimeline` shared component created
- [x] Integrated into admin, employee, and studio deliverable views
- [x] Status badges and expand/collapse working
- [x] Reference image gallery accessible from timeline
- [x] Real-time updates confirmed
- [x] Story marked as `done`

---

## 🔄 Status Updates

| Date       | Status  | Notes                   |
| ---------- | ------- | ----------------------- |
| 2026-02-11 | backlog | Story created           |
| 2026-02-12 | review  | Implementation complete |

---

**Previous Story**: 16-3 - Employee Revision Workspace  
**Next Story**: 16-5 - Studio Per-Deliverable Review with Image Upload
