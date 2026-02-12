# Story 16-3: Employee Revision Workspace

**Epic**: Epic 16 - Deliverable Revision Workflow  
**Status**: review  
**Complexity**: Large (10 points)  
**Created**: 2026-02-11  
**Priority**: MUST — Completes the admin→employee revision cycle

---

## 📋 User Story

**As an** Employee,  
**I want** a dedicated revision page showing the original deliverable alongside revision reference images and notes,  
**So that** I can understand exactly what corrections are needed and upload a corrected version.

---

## 🔗 Dependencies & Context

### Prerequisites

| Depends On                     | Status     | Notes                               |
| ------------------------------ | ---------- | ----------------------------------- |
| **16-1 - Schema & Backend**    | 📋 Backlog | `getRevisionRequests` query         |
| **16-2 - Admin Revision Page** | 📋 Backlog | Revision requests with images exist |
| **6-1 - Upload Deliverables**  | ✅ Done    | Employee upload pattern             |

### Enables

| Story / Epic                 | Notes                              |
| ---------------------------- | ---------------------------------- |
| **16-4 - Revision Timeline** | Resolved status shows in timeline  |
| **Admin Review Cycle**       | Admin can review corrected version |

### Proposed UX

```
┌────────────────────────────────────────────────────────────────────┐
│  ← Back    REVISION WORKSPACE — QUOTATION_QT-000001_V1-1.PDF      │
│            Revision #2 • Requested by Admin (John)                  │
│  ──────────────────────────────────────────────────────────────── │
│                                                                    │
│  ┌─────────────────────────┐  ┌──────────────────────────────────┐│
│  │                         │  │  ⚠️ REVISION NOTES              ││
│  │                         │  │  "Fix color grading on the       ││
│  │   ORIGINAL DELIVERABLE  │  │   banner and adjust the font    ││
│  │   (Current Version)     │  │   size on the footer section"   ││
│  │                         │  │                                  ││
│  │                         │  │  📎 REFERENCE IMAGES (3)         ││
│  └─────────────────────────┘  │  ┌───────────────────────────┐  ││
│                                │  │         🖼️               │  ││
│                                │  │   ref-banner-fix.png     │  ││
│                                │  │   "See the color diff"   │  ││
│                                │  └───────────────────────────┘  ││
│                                │  ┌───────────────────────────┐  ││
│                                │  │         🖼️               │  ││
│                                │  │   ref-footer.png         │  ││
│                                │  │   "Font should be 14px"  │  ││
│                                │  └───────────────────────────┘  ││
│                                │                                  ││
│                                │  ┌──────────────────────────┐   ││
│                                │  │ 📤 UPLOAD CORRECTED      │   ││
│                                │  │    VERSION               │   ││
│                                │  └──────────────────────────┘   ││
│                                └──────────────────────────────────┘│
└────────────────────────────────────────────────────────────────────┘
```

---

## ✅ Acceptance Criteria

### AC1: Navigate to Revision Workspace

- [x] **Given** I am an employee viewing a deliverable with status `revision_requested`
- [x] **When** I click on the revision notification banner or the deliverable card
- [x] **Then** I am navigated to the revision workspace page
- [x] **And** the page shows the revision request details

### AC2: Original Deliverable Preview

- [x] **Given** I am on the revision workspace
- [x] **Then** the left panel shows the original deliverable preview
- [x] **And** I can download the original file
- [x] **And** the preview uses the existing `FilePreview` component

### AC3: Revision Request Details

- [ ] **Given** I am on the revision workspace
- [ ] **Then** the right panel shows:
  - Revision number (e.g., "Revision #2")
  - Requested by name and role
  - Request date
  - General revision notes (prominently displayed)

### AC4: Reference Images Display

- [ ] **Given** the revision request has reference images
- [ ] **Then** reference images are displayed as a scrollable list
- [ ] **And** each image shows the thumbnail and its per-image note
- [ ] **And** clicking an image opens it in a lightbox/expanded view
- [ ] **And** images have signed URLs for display
- [ ] **Given** the revision request has no reference images
- [ ] **Then** the "Reference Images" section is hidden

### AC5: Upload Corrected Version

- [x] **Given** I am viewing the revision workspace
- [x] **When** I click "Upload Corrected Version"
- [x] **Then** a file picker opens for selecting the corrected file
- [x] **And** the file uploads to MinIO via signed URL
- [x] **And** a new deliverable version is created (v2, v3, etc.)
- [x] **And** the pending revision request is resolved with `resolvedDeliverableId`
- [x] **And** deliverable goes back to `pending_qc` for admin review
- [x] **And** success toast: "Corrected version uploaded! Admin will review."
- [x] **And** I am navigated back to the deliverable list

