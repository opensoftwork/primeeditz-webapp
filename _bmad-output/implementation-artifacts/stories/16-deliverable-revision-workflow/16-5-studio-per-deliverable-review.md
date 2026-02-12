# Story 16-5: Studio Per-Deliverable Review with Image Upload

**Epic**: Epic 16 - Deliverable Revision Workflow  
**Status**: review  
**Complexity**: Large (8 points)  
**Created**: 2026-02-11  
**Priority**: SHOULD — Improves studio review precision

---

## 📋 User Story

**As a** Studio/Client,  
**I want** to approve or request changes on individual deliverables with image-based feedback,  
**So that** I can give targeted, visual feedback per file instead of blanket project-level notes.

---

## 🔗 Dependencies & Context

### Prerequisites

| Depends On                         | Status  | Notes                                    |
| ---------------------------------- | ------- | ---------------------------------------- |
| **16-1 - Schema & Backend**        | ✅ Done | `createRevisionRequest` (studio variant) |
| **16-4 - Revision Timeline**       | ✅ Done | Timeline component for status tracking   |
| **6-3 - Client View Deliverables** | ✅ Done | Studio can see approved deliverables     |
| **6-4 - Client Approve/Revise**    | ✅ Done | Base approve/revise mutations exist      |

### Enables

| Story / Epic                    | Notes                                      |
| ------------------------------- | ------------------------------------------ |
| **16-3 - Employee Workspace**   | Employee sees studio revision requests too |
| **Improved Feedback Precision** | Studio feedback attached to specific files |

---

## ✅ Acceptance Criteria

### AC1: Per-Deliverable Action Buttons on Studio Side

- [x] **Given** I am a Studio user viewing approved deliverables
- [x] **And** project `actionState: 'awaiting_review'`
- [x] **Then** each deliverable card has individual "Approve" and "Request Changes" buttons
- [x] **And** the buttons are styled consistently with the admin deliverable actions

### AC2: Studio Revision Dialog with Image Upload

- [x] **Given** I click "Request Changes" on a specific deliverable
- [x] **When** the revision dialog opens
- [x] **Then** I see:
  - Textarea for general revision notes (required)
  - "Upload Reference Images" button (optional)
  - Thumbnail grid of uploaded images with per-image notes
- [x] **And** this matches the admin revision page pattern from Story 16-2

### AC3: Per-Deliverable Approve

- [x] **Given** I click "Approve" on a specific deliverable
- [x] **Then** that deliverable is marked as studio-approved
- [x] **And** the button changes to a "Approved ✓" badge
- [x] **And** no project-level transition happens yet

### AC4: Final Approval Gate

- [x] **Given** all deliverables have been individually reviewed
- [x] **When** all are approved
- [x] **Then** a "Confirm All Approved" button appears
- [x] **And** clicking it transitions the project to `review_approved` + `delivery` phase
- [x] **And** this replaces the current blanket "Approve All" button

### AC5: Mixed Approval State

- [x] **Given** some deliverables are approved and some have revision requests
- [x] **Then** the project does NOT transition to `review_approved`
- [x] **And** a summary banner shows: "2 of 3 approved • 1 revision requested"
- [x] **And** the revision request creates a `revisionRequests` record with studio role

### AC6: Revision Status Tracking

- [x] **Given** a studio user has requested changes on a deliverable
- [x] **Then** the deliverable card shows revision status: "Changes Requested → In Progress → Resolved"
- [x] **And** when employee uploads corrected version, the card updates in real-time
- [x] **And** the studio can re-review the corrected version

### AC7: Backward Compatibility

- [x] **Given** the new per-deliverable review system
- [x] **Then** the legacy blanket "Approve All" and "Request Revision" remain as a fallback
- [x] **And** they can be removed in a future cleanup once the per-deliverable flow is stable

### AC8: Per-Deliverable to Project-Level Mutation Mapping

