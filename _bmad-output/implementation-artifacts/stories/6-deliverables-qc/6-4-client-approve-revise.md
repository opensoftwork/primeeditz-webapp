# Story 6-4: Client Approve or Request Revision

**Epic**: Epic 6 - Deliverables & QC Workflow  
**Status**: backlog  
**Complexity**: Medium (5 points)  
**Created**: 2026-01-18  
**Updated**: 2026-02-04  
**Priority**: MUST — Final client sign-off

---

## 📋 User Story

**As a** Client (Studio),  
**I want** to approve deliverables or request revisions,  
**So that** I can ensure the final work meets my expectations.

---

## 🔗 Dependencies & Context

### Prerequisites

| Depends On                       | Status         | Notes                       |
| -------------------------------- | -------------- | --------------------------- |
| **6-3 - Client View**            | 🔄 In Progress | Client can see deliverables |
| **5A - Project Status Workflow** | ✅ Done        | Status transitions          |

### Enables

| Story / Epic          | Notes                           |
| --------------------- | ------------------------------- |
| **Epic 7 - Delivery** | Project moves to delivery phase |

### Data Flow

```
Client Portal - Deliverables Tab
      │
      ↓ Review Deliverables
      │
┌─────────────────────────────────────────────────────────────┐
│  🎉 ALL DELIVERABLES REVIEWED                               │
│  ─────────────────────────────────────────────────────────  │
│  3 deliverables ready for your approval                     │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ [✅ Approve All]     [↩ Request Revision]            │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ⚠️ 2/3 revisions used. Additional revisions may           │
│     incur extra charges.                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Acceptance Criteria

### AC1: Approve All

- [x] **Given** I am viewing approved deliverables
- [x] **And** project `actionState: 'awaiting_review'`
- [x] **When** I click "Approve All"
- [x] **Then** project `actionState` → `review_approved`
- [x] **And** project `phase` → `delivery`
- [x] **And** `awaitingActorRole` → `admin`
- [x] **And** download links become active

### AC2: Request Revision

- [x] **Given** I am viewing approved deliverables
- [x] **When** I click "Request Revision"
- [x] **Then** I see a modal to enter revision notes
- [x] **And** when submitted:
  - Project `actionState` → `revisions_requested`
  - `awaitingActorRole` → `employee`
  - Revision count increments

### AC3: Revision Limit Warning

- [x] **Given** revision count >= 3
- [x] **When** I view deliverables or try to request revision
- [x] **Then** I see warning: "Additional revisions may incur extra charges."

### AC4: Success Feedback

- [x] **Given** I approve all deliverables
- [x] **Then** I see success message: "Deliverables approved! Preparing for delivery."
- [x] **And** I am navigated to delivery status view

---

## 📘 Implementation

### Phase A: Backend Mutations (~2 points)

#### Task A1: Client Approve All

**File**: `convex/functions/deliverables/mutations.ts`

```typescript
export const clientApproveDeliverables = studioMutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    // 1. Verify studio owns project
    // 2. Verify project is in awaiting_review
    // 3. Transition to review_approved + delivery phase

    const project = await ctx.db.get(args.projectId);

    await ctx.db.patch(args.projectId, {
      phase: "delivery",
      actionState: "review_approved",
      awaitingActorRole: "admin",
      reviewApprovedAt: now(),
      updatedAt: now(),
    });

    // Create status history entry
    await ctx.db.insert("statusHistory", {
      projectId: args.projectId,
      previousPhase: "review",
      newPhase: "delivery",
      previousActionState: "awaiting_review",
      newActionState: "review_approved",
      changedBy: ctx.studioId,
      changedAt: now(),
      notes: "Client approved all deliverables",
    });

    return { success: true };
  },
});
```

- [ ] A1.1 Create `clientApproveDeliverables` mutation
- [ ] A1.2 Verify ownership and state
- [ ] A1.3 Transition to delivery phase
- [ ] A1.4 Record status history

#### Task A2: Client Request Revision

**File**: `convex/functions/deliverables/mutations.ts`

```typescript
export const clientRequestRevision = studioMutation({
  args: {
    projectId: v.id("projects"),
    revisionNotes: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Verify studio owns project
    // 2. Verify project is in awaiting_review
    // 3. Get or create revision count
    // 4. Transition to revisions_requested

    const project = await ctx.db.get(args.projectId);
    const currentRevisions = project.revisionCount || 0;

    await ctx.db.patch(args.projectId, {
      actionState: "revisions_requested",
      awaitingActorRole: "employee",
      awaitingActorId: project.assignedEmployeeId,
      revisionCount: currentRevisions + 1,
      updatedAt: now(),
    });

    // Create handoff log
    await ctx.db.insert("handoffLogs", {
      projectId: args.projectId,
      fromProfileId: ctx.studioId,
      toProfileId: project.assignedEmployeeId,
      fromActionState: "awaiting_review",
      toActionState: "revisions_requested",
      notes: args.revisionNotes,
      createdAt: now(),
    });

    return {
      success: true,
      revisionCount: currentRevisions + 1,
      isOverLimit: currentRevisions + 1 >= 3,
    };
  },
});
```

- [ ] A2.1 Create `clientRequestRevision` mutation
- [ ] A2.2 Increment revision count
- [ ] A2.3 Return warning flag if over limit
- [ ] A2.4 Create handoff log

---

### Phase B: UI Components (~2 points)

#### Task B1: Approval Actions Bar

**File**: `src/components/modules/studio/projects/detail/approval-actions.tsx`

```typescript
export function ApprovalActions({ projectId }: Props) {
  const project = useQuery(...);
  const approveAll = useMutation(...);
  const requestRevision = useMutation(...);

  const [showRevisionDialog, setShowRevisionDialog] = useState(false);

  return (
    <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/20">
      {/* Revision warning if applicable */}
      {project.revisionCount >= 3 && (
        <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <p className="text-xs text-amber-300">
            ⚠️ Additional revisions may incur extra charges.
          </p>
        </div>
      )}

      <div className="flex gap-4">
        <Button onClick={() => approveAll({ projectId })}>
          ✅ Approve All
        </Button>
        <Button variant="outline" onClick={() => setShowRevisionDialog(true)}>
          ↩ Request Revision
        </Button>
      </div>

      <RevisionDialog
        open={showRevisionDialog}
        onSubmit={(notes) => requestRevision({ projectId, revisionNotes: notes })}
      />
    </div>
  );
}
```

- [ ] B1.1 Create `ApprovalActions` component
- [ ] B1.2 Approve All button with mutation
- [ ] B1.3 Request Revision button with dialog
- [ ] B1.4 Revision count warning

#### Task B2: Revision Dialog

**File**: `src/components/modules/studio/projects/detail/revision-dialog.tsx`

- [ ] B2.1 Modal with textarea for notes
- [ ] B2.2 Submit/Cancel buttons
- [ ] B2.3 Loading state during submission

---

### Phase C: Schema Update (~0.5 points)

#### Task C1: Add Revision Count to Projects

**File**: `convex/schema.ts`

```typescript
projects: defineTable({
  // ... existing fields
  revisionCount: v.optional(v.number()), // NEW: Track client revisions
});
```

- [ ] C1.1 Add `revisionCount` field
- [ ] C1.2 Update queries to include field

---

## 🧪 Testing Checklist

### Approve Flow

- [ ] Approve All transitions to delivery phase
- [ ] Success toast shown
- [ ] Download links become active

### Revision Flow

- [ ] Revision modal opens
- [ ] Notes are required
- [ ] Count increments
- [ ] Warning shows at >= 3

### Edge Cases

- [ ] Can't approve if not in awaiting_review
- [ ] Can't request revision if not in awaiting_review

---

## 🚀 Definition of Done

- [ ] `clientApproveDeliverables` mutation
- [ ] `clientRequestRevision` mutation
- [ ] Revision count tracking
- [ ] Warning at >= 3 revisions
- [ ] Success/error feedback
- [ ] Story marked as `done`

---

## 🔄 Status Updates

| Date       | Status        | Notes                   |
| ---------- | ------------- | ----------------------- |
| 2026-01-18 | ready-for-dev | Story created           |
| 2026-02-04 | done          | Implementation complete |

## 🤖 Dev Agent Record

### Implementation Plan

I implemented the client-side approval and revision workflow. This includes:

1. Backend mutations for 'Approve All' and 'Request Revision'.
2. Integration of revision count tracking in the Project schema.
3. UI components for the Studio portal: `ApprovalActions` (banner with buttons) and `ClientRevisionDialog` (modal for notes).
4. Automatic phase transition to 'delivery' upon approval.

### Debug Log

- 2026-02-04: Added `revisionCount` to Project schema in `convex/schema.ts`.
- 2026-02-04: Created `clientApproveDeliverables` and `clientRequestRevision` mutations in `convex/functions/deliverables/mutations.ts`.
- 2026-02-04: Created `ApprovalActions` and `ClientRevisionDialog` in `src/components/modules/projects/detail/`.
- 2026-02-04: Integrated components into `DeliverablesSection`.

### Completion Notes

- All acceptance criteria met.
- Real-time status updates confirmed via Convex subscriptions in the banner.
- Revision limit warning (>=3) implemented in the actions bar.

---

**Previous Story**: 6-3 - Client View Approved Deliverables  
**Next Story**: 6-5 - UI Reactions for Approve/Revise Actions