### AC6: Mark as In Progress

- [ ] **Given** I open the revision workspace for the first time
- [ ] **When** the page loads
- [ ] **Then** the revision request status is automatically updated to `in_progress`
- [ ] **And** the admin can see this status change in real-time

### AC7: Multiple Revision Requests

- [ ] **Given** a deliverable has multiple revision requests
- [ ] **Then** the workspace shows only the latest pending/in_progress request
- [ ] **And** a "View All Revisions" link shows the full timeline (Story 16-4)
- [ ] **And** resolved revision requests are shown as collapsed/dimmed

### AC8: Revision Notification Alert

> **⚠️ GAP FIX**: Without an explicit alert, the employee only discovers revision requests by manually browsing their deliverable list.

- [ ] **Given** admin or studio creates a revision request on my deliverable
- [ ] **Then** the `DeliverableStatusBanner` shows a prominent revision notification
- [ ] **And** the employee's project detail page shows a persistent banner: "⚠️ Revision Requested — [Go to Revision Workspace]"
- [ ] **And** the badge is styled distinctly (amber/red) to draw attention
- [ ] **And** the banner links directly to the revision workspace page

### AC9: Existing Deliverable Detail Page Integration

> **⚠️ GAP FIX**: There is already a route at `@employee/.../deliverables/[deliverableId]/page.tsx`. When a deliverable has a pending revision, this page should redirect or prominently link to the revision workspace.

- [ ] **Given** I am an employee viewing a deliverable detail page (existing route)
- [ ] **And** the deliverable has status `revision_requested`
- [ ] **Then** the page shows a prominent banner: "This deliverable has a pending revision — [Open Revision Workspace]"
- [ ] **Or** automatically redirects to the revision workspace route

---

## 📘 Implementation

### Phase A: Route Setup (~0.5 points)

#### Task A1: Create Employee Revision Workspace Route

**File**: `src/app/(protected)/@employee/assigned-work/[projectId]/deliverables/[deliverableId]/revision/page.tsx`

```typescript
"use client";

import { use } from "react";
import { RevisionWorkspace } from "@/components/modules/employee/assigned-work/details/revision-workspace";

interface RevisionPageProps {
  params: Promise<{
    projectId: string;
    deliverableId: string;
  }>;
}

export default function EmployeeRevisionPage({ params }: RevisionPageProps) {
  const { projectId, deliverableId } = use(params);
  return <RevisionWorkspace projectId={projectId} deliverableId={deliverableId} />;
}
```

- [ ] A1.1 Create route file

---

### Phase B: Revision Workspace Component (~4 points)

#### Task B1: Main Workspace Container

**File**: `src/components/modules/employee/assigned-work/details/revision-workspace.tsx`

```typescript
"use client";

import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useQuery, useMutation, useAction } from "convex/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  AlertTriangle,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilePreview } from "@/components/shared/file-preview";
import { RevisionReferenceViewer } from "./revision-reference-viewer";

interface RevisionWorkspaceProps {
  projectId: string;
  deliverableId: string;
}

export function RevisionWorkspace({
  projectId,
  deliverableId,
}: RevisionWorkspaceProps) {
  const router = useRouter();

  const deliverable = useQuery(
    api.functions.deliverables.queries.getDeliverable,
    { deliverableId: deliverableId as Id<"deliverables"> },
  );

  const revisionRequests = useQuery(
    api.functions.deliverables.queries.getRevisionRequests,
    { deliverableId: deliverableId as Id<"deliverables"> },
  );

  const updateStatus = useMutation(
    api.functions.deliverables.mutations.updateRevisionRequestStatus,
  );

  // Auto-mark as in_progress when first viewed
  const latestPending = revisionRequests?.find((r) => r.status === "pending");
  useEffect(() => {
    if (latestPending) {
      updateStatus({ requestId: latestPending._id, status: "in_progress" });
    }
  }, [latestPending?._id]);

  // Get the active (latest non-resolved) revision request
  const activeRequest = revisionRequests?.find(
    (r) => r.status === "pending" || r.status === "in_progress",
  );

  // ... render split-pane: preview | revision details + upload
}
```

- [ ] B1.1 Create `RevisionWorkspace` component with split layout
- [ ] B1.2 Fetch deliverable and revision requests
- [ ] B1.3 Auto-mark latest pending request as `in_progress`
- [ ] B1.4 Left panel: original deliverable preview
- [ ] B1.5 Right panel: revision details + reference images + upload

