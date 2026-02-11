# Story 16-5: Studio Per-Deliverable Review with Image Upload

**Epic**: Epic 16 - Deliverable Revision Workflow  
**Status**: backlog  
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

| Depends On                         | Status     | Notes                                    |
| ---------------------------------- | ---------- | ---------------------------------------- |
| **16-1 - Schema & Backend**        | 📋 Backlog | `createRevisionRequest` (studio variant) |
| **16-4 - Revision Timeline**       | 📋 Backlog | Timeline component for status tracking   |
| **6-3 - Client View Deliverables** | 🔄 Partial | Studio can see approved deliverables     |
| **6-4 - Client Approve/Revise**    | ✅ Done    | Base approve/revise mutations exist      |

### Enables

| Story / Epic                    | Notes                                      |
| ------------------------------- | ------------------------------------------ |
| **16-3 - Employee Workspace**   | Employee sees studio revision requests too |
| **Improved Feedback Precision** | Studio feedback attached to specific files |

### Current vs. Proposed UX

```
CURRENT (Project-Level Only):
┌──────────────────────────────────────────────┐
│  FINAL DELIVERABLES                           │
│  ┌──────┐ ┌──────┐ ┌──────┐                  │
│  │ Del1 │ │ Del2 │ │ Del3 │   ← No per-item  │
│  └──────┘ └──────┘ └──────┘     actions       │
│                                               │
│  [✅ Approve All]  [↩ Request Revision]       │  ← Blanket action
│  (single textarea for ALL deliverables)       │
└──────────────────────────────────────────────┘

PROPOSED (Per-Deliverable):
┌──────────────────────────────────────────────┐
│  FINAL DELIVERABLES                           │
│  ┌──────────────────────────────────────────┐ │
│  │ Deliverable 1 — Banner Design           │ │
│  │ preview / download                       │ │
│  │ [✅ Approve]  [↩ Request Changes]       │ │ ← Per-item
│  └──────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────┐ │
│  │ Deliverable 2 — Logo Final              │ │
│  │ preview / download                       │ │
│  │ [✅ Approved ✓] (already approved)      │ │
│  └──────────────────────────────────────────┘ │
│                                               │
│  ⬇️ When all individually reviewed:          │
│  [✅ Confirm All Approved]                    │ ← Final confirm
└──────────────────────────────────────────────┘
```

---

## ✅ Acceptance Criteria

### AC1: Per-Deliverable Action Buttons on Studio Side

- [ ] **Given** I am a Studio user viewing approved deliverables
- [ ] **And** project `actionState: 'awaiting_review'`
- [ ] **Then** each deliverable card has individual "Approve" and "Request Changes" buttons
- [ ] **And** the buttons are styled consistently with the admin deliverable actions

### AC2: Studio Revision Dialog with Image Upload

- [ ] **Given** I click "Request Changes" on a specific deliverable
- [ ] **When** the revision dialog opens
- [ ] **Then** I see:
  - Textarea for general revision notes (required)
  - "Upload Reference Images" button (optional)
  - Thumbnail grid of uploaded images with per-image notes
- [ ] **And** this matches the admin revision page pattern from Story 16-2

### AC3: Per-Deliverable Approve

- [ ] **Given** I click "Approve" on a specific deliverable
- [ ] **Then** that deliverable is marked as studio-approved
- [ ] **And** the button changes to a "Approved ✓" badge
- [ ] **And** no project-level transition happens yet

### AC4: Final Approval Gate

- [ ] **Given** all deliverables have been individually reviewed
- [ ] **When** all are approved
- [ ] **Then** a "Confirm All Approved" button appears
- [ ] **And** clicking it transitions the project to `review_approved` + `delivery` phase
- [ ] **And** this replaces the current blanket "Approve All" button

### AC5: Mixed Approval State

- [ ] **Given** some deliverables are approved and some have revision requests
- [ ] **Then** the project does NOT transition to `review_approved`
- [ ] **And** a summary banner shows: "2 of 3 approved • 1 revision requested"
- [ ] **And** the revision request creates a `revisionRequests` record with studio role

### AC6: Revision Status Tracking

- [ ] **Given** a studio user has requested changes on a deliverable
- [ ] **Then** the deliverable card shows revision status: "Changes Requested → In Progress → Resolved"
- [ ] **And** when employee uploads corrected version, the card updates in real-time
- [ ] **And** the studio can re-review the corrected version