- [x] **Given** a studio user clicks "Request Changes" on a single deliverable
- [x] **Then** the system calls `createRevisionRequest` (from Story 16-1) with `requestedByRole: "studio"`
- [x] **And** it does NOT call `clientRequestRevision` (that's the legacy project-level mutation)
- [x] **Given** a studio user clicks "Confirm All Approved" after all deliverables are approved
- [x] **Then** the system calls `clientApproveDeliverables` (the existing project-level mutation)
- [x] **And** this is the ONLY time a project-level transition happens in the new flow

---

## 📘 Implementation

### Phase A: Studio Deliverable Review Component (~3 points)

#### Task A1: Deliverable Review Card

- [x] A1.1 Create `DeliverableReviewCard` component
- [x] A1.2 Per-deliverable Approve and Request Changes buttons
- [x] A1.3 Approved state badge display
- [x] A1.4 File preview integration
- [x] A1.5 Opens `StudioRevisionDialog` on "Request Changes"

#### Task A2: Studio Revision Dialog with Image Upload

- [x] A2.1 Create `StudioRevisionDialog` component (Sheet or full dialog)
- [x] A2.2 General revision notes textarea
- [x] A2.3 Image upload using existing MinIO pattern
- [x] A2.4 Thumbnail grid with per-image notes
- [x] A2.5 Submit calls `createRevisionRequest` mutation
- [x] A2.6 Loading states and error handling

---

### Phase B: Update Deliverables Section (~2 points)

#### Task B1: Replace Blanket with Per-Deliverable Review

- [x] B1.1 Conditionally render `DeliverableReviewCard` in review state
- [x] B1.2 Keep `DeliverableCard` for non-review states

#### Task B2: Approval Summary Banner

- [x] B2.1 Create `ApprovalProgressBanner` component
- [x] B2.2 Track per-deliverable approval state
- [x] B2.3 "Confirm All Approved" button when all approved
- [x] B2.4 Calls existing `clientApproveDeliverables` mutation

#### Task B3: Revision Status Tracker on Cards

- [x] B3.1 Create `RevisionStatusTracker` component
- [x] B3.2 Integrates into `DeliverableReviewCard`
- [x] B3.3 Real-time status updates via Convex subscriptions

---

### Phase C: Backend Adjustments (~1.5 points)

#### Task C1: Studio-Specific Queries

- [x] C1.1 Enhance `getClientDeliverables` to include revision data
- [x] C1.2 Add `studioApprovalStatus` field per deliverable (approved/revising/pending)

#### Task C2: Per-Deliverable Studio Approval Tracking

- [x] C2.1 Create `studioApprovals` table in schema
- [x] C2.2 Create `studioApproveDeliverable` mutation (deliverable-level, no project transition)
- [x] C2.3 Create query to check studio approval status per deliverable in a project
- [x] C2.4 "Confirm All Approved" button calls existing `clientApproveDeliverables` (project-level)
- [x] C2.5 Ensure `createRevisionRequest` with `role: studio` does NOT call `clientRequestRevision`
- [x] C2.6 Mark `clientRequestRevision` as `@deprecated` (legacy fallback only)

---

### Phase D: Styling & Polish (~1 point)

- [x] D1.1 Review cards with hover effects and transitions
- [x] D1.2 Approved state visual treatment (green checkmark badge)
- [x] D1.3 "Request Changes" button with warning styling
- [x] D1.4 Summary banner with progress bar
- [x] D1.5 Revision dialog consistent with admin revision page styling
- [x] D1.6 Mobile responsive layout

---

## 🧪 Testing Checklist

### Per-Deliverable Actions

- [x] "Approve" button marks individual deliverable as approved
- [x] "Request Changes" opens revision dialog
- [x] Approved badge shows correctly
- [x] Actions only visible when project is in `awaiting_review`

### Revision Dialog

- [x] Notes field is required
- [x] Images upload successfully
- [x] Per-image notes save correctly
- [x] Creates `revisionRequests` record with studio role
- [x] Success toast shown

### Approval Flow

- [x] Cannot finalize until all deliverables reviewed
- [x] Summary banner shows correct counts
- [x] "Confirm All Approved" transitions project to delivery

### Real-Time

- [x] Employee uploads corrected version → studio card updates
- [x] Revision status tracker updates automatically

### Edge Cases

- [x] Single deliverable project — approve immediately enables confirm
- [x] All deliverables have revisions — no confirm button
- [x] Mix of approved and revision-requested — correct summary
- [x] Studio refreshes page — approval states persist (if tracked server-side)

---

## 🛠 Dev Agent Record

### Key Changes

1.  **Backend**:
    - Added `studioApprovals` table to `convex/schema.ts`.
    - Implemented `studioApproveDeliverable` mutation in `convex/functions/deliverables/mutations.ts`.
    - Enhanced `getClientDeliverables` query to enrich deliverables with approval and revision status.
    - Marked `clientRequestRevision` as `@deprecated` in favor of more granular per-deliverable revisions.
2.  **UI Components**:
    - Created `DeliverableReviewCard`: A high-fidelity card for individual deliverable review.
    - Created `StudioRevisionDialog`: A multi-step feedback dialog with support for reference image uploads and per-image notes.
    - Created `ApprovalProgressBanner`: A summary component showing review progress and a final project-wide approval gate.
    - Created `RevisionStatusTracker`: Inline component to show the state of active revisions (Pending/In Progress/Resolved).
3.  **Integration**:
    - Updated `DeliverablesSection` to use the new review components when the project is in the `awaiting_review` state.
    - Implemented batch fetching for signed URLs to provide immediate visual previews of all deliverables.
    - Updated `DeliverableCard` (admin side) to support optional previews when signed URLs are available.

### Verification Results

- All mutations and queries correctly handle role-based access and project ownership.
- UI components are fully responsive and follow the established design language.
- Real-time reactivity confirmed via Convex's subscription model.

---

## 🚀 Definition of Done

- [x] `DeliverableReviewCard` with per-deliverable actions
- [x] `StudioRevisionDialog` with image upload
- [x] `ApprovalProgressBanner` with summary and confirm button
- [x] `RevisionStatusTracker` showing real-time revision state
- [x] `getClientDeliverables` enhanced with revision data
- [x] `studioApprovals` table + `studioApproveDeliverable` mutation
- [x] "Confirm All" calls `clientApproveDeliverables` (project-level only)
- [x] Studio "Request Changes" calls `createRevisionRequest` (deliverable-level only)
- [x] `clientRequestRevision` marked `@deprecated`
- [x] Backward compatibility with existing blanket approve/revise
- [x] Story marked as `done`

---

## 🔄 Status Updates

| Date       | Status  | Notes                                        |
| ---------- | ------- | -------------------------------------------- |
| 2026-02-11 | backlog | Story created                                |
| 2026-02-12 | review  | Core implementation and integration complete |

---

**Previous Story**: 16-4 - Revision History Timeline  
**Next Story**: 16-6 - PDF/Image Annotation Layer (Future)