#### Task B2: Revision Reference Viewer

**File**: `src/components/modules/employee/assigned-work/details/revision-reference-viewer.tsx`

```typescript
// Displays:
// - Revision notes prominently (warning-styled box)
// - Reference images as scrollable card list
// - Per-image notes below each thumbnail
// - Click to expand/lightbox
// - Requester info + date
```

- [ ] B2.1 Create `RevisionReferenceViewer` component
- [ ] B2.2 Warning-styled revision notes box
- [ ] B2.3 Reference image cards with thumbnails
- [ ] B2.4 Per-image notes display
- [ ] B2.5 Image lightbox on click
- [ ] B2.6 Fetch signed URLs for reference images

#### Task B3: Corrected Version Upload

**File**: `src/components/modules/employee/assigned-work/details/corrected-upload.tsx`

```typescript
// Handles:
// - File picker for corrected deliverable
// - Upload to MinIO (reuse existing pattern)
// - Calls `uploadCorrectedVersion` mutation (NOT `uploadDeliverable`)
//   → This mutation from Story 16-1 handles:
//     • Creating new version with parentDeliverableId
//     • Auto-resolving pending revision requests
//     • Transitioning project state to deliverables_ready
// - Success feedback + navigation
```

- [ ] B3.1 Create `CorrectedUpload` component
- [ ] B3.2 File picker matching original deliverable type
- [ ] B3.3 Upload via signed URL with progress
- [ ] B3.4 Call `uploadCorrectedVersion` mutation (from Story 16-1, NOT `uploadDeliverable`)
- [ ] B3.5 Pass `parentDeliverableId` to link corrected version to original
- [ ] B3.6 Success toast + navigate back

---

### Phase C: Integration (~1.5 points)

#### Task C1: Link from Deliverable Status Banner

**File**: `src/components/shared/status-banners/deliverable-status-banner.tsx`

Update the banner's "View Details" link to point to the revision workspace when the deliverable has `revision_requested` status:

```typescript
// For employees, link to revision workspace instead of detail page
const href =
  role === "employee" && change.status === "revision_requested"
    ? `/assigned-work/${projectId}/deliverables/${change._id}/revision`
    : `/projects/${projectId}/deliverables/${change._id}`;
```

- [ ] C1.1 Update banner links for employee role
- [ ] C1.2 Add revision icon/indicator to banner

#### Task C2: Link from Employee Deliverable Card

**File**: `src/components/modules/employee/assigned-work/details/deliverables.tsx`

Add a "Fix Revision" button or badge on deliverable cards with `revision_requested` status:

- [ ] C2.1 Add revision badge/indicator on employee deliverable cards
- [ ] C2.2 Card click navigates to revision workspace for revision-requested deliverables

#### Task C3: Signed URLs for Reference Images

Ensure `getRevisionRequests` query returns reference images with signed URLs, or add a separate action:

- [ ] C3.1 Create action to generate signed URLs for revision reference images
- [ ] C3.2 Integrate into revision workspace data fetching

#### Task C4: Update Existing Employee Deliverable Detail Page

**File**: `src/app/(protected)/@employee/assigned-work/[projectId]/deliverables/[deliverableId]/page.tsx`

> **⚠️ GAP FIX**: This route already exists and renders a deliverable detail view. When a deliverable has an active revision request, the employee should be guided to the revision workspace instead.

```typescript
// Option A: Add a prominent banner at the top
if (deliverable?.status === "revision_requested") {
  return (
    <>
      <RevisionRequiredBanner
        deliverableId={deliverableId}
        projectId={projectId}
        href={`/assigned-work/${projectId}/deliverables/${deliverableId}/revision`}
      />
      {/* ... existing detail content below ... */}
    </>
  );
}

// Option B: Automatic redirect
if (deliverable?.status === "revision_requested") {
  router.replace(`/assigned-work/${projectId}/deliverables/${deliverableId}/revision`);
  return null;
}
```

- [ ] C4.1 Check deliverable status on load
- [ ] C4.2 If `revision_requested`: show prominent banner OR redirect to workspace
- [ ] C4.3 Banner includes: revision notes preview, requester info, "Open Workspace" CTA

#### Task C5: Revision Alert on Employee Project Detail

**File**: `src/components/modules/employee/assigned-work/details/index.tsx`

> **⚠️ GAP FIX**: The employee project detail page needs to highlight when any deliverable has a pending revision, so the employee doesn't miss it.