### AC7: Backward Compatibility

- [ ] **Given** the new per-deliverable review system
- [ ] **Then** the legacy blanket "Approve All" and "Request Revision" remain as a fallback
- [ ] **And** they can be removed in a future cleanup once the per-deliverable flow is stable

### AC8: Per-Deliverable to Project-Level Mutation Mapping

> **⚠️ GAP FIX**: The existing codebase has project-level mutations (`clientRequestRevision` and `clientApproveDeliverables`) that operate on the entire project. The new per-deliverable flow must integrate cleanly.

- [ ] **Given** a studio user clicks "Request Changes" on a single deliverable
- [ ] **Then** the system calls `createRevisionRequest` (from Story 16-1) with `requestedByRole: "studio"`
- [ ] **And** it does NOT call `clientRequestRevision` (that's the legacy project-level mutation)
- [ ] **Given** a studio user clicks "Confirm All Approved" after all deliverables are approved
- [ ] **Then** the system calls `clientApproveDeliverables` (the existing project-level mutation)
- [ ] **And** this is the ONLY time a project-level transition happens in the new flow

**Mapping Table**:

```
┌────────────────────────────────────────────────────────────────┐
│ Studio Action              │ Calls Mutation              │ Scope        │
├────────────────────────────────────────────────────────────────┤
│ "Request Changes" on 1 del │ createRevisionRequest       │ Deliverable  │
│ "Approve" on 1 del        │ studioApproveDeliverable*   │ Deliverable  │
│ "Confirm All Approved"     │ clientApproveDeliverables   │ Project      │
│ Legacy: "Request Revision" │ clientRequestRevision       │ Project      │
│ Legacy: "Approve All"      │ clientApproveDeliverables   │ Project      │
└────────────────────────────────────────────────────────────────┘
* = New mutation created in Task C2
```

---

## 📘 Implementation

### Phase A: Studio Deliverable Review Component (~3 points)

#### Task A1: Deliverable Review Card

**File**: `src/components/modules/projects/detail/deliverable-review-card.tsx`

```typescript
"use client";

import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle, RotateCcw, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FilePreview } from "@/components/shared/file-preview";
import { StudioRevisionDialog } from "./studio-revision-dialog";

interface DeliverableReviewCardProps {
  deliverable: {
    _id: Id<"deliverables">;
    name: string;
    version: number;
    status: string;
    minioKey?: string;
    sizeBytes?: number;
  };
  projectId: Id<"projects">;
  signedUrl?: string;
  onApproved?: () => void;
}

export function DeliverableReviewCard({
  deliverable,
  projectId,
  signedUrl,
  onApproved,
}: DeliverableReviewCardProps) {
  const [showRevisionDialog, setShowRevisionDialog] = useState(false);
  const [studioApproved, setStudioApproved] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  // Studio approve is a local state initially;
  // the actual project transition happens via "Confirm All Approved"
  const handleApprove = () => {
    setStudioApproved(true);
    onApproved?.();
    toast.success(`"${deliverable.name}" approved`);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/3 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold text-white">{deliverable.name}</h4>
        <Badge variant="outline" className="text-[10px]">
          v{deliverable.version}
        </Badge>
      </div>

      {/* Preview */}
      <div className="rounded-xl overflow-hidden mb-3">
        {signedUrl && <FilePreview url={signedUrl} name={deliverable.name} />}
      </div>

      {/* Actions */}
      {studioApproved ? (
        <div className="flex items-center gap-2 text-emerald-400">
          <CheckCircle className="h-4 w-4" />
          <span className="text-xs font-bold uppercase">Approved</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="rounded-xl border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10"
            onClick={handleApprove}
          >
            <CheckCircle className="h-3.5 w-3.5 mr-1" />
            Approve
          </Button>
          <Button
            variant="outline"
            className="rounded-xl border-red-500/20 text-red-400 hover:bg-red-500/10"
            onClick={() => setShowRevisionDialog(true)}
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            Request Changes
          </Button>
        </div>
      )}

      {/* Revision Dialog */}
      <StudioRevisionDialog
        open={showRevisionDialog}
        onOpenChange={setShowRevisionDialog}
        deliverableId={deliverable._id}
        deliverableName={deliverable.name}
      />
    </div>
  );
}
```

- [ ] A1.1 Create `DeliverableReviewCard` component
- [ ] A1.2 Per-deliverable Approve and Request Changes buttons
- [ ] A1.3 Approved state badge display
- [ ] A1.4 File preview integration
- [ ] A1.5 Opens `StudioRevisionDialog` on "Request Changes"

#### Task A2: Studio Revision Dialog with Image Upload

**File**: `src/components/modules/projects/detail/studio-revision-dialog.tsx`

```typescript
// Enhanced version of ClientRevisionDialog:
// - Textarea for general notes (required)
// - Multi-image upload section (optional)
// - Per-image note fields
// - Calls createRevisionRequest mutation with studio role
```

- [ ] A2.1 Create `StudioRevisionDialog` component (Sheet or full dialog)
- [ ] A2.2 General revision notes textarea
- [ ] A2.3 Image upload using existing MinIO pattern
- [ ] A2.4 Thumbnail grid with per-image notes
- [ ] A2.5 Submit calls `createRevisionRequest` mutation
- [ ] A2.6 Loading states and error handling

---

### Phase B: Update Deliverables Section (~2 points)

#### Task B1: Replace Blanket with Per-Deliverable Review

**File**: `src/components/modules/projects/detail/deliverables-section.tsx`

Replace the current card-only display with `DeliverableReviewCard` components when project is in `awaiting_review`:

```typescript
// BEFORE:
{deliverables.map(d => <DeliverableCard key={d._id} ... />)}

// AFTER:
{deliverables.map(d => (
  project.actionState === "awaiting_review"
    ? <DeliverableReviewCard key={d._id} deliverable={d} ... />
    : <DeliverableCard key={d._id} ... />
))}
```

- [ ] B1.1 Conditionally render `DeliverableReviewCard` in review state
- [ ] B1.2 Keep `DeliverableCard` for non-review states

#### Task B2: Approval Summary Banner

**File**: `src/components/modules/projects/detail/deliverables-section.tsx`

Add a summary banner showing approval progress:

```typescript
// "2 of 3 approved • 1 revision requested"
<ApprovalProgressBanner
  total={deliverables.length}
  approved={approvedCount}
  revisionsRequested={revisionsCount}
  onConfirmAll={() => clientApproveDeliverables({ projectId })}
/>
```

- [ ] B2.1 Create `ApprovalProgressBanner` component
- [ ] B2.2 Track per-deliverable approval state
- [ ] B2.3 "Confirm All Approved" button when all approved
- [ ] B2.4 Calls existing `clientApproveDeliverables` mutation

#### Task B3: Revision Status Tracker on Cards

**File**: `src/components/modules/projects/detail/revision-status-tracker.tsx`

Small inline component showing revision status on deliverable cards:

```typescript
// Displays: "📝 Changes Requested" → "⏳ In Progress" → "✅ Resolved"
```

- [ ] B3.1 Create `RevisionStatusTracker` component
- [ ] B3.2 Integrates into `DeliverableReviewCard`
- [ ] B3.3 Real-time status updates via Convex subscriptions

---

### Phase C: Backend Adjustments (~1.5 points)

#### Task C1: Studio-Specific Queries

**File**: `convex/functions/deliverables/queries.ts`

Enhance `getClientDeliverables` to include revision request data:

```typescript
// For each deliverable, also return:
// - Latest revision request status (if any)
// - Count of revision requests
// - Whether currently in revision
```

- [ ] C1.1 Enhance `getClientDeliverables` to include revision data
- [ ] C1.2 Add `studioApprovalStatus` field per deliverable (approved/revising/pending)

#### Task C2: Per-Deliverable Studio Approval Tracking

> **⚠️ GAP FIX**: Must define how per-deliverable approvals integrate with the existing project-level `clientApproveDeliverables` and `clientRequestRevision` mutations.

**Recommended Approach**: Thin `studioApprovals` table (Option B) because:

- Keeps `deliverableStatusValidator` unchanged (no need for a new `studio_approved` status)
- Allows tracking who approved what and when
- Clean separation from admin QC status

```typescript
// NEW table in schema.ts:
studioApprovals: defineTable({
  deliverableId: v.id("deliverables"),
  projectId: v.id("projects"),
  studioProfileId: v.id("profiles"),
  approvedAt: v.number(),
})
  .index("by_deliverableId", ["deliverableId"])
  .index("by_projectId", ["projectId"]),

// NEW mutation:
export const studioApproveDeliverable = mutation({
  args: {
    deliverableId: v.id("deliverables"),
  },
  handler: async (ctx, args) => {
    const { profile } = await getAuthUserWithProfile(ctx);
    // Verify studio role
    // Insert into studioApprovals
    // Does NOT call clientApproveDeliverables (that's the final confirm)
    // Does NOT transition project state
  },
});
```

**Integration with existing project-level mutations**:

```
Per-Deliverable Flow:
1. Studio clicks "Request Changes" on Del 1 → calls createRevisionRequest(deliverableId, role:"studio")
2. Studio clicks "Approve" on Del 2 → calls studioApproveDeliverable(deliverableId)
3. Studio clicks "Approve" on Del 3 → calls studioApproveDeliverable(deliverableId)
4. Employee fixes Del 1 → uploads via uploadCorrectedVersion(parentDeliverableId)
5. Admin re-approves corrected Del 1 → studio sees updated version
6. Studio clicks "Approve" on corrected Del 1 → calls studioApproveDeliverable(deliverableId)
7. All approved → "Confirm All" button appears → calls clientApproveDeliverables(projectId)

❌ Does NOT call clientRequestRevision at any point in per-deliverable flow
✅ clientRequestRevision remains available as legacy fallback only
```

- [ ] C2.1 Create `studioApprovals` table in schema
- [ ] C2.2 Create `studioApproveDeliverable` mutation (deliverable-level, no project transition)
- [ ] C2.3 Create query to check studio approval status per deliverable in a project
- [ ] C2.4 "Confirm All Approved" button calls existing `clientApproveDeliverables` (project-level)
- [ ] C2.5 Ensure `createRevisionRequest` with `role: studio` does NOT call `clientRequestRevision`
- [ ] C2.6 Mark `clientRequestRevision` as `@deprecated` (legacy fallback only)

---

### Phase D: Styling & Polish (~1 point)

- [ ] D1.1 Review cards with hover effects and transitions
- [ ] D1.2 Approved state visual treatment (green checkmark badge)
- [ ] D1.3 "Request Changes" button with warning styling
- [ ] D1.4 Summary banner with progress bar
- [ ] D1.5 Revision dialog consistent with admin revision page styling
- [ ] D1.6 Mobile responsive layout

---

## 🧪 Testing Checklist

### Per-Deliverable Actions

- [ ] "Approve" button marks individual deliverable as approved
- [ ] "Request Changes" opens revision dialog
- [ ] Approved badge shows correctly
- [ ] Actions only visible when project is in `awaiting_review`

### Revision Dialog

- [ ] Notes field is required
- [ ] Images upload successfully
- [ ] Per-image notes save correctly
- [ ] Creates `revisionRequests` record with studio role
- [ ] Success toast shown

### Approval Flow

- [ ] Cannot finalize until all deliverables reviewed
- [ ] Summary banner shows correct counts
- [ ] "Confirm All Approved" transitions project to delivery

### Real-Time

- [ ] Employee uploads corrected version → studio card updates
- [ ] Revision status tracker updates automatically

### Edge Cases

- [ ] Single deliverable project — approve immediately enables confirm
- [ ] All deliverables have revisions — no confirm button
- [ ] Mix of approved and revision-requested — correct summary
- [ ] Studio refreshes page — approval states persist (if tracked server-side)

---

## 🚀 Definition of Done

- [ ] `DeliverableReviewCard` with per-deliverable actions
- [ ] `StudioRevisionDialog` with image upload
- [ ] `ApprovalProgressBanner` with summary and confirm button
- [ ] `RevisionStatusTracker` showing real-time revision state
- [ ] `getClientDeliverables` enhanced with revision data
- [ ] `studioApprovals` table + `studioApproveDeliverable` mutation
- [ ] "Confirm All" calls `clientApproveDeliverables` (project-level only)
- [ ] Studio "Request Changes" calls `createRevisionRequest` (deliverable-level only)
- [ ] `clientRequestRevision` marked `@deprecated`
- [ ] Backward compatibility with existing blanket approve/revise
- [ ] Story marked as `done`

---

## 🔄 Status Updates

| Date       | Status  | Notes         |
| ---------- | ------- | ------------- |
| 2026-02-11 | backlog | Story created |

---

**Previous Story**: 16-4 - Revision History Timeline  
**Next Story**: 16-6 - PDF/Image Annotation Layer (Future)