```typescript
// Add a prominent section above the deliverables list:
{hasRevisionsRequested && (
  <motion.div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-6">
    <div className="flex items-center gap-3">
      <AlertTriangle className="h-5 w-5 text-amber-400" />
      <div>
        <h4 className="text-sm font-black uppercase text-amber-400">Revision Required</h4>
        <p className="text-xs text-white/60">
          {revisionsCount} deliverable(s) need corrections. Open the revision workspace to see details.
        </p>
      </div>
    </div>
  </motion.div>
)}
```

- [ ] C5.1 Query for deliverables with `revision_requested` status in project
- [ ] C5.2 Show amber alert banner with count of pending revisions
- [ ] C5.3 Banner links to revision workspace page for each deliverable

---

### Phase D: Styling & Polish (~1 point)

- [x] D1.1 Split-pane layout: Preview (left, 55%) + Workspace (right, 45%)
- [x] D1.2 Responsive: Stack vertically on mobile
- [x] D1.3 Revision notes in amber/warning-styled card
- [x] D1.4 Reference images with subtle borders and hover effects
- [x] D1.5 Upload area with drag-and-drop zone styling
- [x] D1.6 "Corrected version uploaded" success animation

---

## 🧪 Testing Checklist

### Navigation

- [ ] Status banner "View Details" links to revision workspace for employees
- [ ] Deliverable card click navigates to revision workspace
- [ ] Back button returns to assigned work
- [ ] Breadcrumbs correct

### Revision Display

- [ ] Revision notes displayed prominently
- [ ] Revision number shown (e.g., "Revision #2")
- [ ] Requester name and role displayed
- [ ] Reference images loaded with signed URLs
- [ ] Per-image notes visible
- [ ] Images expandable on click

### Auto-Status Update

- [ ] Opening workspace marks revision as `in_progress`
- [ ] Status update visible to admin in real-time

### Upload Corrected Version

- [ ] File picker opens
- [ ] Upload progress shown
- [ ] New deliverable version created
- [ ] Revision request marked as `resolved`
- [ ] Deliverable goes to `pending_qc`
- [ ] Success toast shown
- [ ] Navigate back after success

### Edge Cases

- [ ] Deliverable with no revision requests — shows "No revisions" message
- [ ] Revision request with no reference images — images section hidden
- [ ] Multiple revision requests — latest active shown, others collapsed
- [ ] Upload failure — error toast, no state changes

---

## 🚀 Definition of Done

- [ ] Revision workspace route at `@employee/.../revision/page.tsx`
- [ ] `RevisionWorkspace` component with split layout
- [ ] `RevisionReferenceViewer` component with images + notes
- [ ] `CorrectedUpload` component using `uploadCorrectedVersion` mutation
- [ ] Status banner links updated for employee role
- [ ] Employee deliverable cards show revision indicator
- [ ] **Existing** employee deliverable detail page updated (banner/redirect for revisions)
- [ ] **Revision alert** on employee project detail page for pending revisions
- [ ] Auto-mark revision as `in_progress` on open
- [ ] Story marked as `done`

---

## 🔄 Status Updates

| Date       | Status      | Notes                  |
| ---------- | ----------- | ---------------------- |
| 2026-02-11 | backlog     | Story created          |
| 2026-02-12 | in-progress | Started implementation |

---

## 📝 Dev Agent Record

### 🏗️ Implementation Plan

1. **Phase A: Route Setup**
   - Create route at `src/app/(protected)/@employee/assigned-work/[projectId]/deliverables/[deliverableId]/revision/page.tsx`.
2. **Phase B: Revision Workspace Component**
   - Create `RevisionWorkspace` container in `src/components/modules/employee/assigned-work/details/revision-workspace.tsx`.
   - Implement `RevisionReferenceViewer` for admin notes and images.
   - Implement `CorrectedUpload` for employee corrected file upload.
3. **Phase C: Integration (Gaps & Banners)**
   - Link from `DeliverableStatusBanner`.
   - Add revision alert to employee project detail.
   - Redirect/Banner on existing deliverable page.
4. **Phase D: Styling & Polish**
   - Dark mode premium aesthetic, split layout.

### 📜 Debug Log

- [2026-02-12 11:30] Initializing story 16-3. Resolved project context and sprint status.

### ✅ Completion Notes

- (In progress)

---

**Previous Story**: 16-2 - Admin Revision Page with Image Upload  
**Next Story**: 16-4 - Revision History Timeline
